-- Atelier Eri — add service category (nails / brows)
-- Lets the catalog present nails and brows as equal, grouped offerings.

alter table public.services
  add column if not exists category text not null default 'nails'
  check (category in ('nails', 'brows'));
