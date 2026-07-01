# Setup — going live

The app runs without configuration (public pages show empty states). To enable
real bookings, connect Supabase and Resend.

## 1. Supabase

1. Create a project at https://supabase.com.
2. In the SQL Editor, run the migrations **in order**, then the seed:
   1. `supabase/migrations/0001_init.sql`
   2. `supabase/migrations/0002_service_category.sql`
   3. `supabase/seed.sql` (sample nail & brow services + a weekly schedule)
3. Create Eri's admin login: **Authentication → Users → Add user** (email +
   password, and tick *Auto Confirm User*). This is the only account that can
   reach `/admin`.
4. Copy the keys from **Project Settings → API**:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (server-only, keep secret)

## 2. Resend (email)

1. Create an account at https://resend.com and an API key → `RESEND_API_KEY`.
2. Verify a sending domain, then set `EMAIL_FROM`
   (e.g. `"Atelier Eri <bookings@yourdomain.com>"`).
   For a quick test you can use `onboarding@resend.dev`.
3. Set `SALON_NOTIFY_EMAIL` to the address where Eri receives new-booking alerts.

## 3. Environment

```bash
cp .env.example .env.local
# fill in the values from steps 1 & 2
npm run dev
```

`SALON_TIMEZONE` defaults to `Europe/Stockholm` — all schedule times are
interpreted in this zone.

## 4. Deploy (Vercel)

1. Push to GitHub (already connected: `benKrt1/ErisNeils`).
2. Import the repo at https://vercel.com and add the same env vars.
3. Set `NEXT_PUBLIC_SITE_URL` to the production URL.

## Notes

- Bookings can never double-book: an exclusion constraint in Postgres rejects
  overlapping confirmed bookings even under concurrent requests.
- Availability is derived automatically from the weekly schedule, time-off, and
  existing bookings — Eri only maintains those three things.

## Future (not in this version)

WhatsApp notifications, 24h reminder emails (Vercel Cron), the remaining
marketing pages (Philosophy, Products, Studio Photos, Journal/Blog, Map),
deposits/payments, and customer accounts.
