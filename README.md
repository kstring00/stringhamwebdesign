# Stringham Web Design

The public site for Stringham Web Design LLC (League City, Texas). Next.js 16
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
and the quote + free demo form), `/work` (the full portfolio, each project
labeled for exactly what it is), `/google-check` (the free Google check and
the $150 Listing Fix, with its form; the page to text to prospects),
`/partners` (for photographers, designers, agencies and consultants: two
partnership paths, the published referral terms, selected work, the
partner form), `/terms`, `/privacy`, and the unlinked
`/family-resource-hub`. `/websites` redirects to `/work`.

## Where things live

- `app/data/offer.ts` — the offer in one place: prices, the three pricing
  cards (Website, Website Care, the Google listing path), the three-step
  strip, the home page's five questions, and /google-check's findings,
  steps, Listing Fix card and questions. The site's one action is a quote
  plus a free demo of the homepage (`app/data/nav.ts`); the free Google
  check is the secondary path, on its own page.
  Prices here must match `content/service-terms.md`; change them together.
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
  are the S mark; the share images (`app/opengraph-image.png`,
  `public/og/partners.png`) use the lockup.
- `app/home/FreeCheckForm.tsx` + `app/api/free-check/route.ts` — the form and
  its backend (Resend; honeypot; rate limit; utm/referrer captured as hidden
  fields and written into the email).
- `app/partners/` + `app/api/partner-inquiry/route.ts` — the partner page and
  its inquiry form. Both forms share `app/lib/inbox.ts` (cleaning, rate limit,
  one email via Resend, logged instead when the key is unset).
- `app/data/partners.ts` — every word on /partners.
- `app/data/referral.ts` — the referral reward (rate, worked example, rules).
  /partners and the footer read it; the Service Terms repeat it in words.
- `app/data/work.ts` — selected work, each project labeled for exactly what it
  is: `kind` is live, in-progress, concept or archived. `onPartners` picks the projects
  on /partners, `onHome` the three demos in the home page's carousel and
  hero frames, `onWork` the /work portfolio. `chip`, `type` and `builtFor`
  label each card; `built` is what was actually built, taken from each
  project's own code. `confirmed: false` projects show only on preview deployments
  (marked as drafts), never on production. Captures live in `public/showcase/`
  (not `/work`, which redirects).
- `app/components/Founder.tsx` — who Kyle is, with his own photo
  (`public/kyle-founder.webp`, JPEG fallback); never a generated portrait.
- `app/terms/lib.ts` — renders the Service Terms and gives each section a
  stable id from its name (`/terms#website`, `/terms#refunds`), so links
  survive price and numbering changes.
- `app/lib/track.ts` + `app/motion/Tracking.tsx` — Clarity custom events:
  `quote_submit`, `google_check_submit`, `partner_submit`, `call_tap`,
  `text_tap`, `demo_link_click` (with `project`), `carousel_interaction`
  (with `method`), `cta_click` (with `cta_location`), `email_click`,
  `terms_view`. Both forms carry utm_source/medium/campaign and the
  referrer in hidden fields.
- `app/motion/Reveal.tsx` — a one-time fade-up for section headings and
  cards marked `data-reveal` below the fold; nothing else animates on
  scroll. `app/motion/Magnetic.tsx` makes `data-magnetic` buttons lean
  toward the pointer. Both off under reduced motion; nothing depends on them.
- `app/components/Header.tsx` — the liquid-glass header: logo, Work ·
  Pricing · About · FAQ, the phone number and the one action. On phones the
  bar is just the logo and `MobileBar.tsx` docks Call · Text · Get a quote
  at the bottom (it steps aside while the quote form is on screen). The
  partner page keeps its violet accent and its own action.
- `app/home/` — the home page's sections: `Hero.tsx` (+ `HeroFrames.tsx`,
  three browser frames with scroll parallax), `WorkCarousel.tsx` (GSAP
  Draggable with inertia snapping; a plain scroller without JS),
  `Pricing.tsx`, `AboutFaq.tsx`, `QuoteForm.tsx` (one contact field, phone
  or email), and `Testimonials.tsx`, which stays out of the page until
  there are quotes with written permission.
- `app/work/` — the full portfolio; `app/google-check/` — the free check and
  the Listing Fix, the page to text to prospects. `/websites` redirects to
  `/work`.
- `docs/user-test-landscaping.md` and `docs/user-test-webster-remodeler.md`
  — the 5-minute tests to run with a local owner.
- `app/home/BuildField.tsx` (+ `buildFieldShaders.ts`, `BuildFieldMount.tsx`)
  — the dot field on the home and partners heroes (colour from the page's
  accent): WebGL2 (one draw call) with a Canvas 2D
  fallback, on `gsap.ticker`. Dots clear around every `data-field-clear`
  block; a wireframe website frames the example card on desktop. Loaded at
  idle after first paint, paused offscreen, one still frame under reduced
  motion, nothing without JS. Tunables are constants at the top of the file.
  `/?field=2d` forces the fallback; `/?field=blue` shows the original
  GrowthGains palette for comparison.
- `scripts/` — the launch, link and Lighthouse checks (see `scripts/README.md`).
