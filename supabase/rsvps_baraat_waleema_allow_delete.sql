-- Run once if public.rsvps_baraat_waleema already exists (adds admin reset support).

drop policy if exists "Allow anon delete rsvps_baraat_waleema" on public.rsvps_baraat_waleema;
create policy "Allow anon delete rsvps_baraat_waleema"
  on public.rsvps_baraat_waleema
  for delete
  to anon
  using (true);
