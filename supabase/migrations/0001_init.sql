-- Botanica Nails — initial schema
-- Single-staff salon: one weekly schedule, one set of bookings.

create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "btree_gist";  -- exclusion constraint below

-- ---------------------------------------------------------------------------
-- Services (bilingual EN/SV)
-- ---------------------------------------------------------------------------
create table if not exists public.services (
  id               uuid primary key default gen_random_uuid(),
  name_en          text not null,
  name_sv          text not null,
  description_en   text,
  description_sv   text,
  duration_minutes integer not null check (duration_minutes > 0),
  price            integer not null check (price >= 0),  -- whole SEK
  is_active        boolean not null default true,
  sort_order       integer not null default 0,
  created_at       timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Weekly recurring working hours (salon-local times)
-- weekday: 0 = Sunday … 6 = Saturday
-- ---------------------------------------------------------------------------
create table if not exists public.working_hours (
  id         uuid primary key default gen_random_uuid(),
  weekday    smallint not null check (weekday between 0 and 6),
  start_time time not null,
  end_time   time not null,
  is_active  boolean not null default true,
  check (start_time < end_time)
);

-- ---------------------------------------------------------------------------
-- Time off / exceptions (days off, vacation, partial blocks)
-- start_time/end_time null => whole day off
-- ---------------------------------------------------------------------------
create table if not exists public.time_off (
  id         uuid primary key default gen_random_uuid(),
  date       date not null,
  start_time time,
  end_time   time,
  reason     text,
  created_at timestamptz not null default now(),
  check (
    (start_time is null and end_time is null) or
    (start_time is not null and end_time is not null and start_time < end_time)
  )
);

create index if not exists time_off_date_idx on public.time_off (date);

-- ---------------------------------------------------------------------------
-- Bookings
-- ---------------------------------------------------------------------------
create type booking_status as enum ('confirmed', 'cancelled');

create table if not exists public.bookings (
  id             uuid primary key default gen_random_uuid(),
  service_id     uuid not null references public.services (id),
  customer_name  text not null,
  customer_phone text not null,
  customer_email text not null,
  starts_at      timestamptz not null,
  ends_at        timestamptz not null,
  status         booking_status not null default 'confirmed',
  notes          text,
  created_at     timestamptz not null default now(),
  check (starts_at < ends_at)
);

create index if not exists bookings_starts_at_idx on public.bookings (starts_at);

-- Double-booking guard: no two CONFIRMED bookings may overlap in time.
-- Enforced at the database level, so it holds even under concurrent requests.
alter table public.bookings
  add constraint bookings_no_overlap
  exclude using gist (
    tstzrange(starts_at, ends_at) with &&
  ) where (status = 'confirmed');

-- ---------------------------------------------------------------------------
-- Row Level Security
-- All app data access happens server-side via the service-role key, which
-- bypasses RLS. These policies only govern the anon/public role: read-only
-- access to the catalog tables, and no access at all to bookings (privacy).
-- ---------------------------------------------------------------------------
alter table public.services      enable row level security;
alter table public.working_hours enable row level security;
alter table public.time_off      enable row level security;
alter table public.bookings      enable row level security;

create policy "public reads active services"
  on public.services for select
  to anon using (is_active);

create policy "public reads working hours"
  on public.working_hours for select
  to anon using (true);

create policy "public reads time off"
  on public.time_off for select
  to anon using (true);

-- bookings: intentionally no anon policy (no public read/write).
