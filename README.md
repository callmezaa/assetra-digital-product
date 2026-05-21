# Assetra

A modern digital asset marketplace built for creators. Buy, sell, and discover premium UI kits, templates, icons, and digital resources.

---

## Tech Stack

- **Framework** — Next.js 16 (App Router)
- **Database & Auth** — Supabase (PostgreSQL + RLS)
- **Styling** — Tailwind CSS + shadcn/ui
- **Payments** — Midtrans
- **Email** — Resend
- **Animation** — Framer Motion + GSAP

## Features

- 🛒 Marketplace with server-side filtering & pagination
- 🔐 Auth with email/password and OAuth (Google, GitHub)
- 💬 Real-time chat between buyers and creators
- 💳 Integrated payment gateway (Midtrans)
- 📦 Secure file downloads via Supabase Signed URLs
- 📊 Creator wallet with earnings analytics & CSV export
- 🔔 Real-time notifications
- 🌙 Dark / Light mode
- 📈 SEO optimized — dynamic metadata & JSON-LD structured data
- ⚡ Skeleton loading states for seamless transitions

## Getting Started

**1. Clone the repository**

```bash
git clone https://github.com/callmezaa/assetra-digital-product.git
cd assetra-digital-product
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up environment variables**

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

NEXT_PUBLIC_SITE_URL=http://localhost:3000

MIDTRANS_SERVER_KEY=your_midtrans_server_key
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=your_midtrans_client_key

RESEND_API_KEY=your_resend_api_key
```

**4. Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Database Setup

Run the SQL files in your Supabase SQL Editor in this order:

1. `database.sql` — core schema
2. `database_indexes.sql` — performance indexes
3. `secure_download_setup.sql` — storage RLS policies
4. `storage_setup.sql` — storage bucket configuration

## Project Structure

```
app/
├── marketplace/       # Public product listing
├── product/[id]/      # Product detail page
├── profile/[username]/# Creator public profile
├── dashboard/         # Creator dashboard (wallet, chat, products)
├── auth/              # Login & registration
└── api/               # API routes (marketplace, download, webhooks)

components/
├── ui/                # Base UI components
└── ...                # Feature components

lib/
└── supabase/          # Supabase client helpers
```

## Deployment

Deploy to [Vercel](https://vercel.com) with one click. Make sure to add all environment variables from `.env.local` to your Vercel project settings.

---

Built with ♥ by [callmezaa](https://github.com/callmezaa)
