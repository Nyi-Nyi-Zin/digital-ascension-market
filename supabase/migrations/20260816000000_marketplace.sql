-- Cloud Nine marketplace database setup
-- Apply this migration in the connected Supabase project before using checkout/admin flows.
-- No payment credentials or customer secrets belong in this file.

create extension if not exists pgcrypto;

do $$ begin
  create type public.app_role as enum ('customer', 'admin');
exception when duplicate_object then null;
end $$;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  icon text not null default 'sparkles',
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  category_id uuid references public.categories(id) on delete set null,
  price numeric(12,2) not null default 0 check (price >= 0),
  image_url text,
  what_you_get text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.stock_items (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  credential_data text not null,
  status text not null default 'available' check (status in ('available', 'sold')),
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null default 'customer',
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null default 1 check (quantity = 1),
  total_price numeric(12,2) not null check (total_price >= 0),
  payment_method text not null check (payment_method in ('kbzpay', 'wavepay', 'bank')),
  transaction_note text,
  payment_screenshot_url text,
  status text not null default 'pending' check (status in ('pending', 'paid', 'rejected', 'delivered')),
  rejection_reason text,
  stock_item_id uuid references public.stock_items(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_id_idx on public.products(category_id);
create index if not exists stock_items_product_status_idx on public.stock_items(product_id, status);
create index if not exists orders_user_id_created_at_idx on public.orders(user_id, created_at desc);
create index if not exists orders_status_created_at_idx on public.orders(status, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$ begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

create or replace function public.get_stock_counts()
returns table(product_id uuid, available_count bigint)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, count(si.id)::bigint
  from public.products p
  left join public.stock_items si
    on si.product_id = p.id and si.status = 'available'
  where p.is_active = true
  group by p.id;
$$;

create or replace function public.approve_order(p_order_id uuid)
returns table(order_id uuid, stock_item_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_order public.orders%rowtype;
  selected_stock public.stock_items%rowtype;
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'Only admins can approve orders';
  end if;

  select * into selected_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Order not found';
  end if;
  if selected_order.status <> 'pending' then
    raise exception 'Only pending orders can be approved';
  end if;

  select * into selected_stock
  from public.stock_items
  where product_id = selected_order.product_id
    and status = 'available'
  order by created_at, id
  for update skip locked
  limit 1;

  if not found then
    raise exception 'No available stock for this product';
  end if;

  update public.stock_items
  set status = 'sold'
  where id = selected_stock.id;

  update public.orders
  set status = 'delivered', stock_item_id = selected_stock.id
  where id = selected_order.id;

  return query select selected_order.id, selected_stock.id;
end $$;

create or replace function public.admin_stats()
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'total_revenue', coalesce((select sum(total_price) from public.orders where status in ('paid', 'delivered')), 0),
    'pending_orders', (select count(*) from public.orders where status = 'pending'),
    'total_products', (select count(*) from public.products where is_active = true),
    'total_customers', (select count(*) from public.profiles)
  );
$$;

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.stock_items enable row level security;
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.orders enable row level security;

drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories for select using (true);
drop policy if exists categories_admin_write on public.categories;
create policy categories_admin_write on public.categories for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products for select using (is_active = true or public.has_role(auth.uid(), 'admin'));
drop policy if exists products_admin_write on public.products;
create policy products_admin_write on public.products for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists stock_admin_read on public.stock_items;
create policy stock_admin_read on public.stock_items for select using (public.has_role(auth.uid(), 'admin'));
drop policy if exists stock_admin_write on public.stock_items;
create policy stock_admin_write on public.stock_items for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists profiles_self_or_admin_read on public.profiles;
create policy profiles_self_or_admin_read on public.profiles for select using (id = auth.uid() or public.has_role(auth.uid(), 'admin'));
drop policy if exists profiles_self_write on public.profiles;
create policy profiles_self_write on public.profiles for insert with check (id = auth.uid());
drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists roles_self_or_admin_read on public.user_roles;
create policy roles_self_or_admin_read on public.user_roles for select using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
drop policy if exists roles_admin_write on public.user_roles;
create policy roles_admin_write on public.user_roles for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists orders_self_insert on public.orders;
create policy orders_self_insert on public.orders for insert with check (user_id = auth.uid() and status = 'pending' and quantity = 1);
drop policy if exists orders_self_read on public.orders;
create policy orders_self_read on public.orders for select using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
drop policy if exists orders_admin_update on public.orders;
create policy orders_admin_update on public.orders for update using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true), ('payment-proofs', 'payment-proofs', false)
on conflict (id) do update set public = excluded.public;

drop policy if exists product_images_public_read on storage.objects;
create policy product_images_public_read on storage.objects for select using (bucket_id = 'product-images');
drop policy if exists product_images_admin_insert on storage.objects;
create policy product_images_admin_insert on storage.objects for insert with check (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));
drop policy if exists product_images_admin_update on storage.objects;
create policy product_images_admin_update on storage.objects for update using (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin')) with check (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));
drop policy if exists product_images_admin_delete on storage.objects;
create policy product_images_admin_delete on storage.objects for delete using (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));

drop policy if exists payment_proofs_owner_insert on storage.objects;
create policy payment_proofs_owner_insert on storage.objects for insert with check (
  bucket_id = 'payment-proofs'
  and (storage.foldername(name))[1] = auth.uid()::text
);
drop policy if exists payment_proofs_owner_read on storage.objects;
create policy payment_proofs_owner_read on storage.objects for select using (
  bucket_id = 'payment-proofs'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.has_role(auth.uid(), 'admin'))
);
drop policy if exists payment_proofs_admin_delete on storage.objects;
create policy payment_proofs_admin_delete on storage.objects for delete using (bucket_id = 'payment-proofs' and public.has_role(auth.uid(), 'admin'));
