-- Privacy-safe first-party pageview analytics.
-- This table stores path, coarse device type, an anonymous session UUID, and a sanitized referrer origin.

create table if not exists public.page_views (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null,
  path text not null check (path <> '' and length(path) <= 500),
  referrer text,
  device_type text not null default 'unknown' check (device_type in ('mobile', 'tablet', 'desktop', 'unknown')),
  created_at timestamptz not null default now()
);

create index if not exists page_views_created_at_idx on public.page_views(created_at desc);
create index if not exists page_views_path_created_at_idx on public.page_views(path, created_at desc);
create index if not exists page_views_session_created_at_idx on public.page_views(session_id, created_at desc);

alter table public.page_views enable row level security;

drop policy if exists page_views_public_insert on public.page_views;
create policy page_views_public_insert on public.page_views
  for insert to anon, authenticated
  with check (
    path not like '/admin%'
    and path not like '/auth%'
    and path not like '/checkout%'
    and path not like '/units%'
    and path not like '/orders%'
    and path not like '/purchases%'
    and path not like '/_authenticated%'
  );

drop policy if exists page_views_admin_read on public.page_views;
create policy page_views_admin_read on public.page_views
  for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));
