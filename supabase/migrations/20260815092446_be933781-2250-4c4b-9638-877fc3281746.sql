-- ROLES
CREATE TYPE public.app_role AS ENUM ('customer','admin');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- CATEGORIES
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  icon text NOT NULL DEFAULT 'Sparkles',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories public read" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "categories admin write" ON public.categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- PRODUCTS
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  price numeric(12,2) NOT NULL DEFAULT 0,
  image_url text,
  what_you_get text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products public read" ON public.products FOR SELECT TO anon, authenticated
  USING (is_active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "products admin write" ON public.products FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- STOCK
CREATE TABLE public.stock_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  credential_data text NOT NULL,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available','sold')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX stock_items_product_status_idx ON public.stock_items(product_id, status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stock_items TO authenticated;
GRANT ALL ON public.stock_items TO service_role;
ALTER TABLE public.stock_items ENABLE ROW LEVEL SECURITY;

-- ORDERS
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  total_price numeric(12,2) NOT NULL DEFAULT 0,
  payment_method text NOT NULL CHECK (payment_method IN ('kbzpay','wavepay','bank')),
  transaction_note text,
  payment_screenshot_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','rejected','delivered')),
  rejection_reason text,
  stock_item_id uuid REFERENCES public.stock_items(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX orders_user_idx ON public.orders(user_id);
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orders own read" ON public.orders FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "orders own insert" ON public.orders FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND status = 'pending');
CREATE POLICY "orders admin update" ON public.orders FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- stock read: admin, or the buyer of the delivered order it was assigned to
CREATE POLICY "stock admin all" ON public.stock_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "stock buyer read" ON public.stock_items FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.stock_item_id = stock_items.id
      AND o.user_id = auth.uid()
      AND o.status = 'delivered'
  ));

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER orders_touch_updated_at BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- public stock counts (no credentials exposed)
CREATE OR REPLACE FUNCTION public.get_stock_counts()
RETURNS TABLE(product_id uuid, available_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT s.product_id, count(*)::bigint
  FROM public.stock_items s
  WHERE s.status = 'available'
  GROUP BY s.product_id;
$$;
GRANT EXECUTE ON FUNCTION public.get_stock_counts() TO anon, authenticated;

-- atomic approval + delivery
CREATE OR REPLACE FUNCTION public.approve_order(p_order_id uuid)
RETURNS TABLE(order_id uuid, stock_item_id uuid)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_order public.orders; v_stock uuid;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN
    RAISE EXCEPTION 'Only admins can approve orders';
  END IF;
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF v_order.id IS NULL THEN RAISE EXCEPTION 'Order not found'; END IF;
  IF v_order.status = 'delivered' THEN RAISE EXCEPTION 'Order already delivered'; END IF;

  SELECT s.id INTO v_stock FROM public.stock_items s
  WHERE s.product_id = v_order.product_id AND s.status = 'available'
  ORDER BY s.created_at
  FOR UPDATE SKIP LOCKED
  LIMIT 1;

  IF v_stock IS NULL THEN RAISE EXCEPTION 'No stock available for this product'; END IF;

  UPDATE public.stock_items SET status = 'sold' WHERE id = v_stock;
  UPDATE public.orders SET status = 'delivered', stock_item_id = v_stock, rejection_reason = NULL
  WHERE id = p_order_id;

  RETURN QUERY SELECT p_order_id, v_stock;
END; $$;
GRANT EXECUTE ON FUNCTION public.approve_order(uuid) TO authenticated;

-- admin stats
CREATE OR REPLACE FUNCTION public.admin_stats()
RETURNS json LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE result json;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
  SELECT json_build_object(
    'revenue', COALESCE((SELECT sum(total_price) FROM public.orders WHERE status = 'delivered'),0),
    'pending', (SELECT count(*) FROM public.orders WHERE status = 'pending'),
    'products', (SELECT count(*) FROM public.products),
    'customers', (SELECT count(*) FROM public.profiles)
  ) INTO result;
  RETURN result;
END; $$;
GRANT EXECUTE ON FUNCTION public.admin_stats() TO authenticated;

-- SEED
INSERT INTO public.categories (name, slug, icon) VALUES
  ('AI Subscriptions','ai-subscriptions','Sparkles'),
  ('Design Tools','design-tools','PenTool'),
  ('Virtual Cards','virtual-cards','CreditCard'),
  ('Streaming','streaming','Play');

INSERT INTO public.products (name, description, category_id, price, what_you_get, is_active) VALUES
  ('ChatGPT Plus — 1 Month','Full GPT-5 access with priority speed on a private shared-free account.',(SELECT id FROM public.categories WHERE slug='ai-subscriptions'),25.00,E'Private account login\n1 month full access\nGPT-5 + advanced voice\nInstant email delivery\nReplacement warranty',true),
  ('Claude Pro — 1 Month','Anthropic Claude Pro with 5x usage limits and priority access.',(SELECT id FROM public.categories WHERE slug='ai-subscriptions'),22.00,E'Claude Pro account\n5x higher usage limits\nProjects & artifacts\n30-day warranty',true),
  ('Canva Pro — 1 Year','Canva Pro team invite with all premium templates and assets unlocked.',(SELECT id FROM public.categories WHERE slug='design-tools')::uuid,12.00,E'1 year Pro access\n100M+ premium assets\nBackground remover\nBrand kit & Magic Studio',true),
  ('Figma Professional Seat','Professional seat on a shared org for unlimited files and version history.',(SELECT id FROM public.categories WHERE slug='design-tools'),18.00,E'Unlimited Figma files\nUnlimited version history\nShared team libraries\nDev mode access',true),
  ('Virtual Visa Card — $20','Prepaid virtual Visa usable for online subscriptions worldwide.',(SELECT id FROM public.categories WHERE slug='virtual-cards'),24.00,E'Card number, CVV, expiry\n$20 preloaded balance\nWorks globally online\nNo monthly fee',true),
  ('Netflix Premium — 1 Month','4K UHD profile on a premium Netflix plan.',(SELECT id FROM public.categories WHERE slug='streaming'),9.00,E'4K UHD streaming\nPrivate profile with PIN\n1 month access\nInstant delivery',true),
  ('Spotify Premium — 3 Months','Ad-free music with offline downloads for three months.',(SELECT id FROM public.categories WHERE slug='streaming'),15.00,E'Ad-free listening\nOffline downloads\n3 months access\nWorks on all devices',true);

INSERT INTO public.stock_items (product_id, credential_data)
SELECT p.id, 'Email: user' || g || '@cloudnine.mail' || E'\nPassword: CN9-' || substr(md5(random()::text),1,10)
FROM public.products p CROSS JOIN generate_series(1,5) g;