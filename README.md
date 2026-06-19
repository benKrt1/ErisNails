# Botanica Nails

Booking web app for Eri's nail studio.

- **Public site** (EN / SV): home, services, and online booking.
- **Availability engine**: free slots are computed from Eri's weekly schedule, time-off, service duration, and existing bookings — no manual slot management.
- **Admin**: Eri logs in to see bookings and manage her schedule, time-off, and services.
- **Notifications**: email to Eri on every new booking + a confirmation email to the customer.

## Stack

Next.js (App Router) + TypeScript · Tailwind CSS v4 · Supabase (Postgres + Auth) · Resend (email) · next-intl (EN/SV) · Vercel.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in Supabase + Resend keys
npm run dev
```

Open http://localhost:3000 (redirects to `/sv`).

## Project layout

```
app/[locale]/(site)   Public pages (home, services, book, confirmation)
app/[locale]/admin    Admin area (auth-guarded)
app/api               Availability + booking endpoints
i18n/                 next-intl routing & request config
lib/                  Supabase clients, availability engine, email, types
messages/             en.json, sv.json
supabase/migrations/  Database schema
```

## Status

See `docs/` for the design/plan. Implemented incrementally: scaffold + public shell → availability engine → booking flow → email → admin → deploy.
