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
- What the site argues: a practice shouldn't look like every other
  practice. Squarespace and WordPress are the safe choice, and this site is
  the proof of what a custom build can do. Every page should feel built, not
  assembled. Stay fair to those platforms: say what they do well, say
  nothing false about them, and make no speed or search-ranking claims.
  "Why not a template?" under the hero (`app/home/Template.tsx`, words in
  `app/data/template.ts`) is where that case is made.
- The home hero (`app/home/Hero.tsx`, `HeroVideo.tsx`, `hero.module.css`)
  is one panel on the near-black page, inset 12px from the page edge with
  28px corners, about one screen tall. Behind it: the owner's own scene
  (`public/hero/`), first as a still and then as a slow, silent, looping
  video that fades in over it. Over that: the shade (dark at the top,
  clear through the middle, dark at the bottom); the liquid nav at the top;
  bottom left the name "Stringham" with an amber asterisk and "WEB DESIGN"
  under it (the brand mark, not a heading); bottom right "* NOT A TEMPLATE",
  the page's one h1 in two lines ("Why blend in?" / "Custom websites for
  therapists and mental health practices."), one paragraph, the cream button
  "Get a free demo" and the link "See the work". The words are the owner's.
  Don't paraphrase or "improve" them; change them only when he supplies new
  ones. Where the name and the right block don't fit side by side (under
  about 1240px) the block goes under the name and the words carry their own
  shade. Every word must pass AA over the brightest frame of the video.
- The still is the largest thing on first paint: a real `<img>`, preloaded,
  in AVIF and WebP, with a tighter crop for phones. The words never wait on
  the video or on JavaScript. The video is given a source only after the
  page has loaded, only when the hero is on screen, and never with reduced
  motion or data saver on; it pauses out of view and in a hidden tab, falls
  back to the still if it cannot play, is hidden from screen readers, and
  has a pause and play button (it moves for more than five seconds, so it
  must). `scripts/hero-media.js` makes every file in `public/hero/` from the
  two sources. This scene is the one picture of people on the site, and the
  owner supplied it; add no other image or video without asking him.
- What moves: on load the name, "WEB DESIGN" and the right block rise 28px
  and fade in, one after another; the video; the nav's water. Under the
  hero, panels and headings rise in the same way as they are scrolled to
  (`app/motion/Reveal.tsx`). Nothing else. Under the hero the three real
  projects sit as a still row of cards (`app/home/WorkRow.tsx`).
- The nav (`app/components/SiteHeader.tsx`, `LiquidNavbar.tsx`,
  `liquid-navbar.css`) is the liquid navbar from 21st.dev, by
  guglielmogiannattasio.it; keep the credit comment at the top of the file,
  which also lists what was changed for this site. Six real links: Home,
  Work, Pricing, Handoff, Checkup, About (`app/data/nav.ts`). Pricing and
  About are sections of the home page. Blog and FAQ are in the footer. Over
  the home hero it is the pill alone, centered; past the hero and on every
  other page the light logo sits to its left and "Get a free demo" to its
  right, from 900px up. On a phone it is the pill alone, icons only, and the
  bottom bar carries call, text and the demo button. The water must not run
  without end: it moves on hover, on a tap and for about two seconds after
  a page change, then the animation loop stops. Without WebGL the CSS drop
  must look right.
- One palette and two faces, site-wide, all as tokens in `app/globals.css`:
  the page `--bg` #0A0908; surfaces `--surface` #14100C and `--surface-2`
  #1B1612; lines `--line` (cream at 12%); words `--text` #F3E7D3, a softer
  `--text-soft` #E9DCC6 and secondary `--text-2` #CDBFA8; the accent
  `--accent` #FFD9A8 (amber: marks, links, focus, never a large fill); a
  second accent `--accent-2` #FF9A5A, sparingly; buttons `--btn` cream with
  `--btn-text` dark words; and the three status colours `--good`, `--warn`,
  `--bad` (each always beside a word or a number). Outfit for display (the
  name and every heading, weight 500), DM Sans for everything else.
  Instrument Serif and the white-and-mint palette are retired; don't bring
  them back, and don't write a colour out in a component when a token
  exists (the hero is the exception: its colours sit on a picture).
- Three signature touches, used with restraint, and nothing beyond them:
  large Outfit section headings; the amber asterisk (`.ast`) as a footnote
  mark wherever the copy states an honest limit; and 28px panels
  (`--radius-panel`, inset `--inset` from the page edge) whose content
  rises in on scroll the way the hero's words do, off under reduced motion.
- The logo on the site is the light version (`public/brand/logo-lockup-light*`,
  made by `scripts/logo-light.js`): the owner's lockup with the navy word
  "Stringham" turned to cream so it can be read on the dark page. The blue
  mark and "WEB DESIGN" are untouched, and the original files stay.
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
  is optional and month to month, in three levels: Basic $25, Standard $50
  and Full $85 a month, with 15, 45 and 90 minutes of edits. The card is a
  slider (`app/home/CareCard.tsx`), and wherever one number has to stand
  for the plan it is "from $25 a month". At every level: it pays for
  Kyle's time and not the practice's bills, new pages and sections are
  quoted separately, unused edit time doesn't carry over, a change of level
  or a cancellation takes effect the next billing month, and Kyle never
  replies to reviews for a practice. The numbers live in
  `app/data/offer.ts` (`PRICES`, `CARE_LEVELS`) and nowhere else; change
  them and the terms together (`node scripts/offer-check.js` fails when
  they disagree). The only guarantees on the site are the ones in the
  terms.
- Honesty: no invented reviews, numbers, clients, results, logos or
  guarantees. The four findings on /google-check are real and anonymized;
  don't add more without Kyle. No testimonials until he supplies one word
  for word, with written permission (and remember that therapists
  generally can't ask their own clients for them, which is also why the
  Listing Fix sets up no review link and Website Care flags new reviews
  to the practice instead of replying). No stock or AI photos, with one
  exception the owner made himself: the hero scene he supplied
  (`public/hero/`). The only photo of Kyle is his own
  (`public/kyle-founder.*`).
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
  `prefers-reduced-motion` (the hero shows its still and its words don't
  rise; the nav's drop moves without the water). Outside the hero, the
  rise on scroll only. The optional motion and its library load after the
  page has (`app/motion/Motion.tsx`), so they never hold up the first paint.
- Accessibility failures are disqualifying: Lighthouse accessibility 95+.
- Don't merge to `main` or deploy to production without the owner's OK.

## Rules for a practice's site

These are for the sites Kyle builds for practices. They are not about
this site: Stringham Web Design's own demo form, its lead ledger
(Supabase) and its /manage page stay as they are, because the people who
write to this site are practice owners asking about a website, not people
looking for care.

On a site built for a practice, a visitor may be someone seeking care, so:

- No lead ledger and no database of form messages. The form sends one
  email to the practice's inbox, and the site keeps no list of its own.
  Don't copy this repo's ledger, its `/manage` page or its Supabase setup
  into a practice's site.
- The email-sending account is opened in the practice's name, like the
  domain, hosting and code accounts.
- Form fields: name, phone or email, and a best time to reach them. No
  open message box. A visible line asks visitors not to share health
  details.
- No session-recording or screen-replay tools. (This site runs Microsoft
  Clarity; a practice's site does not.)
- Scheduling and intake stay in the practice's own tool, linked from the
  site, never rebuilt inside it.

The Handoff page and the Free Website Checkup tell practices the same
thing (`app/data/ownership.ts`, the "Form" question in
`app/checkup/data.ts`). If one of these rules changes, change those words
with it.

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
