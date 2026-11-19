# Stringham Web Design

The public site for Stringham Web Design LLC (League City, Texas): custom web
design for therapists, counselors and mental-health practices. Next.js 16
App Router, React 19, TypeScript, CSS Modules, GSAP. No UI library.

The client portal that used to live in this repo was removed in September 2026.
The last commit that carried it is tagged `archive-portal-2026-09` and kept on
the `archive/portal-site` branch.

## Running it

```
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
npm run lint
```

Copy `.env.example` to `.env.local`. Five variables, all optional
locally (the contact form logs instead of emailing without `RESEND_API_KEY`).

## Pages

`/` (the hero, the work carousel, pricing, about Kyle beside the questions,
and the free homepage demo form), `/work` (the full portfolio, each project
labeled for exactly what it is), `/google-check` (the free Google check and
the Listing Fix, quoted after the check, with its form; the page to text to prospects),
`/terms`, `/privacy`, and the unlinked
`/family-resource-hub`. `/websites` redirects to `/work`.

## Where things live

- `app/data/offer.ts` — the offer in one place: the three prices
  (`PRICES`: websites from $300, Listing Fix $25, Website Care $25/month)
  and how pricing is worded (`pricing`: the final website price is set in
  the written quote, payment plans), what affects the price, the Listing
  Fix and Website Care lines, the three pricing
  cards (Website, Website Care, the Google listing path), the three-step
  strip, the home page's five questions, and /google-check's findings,
  steps, Listing Fix card and questions. The site's one action is a quote
  plus a free demo of the homepage (`app/data/nav.ts`); the free Google
  check is the secondary path, on its own page.
  The wording here must match `content/service-terms.md`; change them together.
- `app/data/site.ts` — identity, phone, email, location.
- `content/service-terms.md` and `content/privacy.md` — rendered word for
  word at `/terms` and `/privacy`.
- `app/globals.css` — the whole design system, in the logo's colours: navy
  ink (`--ink`, `--navy`), the brand blue `--brand` `#0060DC` (white text
  passes AA), `--brand-deep`, and the ribbon gradient `--brand-gradient`
  (navy → blue → azure → cyan, for accents only, never text). The partner
  view swaps the brand for violet. Component files only arrange it.
- `brand/stringham-web-design-logo.png` — Kyle's logo file (the source).
  `public/brand/` holds what's cut from it: the horizontal lockup used by
  `app/components/Logo.tsx` in the header and footer, the S mark, and a
  square logo for structured data. `app/icon.png` and `app/apple-icon.png`
  are the S mark; the share image (`app/opengraph-image.png`) uses the lockup.
- `app/home/FreeCheckForm.tsx` + `app/api/free-check/route.ts` — the form and
  its backend (Resend; honeypot; rate limit; utm/referrer captured as hidden
  fields and written into the email).
  The forms share `app/lib/inbox.ts` (cleaning, rate limit, one email via
  Resend).
- `app/data/referral.ts` — the referral rate. The partner pages were removed
  in the 2026-11 rework (/partners 301s home); existing partners' links
  (`?ref=CODE`, `app/api/ref`, `app/motion/RefTracker.tsx`) and the printed
  card's `/card` redirect still work, and `/manage` still shows what's owed.
- `app/lib/referrals.ts` + `supabase/migrations/` — the lead ledger: every
  validated form submission is written to the `leads` table (referred or
  not; the same person, same form, same day is one row), calls and texts
  are logged by hand, and `search_months` holds Search Console totals typed
  in by month. `app/lib/leadStats.ts` turns the ledger into the monthly
  numbers `/manage` shows (inquiries, consultations, quotes, signed clients,
  conversion rates, as cohorts by the month the lead came in). See
  `docs/referrals-setup.md`.
- `app/data/work.ts` — selected work as one list, shown in the same order
  on the home page, on /work and in the hero. Each project is labeled for
  exactly what it is (`kind`, `stage`, `type`); `built` is what was actually
  built. Real captures live in `public/showcase/` (thumbnails from
  `scripts/make-thumbs.js`).
- `docs/user-test-landscaping.md` and `docs/user-test-webster-remodeler.md`
  — the 5-minute tests to run with a local owner.
- `app/home/BuildField.tsx` (+ `buildFieldShaders.ts`, `BuildFieldMount.tsx`)
  — the dot field on the home hero (colour from the page's
  accent): WebGL2 (one draw call) with a Canvas 2D
  fallback, on `gsap.ticker`. Dots clear around every `data-field-clear`
  block; a wireframe website frames the example card on desktop. Loaded at
  idle after first paint, paused offscreen, one still frame under reduced
  motion, nothing without JS. Tunables are constants at the top of the file.
  `/?field=2d` forces the fallback; `/?field=blue` shows the original
  GrowthGains palette for comparison.
- `scripts/` — the launch, link and Lighthouse checks (see `scripts/README.md`).
