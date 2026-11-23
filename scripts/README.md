# Checks

All run against a production build (`npm run build && PORT=3300 npm start`)
with Playwright and Lighthouse installed locally, not saved:

    npm install --no-save playwright pngjs lighthouse --legacy-peer-deps

- `launch-check.js` — the launch checklist: crawls every public page and
  asserts titles, descriptions, one h1, alt text, landmarks and skip link,
  the phone and primary CTA on every page, the footer, JSON-LD, no banned
  words, the old-route redirects, the 404, robots and sitemap, the icons and
  social image, external-link safety; the hero (the still first, the video
  only when it is welcome, its pause button, reduced motion and data
  saver); the nav (six links, the right current page on every route, arrow
  keys, client-side routing, water that rests, the fallback without WebGL,
  its placement); and at 320, 375, 390 and 414px no overflow, 44px controls
  and readable text.
- `link-check.js` — crawls the sitemap and every internal href on those pages
  and reports any non-200; also asserts each retired route (`/quote`,
  `/pricing`, `/resources/*`, `/work/*`, `/portfolio`, `/faq`, `/portal`, …) answers
  with a 301 to exactly the right place, and that unknown routes 404. Needs
  no extra packages.
- `lighthouse-check.js <path>` — mobile and desktop scores; asserts mobile
  performance ≥ 80 and accessibility ≥ 95.
- `hero-media.js <video> <still>` — makes everything in `public/hero/` from
  the two source files: the loop joined so it has no jump, as MP4, WebM and a
  small MP4 for phones, and the still in AVIF, WebP and a phone crop. Needs
  ffmpeg.
- `logo-light.js` — makes the light logo for the dark site from the lockup.
- `share-image.js` — draws `app/opengraph-image.png`, the hero in small.
- `clarity-check.js` — the analytics tag loads only in production with an id,
  and only after load.
- `leads-check.js` — unit tests for the lead ledger's pure logic
  (`app/lib/leadStats.ts`, `app/lib/referrals.ts`): referral money only on
  referred leads ($2,000 direct paid → $0; referred → $400), the month
  cohorts and the calendar "signed this month" across a month boundary,
  partner inquiries out of the funnel, lost vs spam, the source evidence
  order, the dedupe key, and that the aggregate sent to the AI contains no
  name, contact, note, code or host. Needs no server and no packages:
  `node scripts/leads-check.js`.
- `offer-check.js` — unit tests for the offer: Website Care's three levels
  in `app/data/offer.ts` (prices, edit minutes, what each adds, the rules
  that hold at every level), and that `content/service-terms.md` and the
  Handoff page say the same; the nav's six items and their routes; and
  that "Why not a template?" stays fair and makes no claim with a number. This is what fails when the terms and the
  prices drift. Needs no server and no packages:
  `node scripts/offer-check.js`.
- `migration-check.js` — runs `supabase/migrations/20261024000000_leads.sql`
  against a real Postgres (PGlite, in-process) four ways: a clean database,
  an existing one with referred leads from the older migrations (rows,
  statuses and build prices preserved), run twice, and the old code's
  insert shape still accepted after it (rollback safety). Install once:
  `npm install --no-save @electric-sql/pglite`, then
  `node scripts/migration-check.js`.

    BASE=http://localhost:3300 NODE_PATH=./node_modules node scripts/launch-check.js
