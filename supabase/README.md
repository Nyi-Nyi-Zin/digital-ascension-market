# Cloud Nine Supabase setup

The application expects a Supabase project with the schema and RPC functions defined in `migrations/20260816000000_marketplace.sql`, `migrations/20260816010000_units_wallet.sql`, and `migrations/20260817000000_analytics.sql`.

## Apply the setup

Run `20260816000000_marketplace.sql` first, then `20260816010000_units_wallet.sql`, then `20260817000000_analytics.sql` in the Supabase SQL Editor. After that, run `seed.sql` to create the four categories and twenty safe catalogue products. The seed file intentionally does **not** insert credentials, stock items, Auth passwords, or payment secrets. After creating an admin user, run `admin_setup.sql` to assign the `admin` role, then add real stock through **Admin → Products → Stock**.

The application requires these client-side variables in `.env`:

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-or-publishable-key
```

The code also accepts `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` as fallbacks for local tooling. Never commit `.env` files, service-role keys, customer credentials, or payment account secrets.

## Admin account setup

Create the requested Auth user with email `admin@example.com` through Supabase Dashboard → Authentication → Users, using the password privately there. Do not commit the password to SQL, seed data, source code, or GitHub. Then run `admin_setup.sql` in the SQL Editor to create the matching profile and grant the `admin` role.

## Google OAuth setup

The app uses Supabase Auth with Google OAuth and completes the flow at `/auth/callback`. In Supabase Dashboard → Authentication → Providers → Google, enable Google and enter the Google OAuth Web Client ID and Client Secret. In Google Cloud Console, add the Supabase callback URL shown in the provider settings, normally `https://<project-ref>.supabase.co/auth/v1/callback`. In Supabase Dashboard → Authentication → URL Configuration, add the production site URL `https://digital-ascension-market.vercel.app` and the redirect URL `https://digital-ascension-market.vercel.app/auth/callback`. For local development, also add the local origin and `http://localhost:8081/auth/callback` if that is the active dev port. The application preserves a safe relative `redirect` query so a user can return to the product or protected page that initiated sign-in.

## Analytics setup

Run `20260817000000_analytics.sql` to create the privacy-safe `page_views` table. The public site records only a random anonymous session UUID, public path, coarse device type, sanitized referrer origin, and timestamp. It never records account, checkout, wallet, admin, or payment pages. Only users with the `admin` role can read analytics rows. The dashboard is available at **Admin → SEO & Analytics** and includes pageviews, unique visitors, top public pages, referrers, device mix, trends, sitemap/robots health, and a Search Console connection status placeholder. Google Search Console clicks and impressions require a separate verified Search Console property and API integration.

## Theme and payment settings

The storefront includes a persistent light/dark mode toggle. Unit top-ups use the shared payment-method configuration: **KBZPay 09675507310, account name Nyi Nyi Zin**. Customers still need to upload payment proof, and admins must approve the top-up before units are credited.

## Storage buckets

The migration creates two buckets. `product-images` is public-read and admin-write. `payment-proofs` is private; customers can upload files inside their own user-ID folder, and admins can read them through signed URLs.

## Operational flow

Product detail pages are public for browsing and search indexing. Customers must sign in only when they attempt to purchase. They first open **Buy units**, choose a USD-value unit amount, transfer the exact MMK amount at the fixed rate of **1 USD = 3,663 MMK**, and upload a transaction note and screenshot. Admins review the proof through **Admin → Unit top-ups**. Approving a top-up credits the wallet through `approve_unit_topup`; rejecting it records the reason through `reject_unit_topup`.

When a customer checks out, the `purchase_with_units` RPC atomically verifies the active product, locks one available stock item, checks and deducts the wallet balance, records a `spend` transaction, and delivers the credential. Product prices remain in USD and one unit equals one USD of product value. The old manual product-order flow remains in the schema for historical compatibility, but the live checkout now uses units.

Email notifications are not included in this repository and should be added through a trusted server-side email/Edge Function integration before launch.
