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

- One job: get therapists, counselors and mental-health practices to
  request a free homepage demo. Every main button leads there
  ("Get a free homepage demo", to the form at `/#quote`); the Free Website
  Checkup is the second way in and ends at the same request.
- Who the site talks to: the owner of a practice, or someone acting for it.
  Say "practice", not "business". "Clients" are the people seeking care,
  never the practice. Plain words, first person from Kyle.
- What Kyle is: a web designer with a psychology degree and
  behavioral-health experience as a Registered Behavior Technician. He is
  not a licensed mental-health professional and the studio provides no
  treatment; nothing on the site may say or imply otherwise (the schema
  type stays a professional service, never a medical one).
- The hero's words are Kyle's own, in `app/home/Hero.tsx`: the headline
  "Websites for the people who help people.", then "Your work changes
  lives. Your website should reflect that." as the first line under it,
  then his two paragraphs, "Get a free homepage demo", "Or explore my
  work" and the three checks. Don't paraphrase or "improve" them; change
  them only when he supplies new ones.
- Owner-first: the practice owns its site and can run it without Kyle. The
  domain, hosting, code and accounts are in the practice's name. Kyle
  running the site afterwards (Website Care) is optional, never assumed,
  and never the headline.
- Privacy: the site's forms ask a practice for its own contact details
  only, and say so. Never ask for, or invite, anything about a client:
  no diagnoses, no treatment history. Don't promise HIPAA compliance
  because the site is for healthcare. Scheduling and intake belong in a
  tool built for it, which the practice chooses and holds the account for;
  say that the tool, not the website, carries those responsibilities.
- Pricing, matching `content/service-terms.md`: custom websites start at
  $300 and the final price is set in the written quote (fixed, not hourly;
  payment plans available); the Listing Fix is $25 one-time; Website Care
  is $25 a month, month to month. The three numbers live in
  `app/data/offer.ts` (`PRICES`) and nowhere else; change them and the
  terms together. The only guarantees on the site are the ones in the
  terms.
- Honesty: no invented reviews, numbers, clients, results, logos or
  guarantees. The four findings on /google-check are real and anonymized;
  don't add more without Kyle. No testimonials until he supplies one word
  for word, with written permission (and remember that therapists
  generally can't ask their own clients for them, which is also why the
  Listing Fix sets up no review link and Website Care flags new reviews
  to the practice instead of replying). No stock or AI photos;
  the only photo of Kyle is his own (`public/kyle-founder.*`).
- Selected work is one list, `app/data/work.ts`, shown the same everywhere.
  Every project is labeled for exactly what it is. None of the current
  projects is a commissioned site for a therapy or counseling practice, and
  the copy must never say or imply one is: Common Ground and The Support
  Shelf are Kyle's own products for autism families, GrowthGains was built
  for a life coach.
  Never imply a concept or demo was a paid engagement, never claim results,
  and add someone else's project only after Kyle confirms its label and
  the owner's OK. Screens are real captures only.
- Location is "League City, Texas", never just "Texas". Phone is shown as
  "Call or text 413-454-3509". The home page says where the studio is in
  one sentence (`locationLine` in `app/data/site.ts`, in the About block);
  no city pages, ever.
- Leads: every validated form submission is emailed (Resend) and written to
  the ledger (Supabase), referred or not; calls and texts are logged by
  hand at `/manage`, which is the monthly dashboard. A lead is a form or a
  logged conversation, never a tap on the phone number. A form says "got
  it" only once the lead is somewhere durable (a sent email or a ledger
  row); nothing a prospect types is ever logged. "Explain my leads" sends
  counts only, on a button press. See `docs/referrals-setup.md`.
- The partner side of the site is gone (no /partners pages, no signup, no
  referral line in the footer); /partners and everything under it 301 to
  the home page. What still works, and must keep working: referral links
  that already exist (`?ref=CODE`, `/api/ref`, `RefTracker`), the
  checkup's share links, and `/card`, the temporary redirect the printed
  business cards point at. Existing partners are still credited and paid;
  the rate is in `app/data/referral.ts` and the Service Terms.
- The client portal is gone (branch `archive/portal-site`). No "Client login"
  anywhere. `/family-resource-hub` stays live and unlinked.
- Motion: small reveals only; content is visible at rest, the headline is
  real HTML that doesn't wait on JavaScript, and everything is off under
  `prefers-reduced-motion`.
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
