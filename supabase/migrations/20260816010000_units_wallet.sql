-- Cloud Nine wallet and unit payments.
-- Apply this migration in Supabase SQL Editor after 20260816000000_marketplace.sql.
-- 1 unit represents 1 USD of product value. The fixed top-up rate is 1 USD = 3,663 MMK.

create table if not exists public.unit_balances (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance numeric(12,2) not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.unit_topups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  unit_amount numeric(12,2) not null check (unit_amount > 0),
  mmk_amount numeric(12,2) not null check (mmk_amount > 0),
  exchange_rate numeric(12,2) not null default 3663 check (exchange_rate = 3663),
  payment_method text not null check (payment_method in ('kbzpay', 'wavepay', 'bank')),
  transaction_note text not null,
  payment_screenshot_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.unit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(12,2) not null check (amount <> 0),
  type text not null check (type in ('purchase', 'spend', 'refund')),
  reference_id uuid,
  mmk_amount numeric(12,2),
  usd_amount numeric(12,2),
  created_at timestamptz not null default now()
);

do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'unit_topups_mmk_rate_check'
      and conrelid = 'public.unit_topups'::regclass
  ) then
    alter table public.unit_topups add constraint unit_topups_mmk_rate_check
      check (mmk_amount = round(unit_amount * exchange_rate));
  end if;
end $$;

alter table public.orders drop constraint if exists orders_payment_method_check;
do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'orders_payment_method_check'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders add constraint orders_payment_method_check
      check (payment_method in ('kbzpay', 'wavepay', 'bank', 'units'));
  end if;
end $$;

-- Keep direct customer inserts limited to the legacy manual-review methods.
-- Unit purchases must use purchase_with_units so balance and stock are atomic.
 drop policy if exists orders_self_insert on public.orders;
 create policy orders_self_insert on public.orders for insert with check (
   user_id = auth.uid()
   and status = 'pending'
   and quantity = 1
   and payment_method in ('kbzpay', 'wavepay', 'bank')
 );

create index if not exists unit_topups_user_created_idx
  on public.unit_topups(user_id, created_at desc);
create index if not exists unit_topups_status_created_idx
  on public.unit_topups(status, created_at desc);
create index if not exists unit_transactions_user_created_idx
  on public.unit_transactions(user_id, created_at desc);

create or replace function public.set_unit_topup_updated_at()
returns trigger
language plpgsql
as $$ begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists unit_topups_set_updated_at on public.unit_topups;
create trigger unit_topups_set_updated_at
before update on public.unit_topups
for each row execute function public.set_unit_topup_updated_at();

create or replace function public.approve_unit_topup(p_topup_id uuid)
returns table(topup_id uuid, new_balance numeric)
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_topup public.unit_topups%rowtype;
  resulting_balance numeric(12,2);
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'Only admins can approve unit top-ups';
  end if;

  select * into selected_topup
  from public.unit_topups
  where id = p_topup_id
  for update;

  if not found then
    raise exception 'Unit top-up not found';
  end if;
  if selected_topup.status <> 'pending' then
    raise exception 'Only pending unit top-ups can be approved';
  end if;

  insert into public.unit_balances(user_id, balance)
  values (selected_topup.user_id, selected_topup.unit_amount)
  on conflict (user_id) do update
    set balance = public.unit_balances.balance + excluded.balance,
        updated_at = now()
  returning balance into resulting_balance;

  insert into public.unit_transactions(
    user_id, amount, type, reference_id, mmk_amount, usd_amount
  ) values (
    selected_topup.user_id,
    selected_topup.unit_amount,
    'purchase',
    selected_topup.id,
    selected_topup.mmk_amount,
    selected_topup.unit_amount
  );

  update public.unit_topups
  set status = 'approved'
  where id = selected_topup.id;

  return query select selected_topup.id, resulting_balance;
end $$;

create or replace function public.reject_unit_topup(p_topup_id uuid, p_reason text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'Only admins can reject unit top-ups';
  end if;

  update public.unit_topups
  set status = 'rejected',
      rejection_reason = nullif(trim(p_reason), '')
  where id = p_topup_id and status = 'pending';

  if not found then
    raise exception 'Only pending unit top-ups can be rejected';
  end if;
end $$;

create or replace function public.purchase_with_units(p_product_id uuid)
returns table(order_id uuid, new_balance numeric)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  selected_product public.products%rowtype;
  selected_stock public.stock_items%rowtype;
  current_balance numeric(12,2);
  created_order_id uuid;
  resulting_balance numeric(12,2);
begin
  if current_user_id is null then
    raise exception 'You must be signed in to purchase with units';
  end if;

  select * into selected_product
  from public.products
  where id = p_product_id and is_active = true;

  if not found then
    raise exception 'Product not found or unavailable';
  end if;

  insert into public.unit_balances(user_id, balance)
  values (current_user_id, 0)
  on conflict (user_id) do nothing;

  select balance into current_balance
  from public.unit_balances
  where user_id = current_user_id
  for update;

  if current_balance < selected_product.price then
    raise exception 'Insufficient units. Add more units before purchasing this product.';
  end if;

  select * into selected_stock
  from public.stock_items
  where product_id = selected_product.id and status = 'available'
  order by created_at, id
  for update skip locked
  limit 1;

  if not found then
    raise exception 'No available stock for this product';
  end if;

  insert into public.orders(
    user_id, product_id, quantity, total_price, payment_method,
    transaction_note, status, stock_item_id
  ) values (
    current_user_id, selected_product.id, 1, selected_product.price, 'units',
    'Paid with Cloud Nine units', 'delivered', selected_stock.id
  ) returning id into created_order_id;

  update public.stock_items
  set status = 'sold'
  where id = selected_stock.id;

  update public.unit_balances
  set balance = balance - selected_product.price,
      updated_at = now()
  where user_id = current_user_id
  returning balance into resulting_balance;

  insert into public.unit_transactions(
    user_id, amount, type, reference_id, usd_amount
  ) values (
    current_user_id,
    -selected_product.price,
    'spend',
    created_order_id,
    selected_product.price
  );

  return query select created_order_id, resulting_balance;
end $$;

alter table public.unit_balances enable row level security;
alter table public.unit_topups enable row level security;
alter table public.unit_transactions enable row level security;

drop policy if exists unit_balances_self_read on public.unit_balances;
create policy unit_balances_self_read on public.unit_balances
  for select using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

drop policy if exists unit_topups_self_insert on public.unit_topups;
create policy unit_topups_self_insert on public.unit_topups
  for insert with check (
    user_id = auth.uid()
    and status = 'pending'
    and exchange_rate = 3663
  );
drop policy if exists unit_topups_self_or_admin_read on public.unit_topups;
create policy unit_topups_self_or_admin_read on public.unit_topups
  for select using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
drop policy if exists unit_topups_admin_update on public.unit_topups;
create policy unit_topups_admin_update on public.unit_topups
  for update using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists unit_transactions_self_or_admin_read on public.unit_transactions;
create policy unit_transactions_self_or_admin_read on public.unit_transactions
  for select using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

grant execute on function public.approve_unit_topup(uuid) to authenticated;
grant execute on function public.reject_unit_topup(uuid, text) to authenticated;
grant execute on function public.purchase_with_units(uuid) to authenticated;
revoke all on function public.approve_unit_topup(uuid) from public;
revoke all on function public.reject_unit_topup(uuid, text) from public;
revoke all on function public.purchase_with_units(uuid) from public;
