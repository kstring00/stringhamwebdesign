# Checks

All run against a production build (`npm run build && PORT=3300 npm start`)
with Playwright and Lighthouse installed locally, not saved:

    npm install --no-save playwright pngjs lighthouse --legacy-peer-deps

- `launch-check.js` — the launch checklist: crawls every public page and
  asserts titles, descriptions, one h1, alt text, landmarks and skip link,
  the phone and primary CTA on every page, the footer, JSON-LD, no banned
  words, the old-route redirects, the 404, robots and sitemap, the icons and
  social image, external-link safety, and at 375px and 414px no overflow,
  44px controls and readable text.
- `link-check.js` — crawls the sitemap and every internal href on those pages
  and reports any non-200; also asserts each retired route (`/quote`,
  `/pricing`, `/resources/*`, `/work/*`, `/portfolio`, `/faq`, `/portal`, …) answers
  with a 301 to exactly the right place, and that unknown routes 404. Needs
  no extra packages.
- `lighthouse-check.js <path>` — mobile and desktop scores; asserts mobile
  performance ≥ 80 and accessibility ≥ 95.
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
- `migration-check.js` — runs `supabase/migrations/20261024000000_leads.sql`
  against a real Postgres (PGlite, in-process) four ways: a clean database,
  an existing one with referred leads from the older migrations (rows,
  statuses and build prices preserved), run twice, and the old code's
  insert shape still accepted after it (rollback safety). Install once:
  `npm install --no-save @electric-sql/pglite`, then
  `node scripts/migration-check.js`.

    BASE=http://localhost:3300 NODE_PATH=./node_modules node scripts/launch-check.js
