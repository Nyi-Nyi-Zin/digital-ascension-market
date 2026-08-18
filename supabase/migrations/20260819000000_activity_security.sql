-- Cloud Nine activity telemetry and security audit trail.
-- Keep the database aligned with the four local payment methods shown in the UI.
alter table if exists public.unit_topups drop constraint if exists unit_topups_payment_method_check;
alter table if exists public.unit_topups add constraint unit_topups_payment_method_check
  check (payment_method in ('kbzpay', 'wavepay', 'ayapay', 'uabpay', 'bank'));
alter table if exists public.orders drop constraint if exists orders_payment_method_check;
alter table if exists public.orders add constraint orders_payment_method_check
  check (payment_method in ('kbzpay', 'wavepay', 'ayapay', 'uabpay', 'bank', 'units'));

-- Activity events are user-visible behavior signals and may be client-submitted.
-- Admin audit rows are written only by database triggers and are never client-writable.

create or replace function public.admin_stats()
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'Only admins can view admin statistics';
  end if;
  return (
    select json_build_object(
      'total_revenue', coalesce((select sum(total_price) from public.orders where status in ('paid', 'delivered')), 0),
      'pending_orders', (select count(*) from public.orders where status = 'pending'),
      'total_products', (select count(*) from public.products where is_active = true),
      'total_customers', (select count(*) from public.profiles)
    )
  );
end;
$$;
revoke all on function public.admin_stats() from public;
grant execute on function public.admin_stats() to authenticated;

create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  session_id uuid not null,
  event_name text not null check (event_name in (
    'page_view', 'signed_in', 'signed_out', 'product_view',
    'checkout_attempt', 'topup_submitted', 'purchase_delivered'
  )),
  path text not null check (path <> '' and length(path) <= 200),
  metadata jsonb not null default '{}'::jsonb check (
    jsonb_typeof(metadata) = 'object' and length(metadata::text) <= 2000
  ),
  created_at timestamptz not null default now()
);

create index if not exists activity_events_created_at_idx
  on public.activity_events(created_at desc);
create index if not exists activity_events_user_created_idx
  on public.activity_events(user_id, created_at desc);
create index if not exists activity_events_name_created_idx
  on public.activity_events(event_name, created_at desc);

alter table public.activity_events enable row level security;

drop policy if exists activity_events_client_insert on public.activity_events;
create policy activity_events_client_insert on public.activity_events
  for insert to anon, authenticated
  with check (
    (user_id is null or user_id = auth.uid())
    and event_name in (
      'page_view', 'signed_in', 'signed_out', 'product_view',
      'checkout_attempt', 'topup_submitted', 'purchase_delivered'
    )
  );

drop policy if exists activity_events_admin_read on public.activity_events;
create policy activity_events_admin_read on public.activity_events
  for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  target_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_log_created_at_idx
  on public.admin_audit_log(created_at desc);
create index if not exists admin_audit_log_target_created_idx
  on public.admin_audit_log(target_user_id, created_at desc);
create index if not exists admin_audit_log_entity_created_idx
  on public.admin_audit_log(entity_type, entity_id, created_at desc);

alter table public.admin_audit_log enable row level security;

drop policy if exists admin_audit_log_admin_read on public.admin_audit_log;
create policy admin_audit_log_admin_read on public.admin_audit_log
  for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create or replace function public.log_order_admin_audit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status is distinct from new.status
     or old.rejection_reason is distinct from new.rejection_reason
     or old.stock_item_id is distinct from new.stock_item_id then
    insert into public.admin_audit_log(
      actor_user_id, target_user_id, action, entity_type, entity_id, metadata
    ) values (
      auth.uid(), new.user_id, 'order_changed', 'order', new.id,
      jsonb_build_object(
        'from_status', old.status,
        'to_status', new.status,
        'has_rejection_reason', new.rejection_reason is not null,
        'has_stock_item', new.stock_item_id is not null
      )
    );
  end if;
  return new;
end;
$$;

drop trigger if exists orders_admin_audit on public.orders;
create trigger orders_admin_audit
after update on public.orders
for each row execute function public.log_order_admin_audit();

create or replace function public.log_topup_admin_audit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status is distinct from new.status
     or old.rejection_reason is distinct from new.rejection_reason then
    insert into public.admin_audit_log(
      actor_user_id, target_user_id, action, entity_type, entity_id, metadata
    ) values (
      auth.uid(), new.user_id, 'topup_changed', 'unit_topup', new.id,
      jsonb_build_object(
        'from_status', old.status,
        'to_status', new.status,
        'has_rejection_reason', new.rejection_reason is not null
      )
    );
  end if;
  return new;
end;
$$;

drop trigger if exists unit_topups_admin_audit on public.unit_topups;
create trigger unit_topups_admin_audit
after update on public.unit_topups
for each row execute function public.log_topup_admin_audit();

revoke all on table public.admin_audit_log from anon, authenticated;
grant select on table public.admin_audit_log to authenticated;
revoke all on table public.activity_events from public;
grant insert on table public.activity_events to anon, authenticated;
grant select on table public.activity_events to authenticated;
