# Remix of Cloud Nine Marketplace

Build a full-stack digital products marketplace web app called "Cloud Nine". Use Lovable Cloud (Supabase) as the backend for database, authentication, storage, and edge functions.

=== APP OVERVIEW ===

"Cloud Nine" is a marketplace where customers browse and buy digital products (AI subscriptions, design tool subscriptions, virtual cards, streaming accounts, etc). Payments are verified MANUALLY by admin (local payment methods like KBZPay/WavePay/bank transfer — no automated payment gateway, no Stripe). Customer submits payment proof, admin reviews and approves/rejects it manually. After approval, the product's digital credentials (license key, login info, or download link) are automatically delivered to the customer.

=== BRANDING ===

- App name: Cloud Nine

- Use "Cloud Nine" as the text logo in header and footer (no image logo needed, styled wordmark with a small cloud icon from lucide-react)

=== DESIGN SYSTEM ===

Soft Lavender / Purple SaaS style — minimal, glassmorphism, soft gradients, heavily rounded corners.

- background: #F5F2FA

- foreground text: #17151D, secondary text: #686270, muted text: #96919F

- primary purple: #8050D0, primary-light: #A080E0, primary-dark: #7040C8

- lavender: #E0D0F0, lavender-light: #F0E0F0

- card background: white with glass effect — rgba(255,255,255,0.72), backdrop-blur-xl, border rgba(255,255,255,0.8), shadow 0 8px 30px rgba(100,70,160,0.08)

- gradient (hero/buttons): linear-gradient(135deg, #B8A0F0 0%, #8050D0 100%)

- border radius: cards 28px, buttons/inputs fully rounded (pill shape), icons circular

- font: Inter or Plus Jakarta Sans, headings weight 600-700

- soft purple-tinted shadows, generous whitespace, subtle hover lift/glow on interactive elements

=== DATABASE SCHEMA ===

- users: id, email, password (Supabase Auth), full_name, role (customer/admin), created_at

- categories: id, name, slug, icon

- products: id, name, description, category_id, price, image_url, "what_you_get" (text list), is_active, created_at

- stock_items: id, product_id, credential_data (text — license key or login info), status (available/sold), created_at

- orders: id, user_id, product_id, quantity, total_price, payment_method (kbzpay/wavepay/bank), transaction_note, payment_screenshot_url, status (pending/paid/rejected/delivered), rejection_reason (nullable), stock_item_id (nullable, filled on delivery), created_at, updated_at

Row Level Security: customers only see their own orders; admins see/manage all products, orders, stock.

=== PAGES & FLOW ===

1. HOME/LANDING PAGE

   - Sticky header: "Cloud Nine" wordmark logo (cloud icon + text) on left, nav (Products, Categories, FAQ), Sign In / Get Started buttons

   - Hero: gradient headline, subheadline, CTA buttons, trust badges (Secure Payment, Instant Delivery, 24/7 Support)

   - Category pill filter tabs (All, AI Subscriptions, Design Tools, Virtual Cards, Streaming)

   - Product grid — glass cards with icon, name, price, stock count badge, "Buy Now" button

   - How It Works (3 steps), Stats section, Testimonials, FAQ accordion, Footer (with Cloud Nine branding)

2. PRODUCT DETAIL PAGE

   - Product info, price, stock availability (live count from stock_items where status=available), "What you get" checklist, Buy Now button

3. AUTH — Sign up / Login page (email + password via Supabase Auth), glass card centered form

4. CHECKOUT FLOW (manual payment verification)

   - Order summary (product, qty, total)

   - Payment method selector (KBZPay / WavePay / Bank Transfer) — static QR code placeholder + account details for selected method

   - Input for transaction ID/note + file upload for payment screenshot (Supabase Storage)

   - "Confirm Order" button → creates order with status "pending"

   - Confirmation page: order ID, status badge "Pending Verification", note "Admin will verify your payment within [X] hours"

5. CUSTOMER DASHBOARD ("My Purchases")

   - List of logged-in user's orders as cards, status badge (pending=yellow, paid=purple, delivered=green, rejected=red)

   - Delivered orders: "View Details" reveals credential in a copyable box (from stock_items via order's stock_item_id)

   - Rejected orders: show rejection_reason if present

6. ADMIN DASHBOARD (role=admin only, protected route)

   - Sidebar: Dashboard, Products, Orders, Customers

   - Stat cards: Total Revenue, Pending Orders (needs review), Total Products, Total Customers

   - Orders table: all orders with status filter tabs, "Review" action opens modal showing payment screenshot + transaction note + Approve/Reject buttons (reject requires a reason input)

   - On Approve: edge function finds one available stock_item for that product, assigns to order, sets order status "delivered", marks stock_item "sold", sends customer email with their credentials

   - On Reject: set order status "rejected", save rejection_reason, notify customer by email

7. ADMIN PRODUCT MANAGEMENT

   - Table of products with edit/delete actions

   - "Add Product" form: name, description, category, price, image upload, "what you get" list

   - Stock management per product: textarea to bulk-add stock items (one credential per line), list showing available vs sold count

=== KEY BACKEND LOGIC (edge functions) ===

- On order approval: atomically assign one available stock_item and mark it sold (prevent double-assignment/race conditions)

- On order creation: validate stock is available before allowing checkout

- Email customer when order status changes to "delivered" or "rejected"

- RLS: customers cannot access other customers' orders

Make everything mobile-responsive with smooth transitions. Use lucide-react icons.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/480e6f8b-612e-418e-97b9-2c989bb6f4cf).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
