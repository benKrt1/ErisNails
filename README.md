# Atelier Eri

**Bilingual booking platform for a one-person nail studio in Sweden.**
Customers book online in Swedish or English; the owner never touches a slot
calendar — availability is computed from her schedule.

🔗 **Live:** https://eris-neils.vercel.app

![Next.js](https://img.shields.io/badge/Next.js-16-000?logo=next.js)
![React](https://img.shields.io/badge/React-19-149ECA?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth-3FCF8E?logo=supabase)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-000?logo=vercel)

<!-- Add a screenshot here once captured: ![Home](docs/screenshots/home.png) -->

---

## Why this project

A real client with a real constraint: she works alone, her hours change week to
week, and she was losing bookings to DM ping-pong. The interesting part isn't
the CRUD — it's that **no one maintains a list of available times**. Slots are
derived on the fly from three inputs she already thinks in terms of: her weekly
hours, her days off, and what's already booked.

## Features

- **Public site (SV / EN)** — home, services and a 3-step booking flow, fully
  localized with `next-intl` and locale-prefixed routes (`/sv`, `/en`).
- **Availability engine** — free slots computed per service duration from the
  weekly schedule − time-off − existing bookings. Pure, testable interval math.
- **Booking flow** — service → month calendar with real availability → time →
  customer details, submitted through a Next.js Server Action.
- **Admin panel** — Supabase-Auth-guarded area where the owner manages
  bookings, weekly schedule, time-off and her service catalogue.
- **Email notifications** — owner alert + customer confirmation with an
  attached `.ics` calendar invite. Gmail SMTP transport with Resend fallback.
- **Timezone-correct** — all schedule times are salon-local
  (`Europe/Stockholm`) and converted to UTC at the boundary via `date-fns-tz`.

## How availability works

```
weekly working hours          ██████████████████     09:00 – 17:00
− time off (partial or full)        ▒▒▒▒               12:00 – 13:00
− confirmed bookings             ▓▓▓                  10:30 – 11:30
─────────────────────────────────────────────────────────────────
= free intervals              ████░▓▓▓░███░▒▒▒░██████
→ sliced into 15-min starts that fit the chosen service duration,
  minus a 60-minute minimum lead time.
```

The core is `subtractIntervals()` in [`lib/availability.ts`](lib/availability.ts)
— a pure function over half-open `[start, end)` intervals in minutes since local
midnight. Because it's pure, the tricky cases (overlaps, partial time-off,
DST-shifting days) are covered by unit tests instead of manual clicking.

**Double-booking is impossible by construction.** Rather than trusting an
application-level check, the database enforces it with a Postgres exclusion
constraint over a `tstzrange`, so two concurrent requests for the same slot
cannot both succeed:

```sql
alter table public.bookings
  add constraint bookings_no_overlap
  exclude using gist (
    tstzrange(starts_at, ends_at) with &&
  ) where (status = 'confirmed');
```

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Server Components, Server Actions) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Database / Auth | Supabase (Postgres + Auth) |
| i18n | next-intl (sv default, en) |
| Email | Nodemailer (Gmail SMTP) → Resend fallback |
| Dates | date-fns / date-fns-tz |
| Tests | Vitest |
| Hosting | Vercel |

## Project layout

```
app/[locale]/(site)     Public pages — home, services, book, confirmation
app/[locale]/admin      Admin area (auth-guarded) + server actions
app/api/availability    Availability endpoint for the booking calendar
components/booking      BookingFlow, MonthCalendar
components/admin        Bookings, schedule, time-off, services managers
lib/availability.ts     Interval math — the availability engine
lib/datetime.ts         Salon-local ⇄ UTC conversion helpers
lib/email.ts            Transactional email + .ics generation
i18n/                   next-intl routing & request config
messages/               en.json, sv.json
supabase/migrations/    Database schema
```

## Running locally

```bash
npm install
cp .env.example .env.local    # Supabase + email keys
npm run dev                   # http://localhost:3000 → redirects to /sv
```

The app boots without any configuration — public pages simply render empty
states. To enable real bookings, run the migrations and fill in the env vars;
the full walkthrough is in [`docs/SETUP.md`](docs/SETUP.md).

```bash
npm test        # Vitest — 13 tests over the availability & datetime logic
npm run lint
npm run build
```

## Roadmap

24h reminder emails via Vercel Cron, WhatsApp notifications, deposits at
booking time, and the remaining marketing pages (philosophy, studio, journal).

---

Built by [benKrt1](https://github.com/benKrt1).
