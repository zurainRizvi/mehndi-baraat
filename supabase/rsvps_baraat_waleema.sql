-- Baraat & Waleema invite ONLY.
-- Do NOT use public.rsvps (that table belongs to the full Noor-e-Safar invite).
-- Run once in Supabase → SQL Editor for this invite's project (or same project with this separate table).

create table if not exists public.rsvps_baraat_waleema (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  response text not null check (response in ('yes', 'no')),
  events text[] not null default '{}',
  guests int not null default 0 check (guests >= 0),
  message text not null default '',
  submitted_at timestamptz not null default now()
);

create index if not exists rsvps_baraat_waleema_submitted_at_idx
  on public.rsvps_baraat_waleema (submitted_at desc);

alter table public.rsvps_baraat_waleema enable row level security;

-- Frontend-only admin + guest submit use the anon key.
drop policy if exists "Allow anon insert rsvps_baraat_waleema" on public.rsvps_baraat_waleema;
create policy "Allow anon insert rsvps_baraat_waleema"
  on public.rsvps_baraat_waleema
  for insert
  to anon
  with check (true);

drop policy if exists "Allow anon select rsvps_baraat_waleema" on public.rsvps_baraat_waleema;
create policy "Allow anon select rsvps_baraat_waleema"
  on public.rsvps_baraat_waleema
  for select
  to anon
  using (true);

-- Needed for the RSVP admin "Reset list" action.
drop policy if exists "Allow anon delete rsvps_baraat_waleema" on public.rsvps_baraat_waleema;
create policy "Allow anon delete rsvps_baraat_waleema"
  on public.rsvps_baraat_waleema
  for delete
  to anon
  using (true);
