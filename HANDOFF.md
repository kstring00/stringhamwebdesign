# Handoff

For whoever picks this up cold.

**Repo:** `kstring00/stringhamwebdesign` · **Stack:** Next.js 16 App Router,
React 19, TypeScript, CSS Modules, GSAP 3 (ScrollTrigger only). Hosted on Vercel.

## History in one paragraph

Until September 2026 this repo also held a client portal (Supabase auth and
database, Stripe invoicing, timesheets, onboarding, invites). It was removed in
the `revamp-2026` rebuild. Tag `archive-portal-2026-09` and branch
`archive/portal-site` hold the last portal commit. Don't resurrect it on `main`.

## Rules from the owner

- One job: get small local business owners (self storage, RV parks, fishing
  guides, horse boarding, marinas, and other owner-run local businesses) to
  request a free check. The home page does all of it; the form is the anchor.
- Three fixed prices on the page, matching `content/service-terms.md`:
  Listing Fix $300, Website $1,500, Monthly Plan $125/month. Change the
  terms and `app/data/offer.ts` together. The only guarantees on the site
  are the ones in the terms.
- Plain words. "Google listing," "customers," "calls." No "SEO," "GBP,"
  "citations," "conversion" in visible copy. First person from Kyle.
- Minimal: one accent (forest green `#2F5D46`), generous space, at most two
  columns on desktop, one on phones. GSAP for small reveals only; content is
  visible at rest and everything is off under `prefers-reduced-motion`.
- Honesty: no invented reviews, numbers, clients, results, logos or
  guarantees. The four findings on the home page are real and anonymized;
  don't add more without Kyle. No testimonials until he supplies one word
  for word. No stock or AI photos; the only photo of Kyle is his own
  (`public/kyle-founder.*`). Don't mention his dad's facility by name.
- Location is "League City, Texas", never just "Texas". Phone is shown as
  "Call or text 413-454-3509".
- /partners recruits referral and white-label partners without turning the
  home page into a partner site: one quiet header link, one home band, one
  footer link. The stage of the business is stated plainly on /partners
  ("a new studio… I haven't delivered a paid client website yet"); keep it
  true and update it when it stops being true.
- The referral reward is published: 20% of the website's total price, paid
  once the client has paid in full, open to anyone who refers. It lives in
  `app/data/referral.ts` and in the Service Terms ("Referrals" under
  Website); change both together. White-label pricing stays off the site.
- Selected work: never imply a concept or spec build was a paid engagement,
  and never claim results. A project for a business Kyle doesn't own is
  shown on production only after he confirms its label and the owner's OK
  (`confirmed` in `app/data/work.ts`).
- The client portal is gone (branch `archive/portal-site`). No "Client login"
  anywhere. `/family-resource-hub` stays live and unlinked.
- Accessibility failures are disqualifying: Lighthouse accessibility 95+.
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
