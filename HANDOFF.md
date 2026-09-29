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

- The positioning (V4): turning any idea into something real, with
  everything it needs. Studio line "Stringham Web Design · League City,
  Texas". Nav is Services · About plus Start a project, on every page
  including phones.
- One palette: paper `#F4EFE6`, ink `#17130F`, ember `#D2552D` used
  sparingly (`--ember-deep` for small text), deep ink sections. Fraunces for
  display, Inter Tight for text, both self-hosted through `next/font`.
  Tokens in `app/globals.css`. No new colours, fonts or libraries.
- The motif is "sketch to real": thin pencil strokes (ink at low opacity)
  that become finished design. Used in the hero, the Idea → Reality
  section, the process rule, the closing underline and the footer wordmark,
  and nowhere louder. The fictional site in the signature section is
  Halfmoon Coffee; never put a real business in there.
- The Family Resource Hub page stays as it is: a specialty product for ABA
  and pediatric clinics.
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
