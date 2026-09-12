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
| **FAQ** | No photograph and no left column — the questions run full width under their heading. | Nothing needed. This is deliberate — see the note below. |
| **Close** | `close-forest.webp` (2000 × 1333, 412 KB) + a 1200w variant. The foggy valley, full bleed, scrimmed on the left. | Done. |
| **Hero, right of the headline** | cream block, gold disc, navy card reading "Ideas / Brands / Websites / that last" | Still open: a still life — laptop, desk, something warm and physical. **1400 × 1120** (5:4) at 2×; crops to 16:9 under 64rem. |

The FAQ carried a dissolving-statue photograph until 2026-09-12, then briefly
a typographic pull quote, and now nothing — the questions run full width under
their heading, the way the two sections above them do. If you ever want
something in that space, the answer is screenshots of real work rather than
stock or an AI render; that needs three good ones and there are not three yet.

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
| Lake City Self Storage | `/work/lake-city-self-storage/drive-up.webp` |
| GrowthGains | `/work/growthgains/home.webp` — current, from a 2026-09-12 capture of the live hero |
| With Little | `/hero-crt/with-little-daily.png` — PNG, should be WebP |

The two PNGs are the size problem on the work pages; re-export as WebP at the
size above.

### Three uploads arrived truncated

`bcba-prep/dashboard.webp`, `lake-city-self-storage/home.webp` and
`with-little/dashboard.webp` were all committed as partial files. Each one had
a valid-looking header declaring a length two to three times what was actually
there, so listings showed a plausible file and every page using one rendered an
empty box. All three are deleted and their references removed.

Two of the three are now covered by other screenshots. **One slot is genuinely
empty and worth refilling:**

| Missing | Was |
|---|---|
| BCBA Prep member dashboard | `/work/bcba-prep/dashboard.webp` — purchased domains, quick actions, study-journey guidance |

Re-export at 1920 wide as WebP, drop it in, and add it back to that project's
`screenshots` array. `scripts/project-images-check.js` decodes every referenced
image and loads each case study in a browser, so a truncated upload fails a
check now instead of shipping.

Still wanted, not blocking: a real Lake City **homepage** capture. The case
study currently opens on the drive-up storage page, which carries the facility
photograph and the storage-type decision, so it reads correctly — but the
homepage is the stronger opening frame if you have it.

## 2b. Hero — `/work`

Filled 2026-09-12. `public/work/hero-forest.webp` (2000 × 1333, 210 KB) with
1280 and 900 variants, from a Niilo Isotalo photograph. Low sun through pines:
near-black down the left where the copy sits, warm light breaking through on
the right. Nothing needed here unless the photograph is being replaced — if it
is, match the shape (dark on the side the copy sits on) or the scrim in
`app/work/work.module.css` has to be re-tuned, and `scripts/work-hero-check.js`
will say so.

## 1b. Hero — `/about`

Filled 2026-09-12. `public/about/hero-mountains.webp` (2000 × 1333, 181 KB)
with 1280w and 900w variants — sunrise over a sea of cloud, from an Unsplash
photograph by Sam Ferrara. Source JPEG is in history at `2214abd`.

This replaced an AI-generated gold-liquid render. Worth noting for whoever
swaps it next: the liquid image was near-black down its left third, so its
scrim only had to deepen what was already there. This one is bright across the
top, so the gradient is doing real work to keep the copy readable — check
`scripts/about-check.js` after any change to the image or its
`object-position`, because a crop that moves the bright sky under the headline
will fail contrast without looking obviously wrong.

## 1c. Homepage process scene

Filled 2026-09-12. `public/process/doves.webp` (724 × 772, 9 KB) — white doves
on black, composited with `mix-blend-mode: screen` so the black ground drops
out and no cut-out was needed. The ridge behind the lower third is
`public/pricing/close-forest.webp`, reused rather than copied.

The dove source is small; it is soft at very wide viewports. A larger version
(1600px+ on the long edge, same white-on-black) would sharpen it. Not urgent.

## 3. The dove illustration

Resolved 2026-09-12. The inline `StaticDove` SVG in `app/ProcessSteps.tsx` was
replaced by the photograph above and deleted. A stroked dove mark still sits in
the masthead (`Header.module.css`, `.doveMark`, from `/ks-dove-mark.png`); if a
finished illustration is ever supplied for that, SVG in a single colour would
let it take the gold and navy from CSS.

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

## 1c. Hero headshot cutout — `/about`

**Stand-in.** `public/about/headshot.png` (sampled for the particle version)
and `headshot.webp` (the plain image, 19 KB) are cut from the full-size selfie
by a colour threshold, not a real background removal: the edge is rough and
the left of the face sits on the frame edge. Drop the real cutout — transparent
background, the whole head and shoulders, roughly 600–900px wide — at
`public/about/headshot.png`, re-export the webp beside it under 120 KB, and the
page picks both up with no code change.

