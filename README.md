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

`/` (everything: hero, findings, how it works, prices, about Kyle, questions,
the free check form), `/websites` (for owners who want a website: price,
work, how it works, the founder, the referral offer, the website quote
form), `/partners` (for photographers, designers, agencies and consultants:
two partnership paths, the published referral terms, selected work, the
founder, the partner inquiry form), `/terms`, `/privacy`, a designed 404, and
`/family-resource-hub`, which is live but deliberately unlinked. Every retired
route (`/services`, `/about`, `/contact`, `/portal*`, `/admin*`, `/login`,
`/pricing`, `/quote`, `/resources`, `/faq`, `/work*`, `/portfolio*`,
`/coffee-shops*`, `/autism-clinics*`) answers with a 301 to the right section
of the home page (see `next.config.ts`).

## Where things live

- `app/data/offer.ts` — every word on the home page: prices, the verified
  findings, the website steps and questions (shared with /websites), the
  listing steps and questions, the plan cards.
  Prices here must match `content/service-terms.md`; change them together.
- `app/data/site.ts` — identity, phone, email, location.
- `content/service-terms.md` and `content/privacy.md` — rendered word for
  word at `/terms` and `/privacy`.
- `app/globals.css` — the whole design system (green accent `#2F5D46`,
  tinted neutrals, type, buttons, grain). Component files only arrange it.
- `app/home/FreeCheckForm.tsx` + `app/api/free-check/route.ts` — the form and
  its backend (Resend; honeypot; rate limit; utm/referrer captured as hidden
  fields and written into the email).
- `app/partners/` + `app/api/partner-inquiry/route.ts` — the partner page and
  its inquiry form. Both forms share `app/lib/inbox.ts` (cleaning, rate limit,
  one email via Resend, logged instead when the key is unset).
- `app/data/partners.ts` — every word on /partners.
- `app/data/referral.ts` — the referral reward (rate, worked example, rules).
  /partners, /websites and the home page read it; the Service Terms repeat
  it in words.
- `app/data/work.ts` — selected work, each project labeled for exactly what it
  is: `kind` is live, in-progress, concept or archived. `onPartners` picks the projects
  on /partners. `confirmed: false` projects show only on preview deployments
  (marked as drafts), never on production. Captures live in `public/showcase/`
  (not `/work`, which redirects).
- `app/components/Founder.tsx` — who Kyle is, with his own photo
  (`public/kyle-founder.webp`, JPEG fallback); never a generated portrait.
- `app/terms/lib.ts` — renders the Service Terms and gives each section a
  stable id from its name (`/terms#website`, `/terms#refunds`), so links
  survive price and numbering changes.
- `app/lib/track.ts` + `app/motion/Tracking.tsx` — Clarity custom events:
  `free_check_submit`, `website_quote_submit`, `partner_inquiry_submit`,
  `call_tap`, `text_tap`, `work_sample_click`, `cta_click` (with
  `cta_location`), `email_click`, `terms_view`.
- `app/motion/Reveal.tsx` — a short upward settle on `data-reveal` blocks
  below the fold. Never a fade, so text is always at full contrast. Off under
  reduced motion; nothing depends on it.
- `app/components/Header.tsx` — the liquid-glass header: logo, the
  "For businesses / For partners" view switch and the one action, in that
  order (so the tab order matches). The view's accent (green or violet)
  colours the switch, the glass rim and the button. On phones the switch is
  a bottom dock that slides away while scrolling down, and the header's
  button waits until any `data-hero-cta` button has scrolled out of view, so
  the first screen has one action. Page-to-page view transitions are in
  `globals.css`.
- `app/home/Lifeless.tsx` — home section 2: a lifeless example site that
  comes alive on scroll; one CSS variable (`--p`) drives it.
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
