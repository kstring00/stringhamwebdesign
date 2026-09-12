# Assets needed

Everything the site is waiting on from Kyle, in one place, so it can be
gathered in a sitting rather than discovered one blocker at a time. Each item
says where it goes, what size or shape it has to be, and what is showing there
today.

Nothing here blocks a deploy. Every slot renders a designed placeholder until
the real thing lands.

---

## 1. Photographs — `/pricing`

Three image slots, each currently a solid warm block with a small typographic
mark so the composition holds. Replace by dropping a file into `/public` and
pointing the slot at it; the placeholder markup is in `app/pricing/page.tsx`,
each one commented "Image slot".

| Slot | Today | Wants | Size |
|---|---|---|---|
| Hero, right of the headline | cream block, gold disc, navy card reading "Ideas / Brands / Websites / that last" | a still life: laptop, desk, something warm and physical | **1400 × 1120** (5:4) at 2×; crops to 16:9 under 64rem |
| FAQ, left of the questions | cream block with the caption "Good websites create opportunity." | landscape or a working space, calm, cool tones to sit against the cream | **1000 × 1250** (4:5) at 2×; crops to 16:9 under 64rem |
| Close, right of the CTA on navy | dark navy block with the caption "Same discipline. Different mountains." | dark, textural — marble, stone, night — must stay dark for the cream text beside it | **1200 × 900** (4:3) at 2×; crops to 16:9 under 64rem |

Compress before committing: WebP, quality 80, under 250 KB each. The work
pages already ship WebP for this reason (`/public/work/**`).

Optional, from the design reference: a handwritten "Build Something
Meaningful" script mark beside the packages heading. Needs a script typeface
or an SVG of the lettering; not rendered today.

## 2. Screenshots — `/work`

Each project's hero slot is **16:9** (`app/work/work.module.css`). Supply at
**1920 × 1080**, WebP. Current files, where they exist, in
`app/data/projects.ts`:

| Project | File today |
|---|---|
| Common Ground | `/hero-crt/common-ground.png` — PNG, should be WebP |
| BCBA Prep | `/hero-crt/bcba-prep.png` — PNG, should be WebP |
| Lake City Self Storage | `/work/lake-city-self-storage/home.webp` |
| With Little | `/work/with-little/dashboard.webp` |

The two PNGs are the size problem on the work pages; re-export as WebP at the
size above.

## 3. The dove illustration

Referenced in section 3b of the brief. A hand-drawn dove currently exists as
an inline SVG in `app/ProcessSteps.tsx` (`StaticDove`), and a stroked dove
mark sits in the masthead (`Header.module.css`, `.doveMark`). If a finished
illustration is coming, it replaces the SVG in `ProcessSteps.tsx`; supply as
SVG, single colour, so it can take the gold and navy from CSS.

## 4. Links and IDs

| What | Where it goes | Today |
|---|---|---|
| Cal.com booking link | the reply email after a quote (`app/api/quote/route.ts`) and step 02 copy | not set — the reply says "a link to book a call" without one |
| `STRIPE_CARE_PRICE_ID` | `.env.local` and Vercel; the care-plan route falls back to it | not set |
| Public business email | `CAPTURE_TO_EMAIL`, footer, `/about` | routes fall back to three different defaults — see `docs/OPEN_WORK.md` §4 |

## 5. Copy that only you can write

- **Legal pages** — a privacy policy and terms. Neither route exists yet;
  they are needed before the care-plan subscription is offered publicly.
- **`/quote/received` reply-date copy** is done; nothing outstanding there.
- **Testimonials** — `/pricing` promises one from every client at launch.
  None are on the site yet; there is no slot for them until there is one to
  show.

## 6. Resend domain verification

Not an asset, but it gates every notification email. The four DNS records
are in `docs/OPEN_WORK.md` §3.
