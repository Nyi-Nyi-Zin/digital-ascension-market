# Cloud Nine Supabase setup

The application expects a Supabase project with the schema and RPC functions defined in `migrations/20260816000000_marketplace.sql`.

## Apply the setup

Run the migration in the Supabase SQL Editor, then run `seed.sql` to create the starter categories and catalogue products. The seed file intentionally does **not** insert credentials or payment details. After creating an admin user and assigning the `admin` role in `public.user_roles`, add real stock through **Admin → Products → Stock**.

The application requires these client-side variables in `.env`:

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-or-publishable-key
```

The code also accepts `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` as fallbacks for local tooling. Never commit `.env` files, service-role keys, customer credentials, or payment account secrets.

## Storage buckets

The migration creates two buckets. `product-images` is public-read and admin-write. `payment-proofs` is private; customers can upload files inside their own user-ID folder, and admins can read them through signed URLs.

## Operational flow

Customers create pending orders after selecting a manual payment method, entering a transaction note, and uploading a screenshot. Admins review the proof and call `approve_order`, which atomically claims the oldest available stock item and marks the order as delivered. Rejected orders retain the admin's reason. Email notifications are not included in this repository and should be added through a trusted server-side email/Edge Function integration before launch.
