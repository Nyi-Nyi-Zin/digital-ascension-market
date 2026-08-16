-- Safe Cloud Nine catalogue seed.
-- This file contains product catalogue metadata only. It intentionally contains
-- no real account credentials, payment secrets, or stock items.
-- Add real credentials through the protected Admin > Products > Stock workflow.

insert into public.categories (id, name, slug, icon) values
  ('11111111-1111-1111-1111-111111111111', 'AI Subscriptions', 'ai-subscriptions', 'sparkles'),
  ('22222222-2222-2222-2222-222222222222', 'Design Tools', 'design-tools', 'palette'),
  ('33333333-3333-3333-3333-333333333333', 'Virtual Cards', 'virtual-cards', 'credit-card'),
  ('44444444-4444-4444-4444-444444444444', 'Streaming', 'streaming', 'play-circle')
on conflict (id) do update set name = excluded.name, slug = excluded.slug, icon = excluded.icon;

insert into public.products (id, name, description, category_id, price, what_you_get, is_active) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ChatGPT Plus 1 Month', 'AI assistant subscription for writing, research, coding and everyday productivity.', '11111111-1111-1111-1111-111111111111', 20.00, '30-day access\nActivation guidance\nCloud Nine support', true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Gemini Pro 1 Month', 'AI workspace subscription for research, writing and creative productivity.', '11111111-1111-1111-1111-111111111111', 18.00, '30-day access\nActivation guidance\nCloud Nine support', true),
  ('c1111111-1111-4111-8111-111111111111', 'Claude Pro 1 Month', 'AI assistant plan for long-form writing, analysis and coding workflows.', '11111111-1111-1111-1111-111111111111', 18.00, '30-day access\nActivation guidance\nCloud Nine support', true),
  ('c2222222-2222-4222-8222-222222222222', 'Perplexity Pro 1 Month', 'AI research subscription with advanced search and answer workflows.', '11111111-1111-1111-1111-111111111111', 15.00, '30-day access\nActivation guidance\nCloud Nine support', true),
  ('c3333333-3333-4333-8333-333333333333', 'Microsoft Copilot Pro 1 Month', 'AI productivity access for writing, planning and everyday work.', '11111111-1111-1111-1111-111111111111', 15.00, '30-day access\nActivation guidance\nCloud Nine support', true),
  ('d1111111-1111-4111-8111-111111111111', 'Canva Pro 1 Month', 'Premium design toolkit for social graphics, presentations and brand assets.', '22222222-2222-2222-2222-222222222222', 8.00, '30-day access\nPremium templates\nActivation guidance', true),
  ('d2222222-2222-4222-8222-222222222222', 'Adobe Creative Cloud 1 Month', 'Creative software subscription for image, video and design projects.', '22222222-2222-2222-2222-222222222222', 25.00, '30-day access\nActivation guidance\nCloud Nine support', true),
  ('d3333333-3333-4333-8333-333333333333', 'CapCut Pro 1 Month', 'Video editing tools and premium effects for creators.', '22222222-2222-2222-2222-222222222222', 7.00, '30-day access\nActivation guidance\nCloud Nine support', true),
  ('d4444444-4444-4444-8444-444444444444', 'Freepik Premium 1 Month', 'Premium stock assets, templates and creative resources.', '22222222-2222-2222-2222-222222222222', 9.00, '30-day access\nPremium asset access\nActivation guidance', true),
  ('d5555555-5555-4555-8555-555555555555', 'Envato Elements 1 Month', 'Creative asset library for design, video, web and presentation work.', '22222222-2222-2222-2222-222222222222', 12.00, '30-day access\nAsset library access\nActivation guidance', true),
  ('d6666666-6666-4666-8666-666666666666', 'Midjourney Basic 1 Month', 'AI image creation plan for visual concepts and creative exploration.', '22222222-2222-2222-2222-222222222222', 12.00, '30-day access\nActivation guidance\nCloud Nine support', true),
  ('e1111111-1111-4111-8111-111111111111', 'Virtual Card Starter', 'Virtual card product for eligible online purchases and subscriptions.', '33333333-3333-3333-3333-333333333333', 15.00, 'One virtual card\nActivation guidance\nUsage instructions', true),
  ('e2222222-2222-4222-8222-222222222222', 'Virtual Card Plus', 'Higher-value virtual card option for eligible digital purchases.', '33333333-3333-3333-3333-333333333333', 25.00, 'One virtual card\nActivation guidance\nUsage instructions', true),
  ('e3333333-3333-4333-8333-333333333333', 'Email Account 2FA Enabled', 'Email account option with two-factor authentication setup guidance.', '33333333-3333-3333-3333-333333333333', 4.00, 'One account\n2FA setup guidance\nReplacement support for valid issues', true),
  ('e4444444-4444-4444-8444-444444444444', 'Office 365 Personal 1 Month', 'Productivity suite access for documents, spreadsheets and everyday work.', '33333333-3333-3333-3333-333333333333', 10.00, '30-day access\nActivation guidance\nCloud Nine support', true),
  ('f1111111-1111-4111-8111-111111111111', 'Netflix Standard 1 Month', 'Streaming subscription option for entertainment and family viewing.', '44444444-4444-4444-4444-444444444444', 10.00, '30-day access\nActivation instructions\nCustomer support', true),
  ('f2222222-2222-4222-8222-222222222222', 'Spotify Premium 1 Month', 'Music streaming subscription with premium listening features.', '44444444-4444-4444-4444-444444444444', 8.00, '30-day access\nActivation instructions\nCustomer support', true),
  ('f3333333-3333-4333-8333-333333333333', 'YouTube Premium 1 Month', 'Video and music streaming access with premium features.', '44444444-4444-4444-4444-444444444444', 9.00, '30-day access\nActivation instructions\nCustomer support', true),
  ('f4444444-4444-4444-8444-444444444444', 'Disney+ 1 Month', 'Streaming subscription option for movies, series and family entertainment.', '44444444-4444-4444-4444-444444444444', 9.00, '30-day access\nActivation instructions\nCustomer support', true),
  ('f5555555-5555-4555-8555-555555555555', 'ExpressVPN 1 Month', 'VPN subscription option for privacy and secure browsing workflows.', '44444444-4444-4444-4444-444444444444', 10.00, '30-day access\nActivation instructions\nCustomer support', true)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  category_id = excluded.category_id,
  price = excluded.price,
  what_you_get = excluded.what_you_get,
  is_active = excluded.is_active;

-- Stock is intentionally omitted. Add real credentials only through the admin dashboard.
