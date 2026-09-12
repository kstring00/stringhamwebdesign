# Assets needed

Everything the site is waiting on from Kyle, in one place, so it can be
gathered in a sitting rather than discovered one blocker at a time. Each item
says where it goes, what size or shape it has to be, and what is showing there
today.

Nothing here blocks a deploy. Every slot renders a designed placeholder until
the real thing lands.

---

## 1. Photographs — `/pricing`

Two of the three slots are filled as of 2026-09-12. Sources were uploaded to
the repo root and are kept in history at `d856b4d`; the tree carries only the
sized WebPs under `/public/pricing/`.

| Slot | Today | Wants |
|---|---|---|
| **FAQ** | `faq-thinker.webp` (1482 × 1061, 193 KB) + a 900w variant. The dissolving Thinker, behind glass panels. | Done. A higher-resolution source would let the desktop crop breathe at very wide viewports; not urgent. |
| **Close** | `close-forest.webp` (2000 × 1333, 412 KB) + a 1200w variant. The foggy valley, full bleed, scrimmed on the left. | Done. |
| **Hero, right of the headline** | cream block, gold disc, navy card reading "Ideas / Brands / Websites / that last" | Still open: a still life — laptop, desk, something warm and physical. **1400 × 1120** (5:4) at 2×; crops to 16:9 under 64rem. |

Compress before committing: WebP, quality ~80, under 450 KB for full-bleed
and under 250 KB otherwise. `sharp` ships with Next, so from the repo root:

```bash
node -e "require('sharp')('source.jpg').resize({width:2000}).webp({quality:80}).toFile('public/pricing/name.webp')"
```

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
