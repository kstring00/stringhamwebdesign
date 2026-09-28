# Handoff

For whoever picks this up cold.

**Repo:** `kstring00/stringhamwebdesign` · **Stack:** Next.js 16 App Router,
React 19, TypeScript, CSS Modules, GSAP 3 (ScrollTrigger, ScrollSmoother,
SplitText). Hosted on Vercel.

## History in one paragraph

Until September 2026 this repo also held a client portal (Supabase auth and
database, Stripe invoicing, timesheets, onboarding, invites). It was removed in
the `revamp-2026` rebuild. Tag `archive-portal-2026-09` and branch
`archive/portal-site` hold the last portal commit. Don't resurrect it on `main`.

## Rules from the owner

- Two worlds, one studio: coffee shops and autism clinics. Paper `#F4EFE6`
  and ink `#17130F` underneath; coffee is espresso `#3A261C`, crema
  `#C8894B`, steamed milk `#EFE3D3`; clinics are deep sage `#3F6457`, soft
  sage `#9DBFB1`, sky `#A9CBDA`. Crema, soft sage and sky are decoration
  only on light grounds (they fail AA as text); use `--crema-ink` and
  `--sage` for text.
- Never use the jigsaw puzzle-piece icon for autism. The clinic motif is
  four soft, rounded pieces of one whole, and must stay abstract.
  Fraunces for display, Inter Tight for text, both self-hosted through
  `next/font`. Tokens in `app/globals.css`. No new colours, fonts or libraries.
- Motion is GSAP only. Every animation is off under `prefers-reduced-motion`
  and nothing depends on JS to be readable.
- Accessibility failures are disqualifying. He sells to ABA and pediatric
  clinics. Lighthouse accessibility must stay at 95+ (it is 100 today).
- Common Ground is the only project on the site (the homepage case study).
  Screens are real captures. Never a mockup or an invented project. No invented testimonials.
- Never name the clinic brands or the old demo domain behind Common Ground,
  and never call anything a "pilot", anywhere on the site. The exact banned
  strings live in `scripts/launch-check.js`, which greps
  for these and fails the build check if they appear.
- No prices anywhere on the site. Every project is quoted after a free
  30-minute call.
- Don't merge to `main` or deploy to production without the owner's OK.

## Checks before any deploy

```
npm run lint && npm run build
npm start -- -p 3300 &
BASE=http://localhost:3300 NODE_PATH=./node_modules node scripts/launch-check.js
BASE=http://localhost:3300 NODE_PATH=./node_modules node scripts/lighthouse-check.js /
```

See `scripts/README.md` for the tooling install line.

## Environment

`.env.example` is the complete list: `RESEND_API_KEY`, `CONTACT_TO_EMAIL`,
`CONTACT_FROM_EMAIL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_CLARITY_ID`.
Anything named `SUPABASE_*`, `STRIPE_*`, `PORTAL_*` or `CAPTURE_*` still set
on Vercel is dead and should be deleted.

## Open items

See `docs/OPEN_WORK.md`.
