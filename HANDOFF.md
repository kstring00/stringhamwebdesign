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
- The home hero (`app/home/Hero.tsx`, `hero.module.css`) is on white, in
  its own palette and faces: deep green ink, emerald and cobalt accents,
  mint and sky grounds (the `--hero-*`, `--emerald`, `--cobalt`, `--mint`,
  `--sky` and cloud tokens in `globals.css`), Instrument Serif for the
  headline and DM Sans for everything else. Top to bottom: the site header
  with no bar of its own (logo, links, phone, an outlined "Free homepage
  demo" button); a mint eyebrow; the headline "Websites for the people who
  help people." with "help people." in cobalt italic; the story panel, a
  tangled line that unravels into one calm, straight line over three
  captions ("They arrive overwhelmed." / "Your site makes it clear." /
  "They reach out."); then "Your work changes lives. Your website should
  reflect that." and Kyle's paragraph beside the button "Get a free
  homepage demo", the link "Or explore my work" and the three checks.
  The words are Kyle's own. Don't paraphrase or "improve" them; change
  them only when he supplies new ones. The line's path is generated
  (`scripts/hero-path.py` → `app/home/heroPath.ts`), never hand-drawn.
- Three things move in the hero and nothing else, in plain CSS: the line
  draws in once on load, the dot at its end breathes, and five clouds
  drift across behind the content. No project wall, no carousel, no phone
  frames. Under the hero the three real projects sit as a still row of
  cards (`app/home/WorkRow.tsx`).
- One palette and two faces, site-wide, all as tokens in `app/globals.css`:
  white paper, deep green ink, emerald for small accents (checks, links,
  focus), cobalt for the rare highlight, mint and sky grounds. Buttons are
  ink with mint words. Instrument Serif for headings (one weight; never
  bold it), DM Sans for everything else. The logo keeps its own blues.
  Don't bring back the navy and blue, and don't write a color out in a
  component when a token exists.
- Owner-first: the practice owns its site and can run it without Kyle. The
  domain, hosting, code and accounts are in the practice's name. Kyle
  running the site afterwards (Website Care) is optional, never assumed,
  and never the headline. What a practice is handed at launch, and how far
  each part goes, is on /owner-handoff ("Handoff" in the nav), written in
  `app/data/ownership.ts` and matched by sections 2 and 3 of
  `content/service-terms.md`. Those are commitments: change them only on
  Kyle's say-so, all three together, and never promise open-ended support
  or ownership of something licensed from another company. The practice
  pays its domain, hosting and tools directly to those companies; Website
  Care pays for Kyle's time and never reads as covering those bills. The
  page's "How the handoff works" steps carry honest ease labels: a small
  change is editing a text file ("Takes some learning"), a new page is code
  ("Hard"). Don't soften them.
- The Free Website Checkup is for a practice's owner checking their own
  site, never for a client: proof is credentials and approach (never
  client reviews), cost is fees and insurance, and a good form asks for
  contact details only.
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
- Motion: content is visible at rest, the headline is real HTML that
  doesn't wait on JavaScript, and everything is off under
  `prefers-reduced-motion` (the hero's line shows fully drawn and its
  clouds sit still). Outside the hero, small reveals only.
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
