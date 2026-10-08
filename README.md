# Baraat & Waleema Invitation

A Baraat and Waleema invitation for Zurain & Abeeha, based on the Noor-e-Safar design system. Mehndi is omitted so this site can be shared separately from the Mehndi link.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. For production verification, run `npm run lint`, `npm run typecheck`, and `npm run build`.

## Customize

- `src/config/wedding.ts`: names, wording, Baraat/Waleema details, countdown target, RSVP (including admin password), WhatsApp, music, social preview.
- `src/config/translations.ts`: English and Urdu/RTL labels.
- `src/config/theme.ts`: shared and event palettes, fonts, motion.

## RSVP with Supabase

Guest replies are saved through `RSVPService` in `src/services/rsvp.ts`. With Supabase configured, every Confirm RSVP writes to **`public.rsvps_baraat_waleema`** (WhatsApp is still optional). Without Supabase, responses stay in this invite’s browser local storage only (`baraat-waleema-rsvp*`).

This table is **isolated from other invitation links**. The full Noor-e-Safar invite uses `public.rsvps`. Admin on this site only reads/writes `rsvps_baraat_waleema`, so guests from other links never appear here (and vice versa), even if both sites share one Supabase project.

### 1. Create the table

In Supabase → SQL Editor, run [`supabase/rsvps_baraat_waleema.sql`](supabase/rsvps_baraat_waleema.sql). That creates `public.rsvps_baraat_waleema` and anon insert/select/delete policies for this invite’s admin panel.

Do **not** run the full invite’s `rsvps.sql` for this site, and do not point this site at the `rsvps` table.

### 2. Environment variables

```bash
NEXT_PUBLIC_RSVP_ADAPTER=supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_ADMIN_PASSWORD=your_private_password
```

### 3. Admin panel

On the RSVP card, tap the muted **admin** label in the bottom-right corner, enter the admin password, then review attending / declining lists and total guest headcount for **this link only**. **Refresh** reloads from `rsvps_baraat_waleema`; **Reset list** clears only that table (confirm first). If the table already existed before reset support was added, also run [`supabase/rsvps_baraat_waleema_allow_delete.sql`](supabase/rsvps_baraat_waleema_allow_delete.sql).

This is frontend-only: the password gate is the practical barrier. Anyone with the anon key can also query the table if they know how.

## Vercel deployment

1. Import this repository in Vercel (Next.js preset).
2. Add the Supabase and admin password environment variables for production.
3. Deploy with a production domain separate from Noor-e-Safar and Mehndi.
4. Optionally set `NEXT_PUBLIC_SITE_URL` to the live Baraat & Waleema URL.
