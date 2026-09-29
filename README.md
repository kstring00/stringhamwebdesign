# Stringham Web Design

The public site for Stringham Web Design LLC (League City, Texas). Next.js 16
App Router, React 19, TypeScript, CSS Modules, GSAP. No UI library.

The client portal that used to live in this repo was removed in September 2026.
The last commit that carried it is tagged `archive-portal-2026-09` and kept on
the `archive/portal-site` branch.

## Running it

```
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
npm run lint
```

Copy `.env.example` to `.env.local`. Five variables, all optional
locally (the contact form logs instead of emailing without `RESEND_API_KEY`).

## Pages

`/` `/services` `/family-resource-hub` `/about` `/contact` `/privacy` plus a
designed 404. `/portal*`, `/admin*`, `/login`, `/pricing`, `/quote`, `/resources`, `/faq`,
`/work*`, `/portfolio*`, `/coffee-shops*` and `/autism-clinics*` redirect
permanently (301) (see `next.config.ts`).

## Where things live

- `app/data/` — every string that is content: site identity, nav, projects,
  services, process, FAQ, hub copy. Edit copy here, not in components.
- `app/globals.css` — the whole design system (tokens, type scale, grid,
  buttons, grain). Component files only arrange it.
- `app/motion/` — GSAP: smooth scroll (desktop, fine pointer only), reveals,
  magnetic buttons, cursor, marquee, page transition. Everything is disabled
  under `prefers-reduced-motion`, and every page reads fine without JS.
- `app/home/` — the homepage sections. `app/<route>/page.tsx` for the rest.
- `app/api/contact/route.ts` — the contact form backend (Resend).
- `app/motifs/` — the "sketch to real" motif: `sketch.ts` (seeded pencil
  geometry: rough lines, rectangles, circles, hatching, arrows),
  `Illustrations.tsx` (the six service drawings, pencil → finished on
  scroll) and the shared stroke styles. `app/motion/draw.ts` makes any
  `[data-stroke]` SVG path draw itself. Everything is complete without JS.
- `app/home/IdeaToReality.tsx` — the pinned signature section: one browser
  frame, four scroll-driven stages (sketch, plan, build, launch). The site
  inside it (Halfmoon Coffee) is fictional.
- `app/data/flags.ts` — `SHOW_CASA_MATCHA` (default false). Off renders
  nothing; on shows the Casa Matcha case study, whose copy and screens live
  in `app/data/casaMatcha.ts` and are still to be written.
- `public/common-ground/` — real captures of Common Ground (home, the six
  paths, "I feel overwhelmed") at 1440 and 390 wide, AVIF + WebP. The
  homepage case study (`app/home/CaseStudy.tsx`) is the only project on the
  site. Never mockups.
- `content/privacy.md` — the privacy policy, rendered at `/privacy`.
- `scripts/` — launch, Lighthouse and Clarity checks. See `scripts/README.md`.

## Analytics

Microsoft Clarity loads in production only, after page load, when
`NEXT_PUBLIC_CLARITY_ID` is set. The privacy policy covers it.
