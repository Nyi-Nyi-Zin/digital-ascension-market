-- Safe admin-role bootstrap for Cloud Nine.
-- First create the Auth user through Supabase Dashboard > Authentication > Users
-- using the desired email and password. Do not place the password in git or SQL files.
-- Then run this script in the Supabase SQL Editor.

insert into public.profiles (id, email)
select id, email
from auth.users
where lower(email) = lower('admin@example.com')
on conflict (id) do update set email = excluded.email;

insert into public.user_roles (user_id, role)
select id, 'admin'::public.app_role
from auth.users
where lower(email) = lower('admin@example.com')
on conflict (user_id, role) do nothing;

-- Verify the role assignment:
-- select u.email, r.role
-- from auth.users u
-- join public.user_roles r on r.user_id = u.id
-- where lower(u.email) = lower('admin@example.com');
