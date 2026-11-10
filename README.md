# Femme Beauty — website, booking engine & studio dashboard

A complete, self-owned web presence for **Femme Beauty** (16 Shiro Street, Ajib, Fadeyi, Lagos):

- A public storefront for wigs, raw hair, nails, lashes and accessories — orders close on WhatsApp.
- A real booking engine for hair, nail, lash, gele and makeup appointments, with live availability and conflict-safe slots.
- A **custom request** path: customers describe what they want (hair making, fixing, gele, nails…), the studio quotes it, then takes a deposit.
- A studio dashboard for the calendar, appointments, quotes, deposits, services, products, customers and reports.
- Mobile-first layouts with swipeable product, lookbook, review and related-item rows.
- No SaaS subscription for the booking layer. The data is yours, in one SQLite file (or Postgres when deployed).

---

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript | One codebase for site, admin and API; fast, SEO-friendly |
| Styling | Tailwind CSS v4 | Design tokens in `src/app/globals.css` |
| Database | Prisma + SQLite (dev) → Postgres (production) | Zero-setup locally, one-line provider switch later |
| Auth | Signed httpOnly session cookie + bcrypt | No third-party auth dependency |
| Validation | Hand-rolled guards + `zod` available | Small surface area, clear error messages |
| Icons / fonts | lucide-react; Cormorant Garamond, Jost, Parisienne via `next/font` | Editorial look matching the rose-gold brand |

---

## Quick start (Windows)

```powershell
cd femme-beauty
Copy-Item .env.example .env   # then edit it: AUTH_SECRET + ADMIN_PASSWORD
npm install                   # first time only
npm run db:generate           # first time only (Prisma client)
npm run db:push               # create/update the SQLite schema
npm run db:seed               # seed services, products, settings, demo bookings
npm run dev                   # http://localhost:3000
```

Admin: <http://localhost:3000/admin> — sign in with the `ADMIN_EMAIL` and `ADMIN_PASSWORD` you put
in `.env`. `.env` is git-ignored and is never pushed.

**Change that password before the site is public:**

```powershell
npm run password -- "Your-New-Strong-Password"
```

The site and the dashboard are the same dev server — no separate admin app to run.

### Useful scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` / `npm start` | Production build and serve |
| `npm run db:push` | Apply schema changes to the database |
| `npm run db:seed` | Seed initial data (safe to re-run; it won't overwrite edits) |
| `npm run db:init` | One-time hosted Postgres setup: schema push + seed (needs `DATABASE_URL`) |
| `npm run db:studio` | Prisma Studio — a spreadsheet-like view of every table |
| `npm run password -- "new-pass"` | Reset the admin password |

---

## Project map

```
prisma/
  schema.prisma          Data model (11 tables)
  seed.ts                Femme Beauty menu, products, settings, demo bookings
src/
  app/
    (site)/              Public website (home, shop, services, book, gallery, about, contact, policies)
    admin/
      login/             Sign-in screen (outside the auth guard)
      (dashboard)/       Guarded admin: dashboard, calendar, appointments, services, products,
                         orders, customers, outbox, settings, reports
      actions.ts         Every server action (auth + all mutations)
    api/
      availability/      GET real slots for a service + date
      book/              POST create an appointment (double-booking safe)
      order-intent/      POST log a WhatsApp product enquiry
      ics/[reference]/   Downloadable calendar invite
  components/
    site/                Header, Footer, ProductArt, OrderPanel, BookingFlow
    admin/               AdminShell, forms, badges, stat cards
  lib/
    booking.ts           Slot generation, availability, booking creation
    time.ts              Lagos-time conversions (UTC+1, no DST)
    auth.ts              Session signing/verification
    settings.ts          Business settings with defaults
    notify.ts            Outbox message templates
    content.ts           Category blurbs, gallery, FAQs, policies
```

---

## How booking works (the important part)

1. A service has a **duration** and an optional **buffer** after it.
2. Weekly **availability ranges** (Settings → Opening hours) define working windows.
3. Slots are generated in **30-minute steps**, 90 minutes minimum lead time, up to 60 days ahead.
4. Existing appointments block their window **plus the buffer**; time off blocks too.
5. A new booking is created as `PENDING` and holds its slot for the configured **hold window** (default 120 minutes). Expired holds release automatically the next time the calendar is read.
6. Creating a booking re-checks the slot inside a **transaction**, so two customers can never take the same time.
7. Status flow: `PENDING → AWAITING_DEPOSIT → CONFIRMED → COMPLETED` (or `CANCELLED` / `NO_SHOW`).

All times are stored as UTC instants and displayed in **Africa/Lagos (WAT)**. The conversion lives in `src/lib/time.ts` — the server can be anywhere in the world.

---

## Environment

`.env` (already created, never commit it):

| Key | Purpose |
|---|---|
| `DATABASE_URL` | `file:./dev.db` locally; a Postgres URL in production |
| `AUTH_SECRET` | Signs admin session cookies — replace with a long random string in production |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Used only by the seed script |
| `BUSINESS_PHONE` | Convenience value for scripts |

`.env.example` lists the same keys without secrets.

---

## Going live on Vercel

The repository is already set up for this. Locally it runs on SQLite; on Vercel the build script
(`scripts/build.mjs`) detects `VERCEL` and generates a PostgreSQL client from the same schema.

1. **Database** — in Vercel, open **Storage / Integrations → Prisma Postgres** and connect it to the
   project. In the “Custom Prefix” box type `DATABASE` so the generated variable is `DATABASE_URL`
   (the name the app reads). If it was created as `STORAGE_URL`, rename the variable in
   **Project → Settings → Environment Variables**.
2. **Environment variables** — add at least:

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | from the Prisma Postgres integration |
   | `AUTH_SECRET` | a fresh 64-character random string |
   | `ADMIN_EMAIL` | `femmebeautybysyl@gmail.com` |
   | `ADMIN_PASSWORD` | a strong password (used only by the one-time seed) |
   | `NEXT_PUBLIC_SITE_URL` | `https://your-domain` (optional, for social previews) |

3. **Create the tables and first data** — from your computer, point at the hosted database once:

   ```powershell
   $env:DATABASE_URL = "postgres://…"   # copy the unpooled/direct URL from Vercel
   npm run db:init                       # generates Postgres client, pushes schema, seeds
   Remove-Item Env:DATABASE_URL          # back to local SQLite
   ```

   This seeds your services, products, settings and the admin login. If the database only offers a
   pooled URL, use the “direct”/“unpooled” connection string for this step.

4. **Deploy** — push to GitHub (already connected) or click **Deploy** in Vercel. The build generates
   the Postgres client automatically. No database connection is needed during the build.
5. **Domain + HTTPS** — point the domain at Vercel; HTTPS is automatic.
6. **Photos** — upload them in the dashboard under **Images** (hero, about, story, lookbook) and on
   each product. They are stored in the database and served from `/api/media/…`, so they survive
   redeploys and need no extra storage service.
7. **WhatsApp automation** — the Outbox currently opens a pre-written message for you to send.
   Connecting the WhatsApp Business API (or Twilio) means adding a `sendNotification()` provider in
   `src/lib/notify.ts`; nothing else changes.
8. **Payments** — when you want deposits online, wire Paystack into the booking confirmation step
   and flip `AWAITING_DEPOSIT → CONFIRMED` from the webhook. The data model already records
   `depositDue`, `depositPaid` and `paymentMethod`.

### Backups

- Local: copy `prisma/dev.db` somewhere safe (it is the entire studio).
- Production Postgres: enable the provider's daily backups, and export appointments to CSV monthly
  from the dashboard.

---

## Security notes

- Admin sessions are signed, httpOnly, `sameSite=lax`, 7-day expiry, `secure` in production.
- Passwords are hashed with bcrypt (10 rounds).
- Booking and login endpoints are rate-limited in memory (fine for one server; use Redis if scaled).
- Booking references are random six-character codes; the confirmation page reveals only that booking.
- Before launch: change `AUTH_SECRET`, change the admin password, review the policy pages with a
  lawyer, and confirm NDPR wording for customer data.

---

## What is intentionally not built yet

These are conscious v2 items, not oversights:

- Online card payments (deposit is bank transfer, recorded manually).
- Automatic WhatsApp/email sending (Outbox gives one-tap sending instead).
- Customer accounts (guest booking keeps friction low).
- Multiple stylists (the schema supports it; the UI shows one active staff member).
- Product cart/checkout (WhatsApp ordering was chosen deliberately).
- Reviews, loyalty, gift cards, delivery-zone pricing.

The written owner's manual is in [`docs/GUIDE.md`](docs/GUIDE.md).
