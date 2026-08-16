-- Safe Cloud Nine catalogue seed.
-- This file intentionally contains no real account credentials or payment details.
-- Add real stock through the protected Admin > Products > Stock workflow.

insert into public.categories (id, name, slug, icon) values
  ('11111111-1111-1111-1111-111111111111', 'AI Subscriptions', 'ai-subscriptions', 'sparkles'),
  ('22222222-2222-2222-2222-222222222222', 'Design Tools', 'design-tools', 'palette'),
  ('33333333-3333-3333-3333-333333333333', 'Virtual Cards', 'virtual-cards', 'credit-card'),
  ('44444444-4444-4444-4444-444444444444', 'Streaming', 'streaming', 'play-circle')
on conflict (id) do update set name = excluded.name, slug = excluded.slug, icon = excluded.icon;

insert into public.products (id, name, description, category_id, price, what_you_get, is_active) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'AI Pro Workspace', 'A premium AI workspace subscription for writing, research and everyday productivity.', '11111111-1111-1111-1111-111111111111', 12.00, '30-day access\nFast activation after verification\nSupport from Cloud Nine', true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Design Studio Pro', 'A complete design toolkit for social graphics, presentations and brand assets.', '22222222-2222-2222-2222-222222222222', 8.00, '30-day access\nPremium templates and assets\nReplacement support for valid issues', true),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Virtual Card Starter', 'A virtual card product for eligible online purchases and subscriptions.', '33333333-3333-3333-3333-333333333333', 15.00, 'One virtual card\nActivation guidance\nUsage instructions', true),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Streaming Plus', 'A streaming subscription option for entertainment and family viewing.', '44444444-4444-4444-4444-444444444444', 10.00, '30-day access\nActivation instructions\nCustomer support', true)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  category_id = excluded.category_id,
  price = excluded.price,
  what_you_get = excluded.what_you_get,
  is_active = excluded.is_active;

-- Stock is intentionally omitted. Add real credentials only through the admin dashboard.
