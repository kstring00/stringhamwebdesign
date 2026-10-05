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

    BASE=http://localhost:3300 NODE_PATH=./node_modules node scripts/launch-check.js
