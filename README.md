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

`/` (everything: hero, findings, how it works, prices, who it's for, questions,
the free check form), `/terms`, `/privacy`, a designed 404, and
`/family-resource-hub`, which is live but deliberately unlinked. Every retired
route (`/services`, `/about`, `/contact`, `/portal*`, `/admin*`, `/login`,
`/pricing`, `/quote`, `/resources`, `/faq`, `/work*`, `/portfolio*`,
`/coffee-shops*`, `/autism-clinics*`) answers with a 301 to the right section
of the home page (see `next.config.ts`).

## Where things live

- `app/data/offer.ts` — every word on the home page: prices, the verified
  findings, the three steps, the plan cards, the niches, the questions.
  Prices here must match `content/service-terms.md`; change them together.
- `app/data/site.ts` — identity, phone, email, location.
- `content/service-terms.md` and `content/privacy.md` — rendered word for
  word at `/terms` and `/privacy`.
- `app/globals.css` — the whole design system (green accent `#2F5D46`,
  tinted neutrals, type, buttons, grain). Component files only arrange it.
- `app/home/FreeCheckForm.tsx` + `app/api/free-check/route.ts` — the form and
  its backend (Resend; honeypot; rate limit; utm/referrer captured as hidden
  fields and written into the email).
- `app/lib/track.ts` + `app/motion/Tracking.tsx` — Clarity custom events:
  `free_check_submit`, `cta_click` (with `cta_location`), `email_click`,
  `terms_view`.
- `app/motion/Reveal.tsx` — the only animation: a short rise on
  `data-reveal` blocks. Off under reduced motion; nothing depends on it.
- `scripts/` — the launch, link and Lighthouse checks (see `scripts/README.md`).
