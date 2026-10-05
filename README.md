# Baraat & Waleema Invitation

A Baraat and Waleema invitation for Zurain & Abeeha, based on the Noor-e-Safar design system. Mehndi is omitted so this site can be shared separately from the Mehndi link.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. For production verification, run `npm run lint`, `npm run typecheck`, and `npm run build`.

## Customize

- `src/config/wedding.ts`: names, wording, Baraat/Waleema details, countdown target, RSVP, WhatsApp, music, social preview.
- `src/config/translations.ts`: English and Urdu/RTL labels.
- `src/config/theme.ts`: shared and event palettes, fonts, motion.

## Vercel deployment

1. Import this repository in Vercel (Next.js preset).
2. Deploy with a production domain separate from Noor-e-Safar and Mehndi.
3. Optionally set `NEXT_PUBLIC_SITE_URL` to the live Baraat & Waleema URL.
