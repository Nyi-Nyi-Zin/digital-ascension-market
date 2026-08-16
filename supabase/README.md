# Cloud Nine Supabase setup

The application expects a Supabase project with the schema and RPC functions defined in `migrations/20260816000000_marketplace.sql` and `migrations/20260816010000_units_wallet.sql`.

## Apply the setup

Run `20260816000000_marketplace.sql` first, then `20260816010000_units_wallet.sql` in the Supabase SQL Editor. After that, run `seed.sql` to create the starter categories and catalogue products. The seed file intentionally does **not** insert credentials or payment details. After creating an admin user and assigning the `admin` role in `public.user_roles`, add real stock through **Admin → Products → Stock**.

The application requires these client-side variables in `.env`:

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-or-publishable-key
```

The code also accepts `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` as fallbacks for local tooling. Never commit `.env` files, service-role keys, customer credentials, or payment account secrets.

## Storage buckets

The migration creates two buckets. `product-images` is public-read and admin-write. `payment-proofs` is private; customers can upload files inside their own user-ID folder, and admins can read them through signed URLs.

## Operational flow

Customers must sign in before viewing a product detail page. They first open **Buy units**, choose a USD-value unit amount, transfer the exact MMK amount at the fixed rate of **1 USD = 3,663 MMK**, and upload a transaction note and screenshot. Admins review the proof through **Admin → Unit top-ups**. Approving a top-up credits the wallet through `approve_unit_topup`; rejecting it records the reason through `reject_unit_topup`.

When a customer checks out, the `purchase_with_units` RPC atomically verifies the active product, locks one available stock item, checks and deducts the wallet balance, records a `spend` transaction, and delivers the credential. Product prices remain in USD and one unit equals one USD of product value. The old manual product-order flow remains in the schema for historical compatibility, but the live checkout now uses units.

Email notifications are not included in this repository and should be added through a trusted server-side email/Edge Function integration before launch.
