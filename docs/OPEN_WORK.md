# Open work

Updated 2026-10-08 (/partners).

## Needs the owner

- /partners: approve the referral reward terms and partner pricing in writing
  before any amount is published (the page describes compensation without
  a number).
- /partners selected work features Common Ground, Dubai & Dips and The Vary
  Board. For Dubai & Dips and The Vary Board, confirm the "Work in progress"
  label and that each owner is fine being shown, then set `confirmed: true`
  in `app/data/work.ts`. Until then they appear only on preview deployments.
  If either has a working public preview the owner is happy to share, add it
  as `previewUrl`. Northline and Casa Matcha are off the partner page
  (`onPartners: false`); their data and screenshots are kept.
- A real, approved photo for the founder block (initials show until then).
- Confirm a partner inquiry arrives at kyle@stringhamwebdesign.com on the
  preview (delivery was verified only to the server log in the sandbox).

- Kyle's photo for the About block (see `ASSETS_NEEDED.md`).
- Confirm a real free check submission arrives at kyle@stringhamwebdesign.com
  on the preview (the sandbox has no `RESEND_API_KEY`, so delivery was tested
  to the API route only; the email body, reply-to and source line were
  verified in the server log).
- Set `NEXT_PUBLIC_CLARITY_ID` in Vercel (Production only) if it isn't, so the
  custom events (`free_check_submit`, `cta_click`, `email_click`,
  `terms_view`) start recording.
- Merge order: #28 (V4, what was live), then #29 (`/terms`), then the
  conversion-first PR. Or merge the conversion-first PR alone: it carries
  everything.
- Shut down the services the removed portal used: the Supabase project, the
  Stripe webhook endpoint and test products, and the dead Vercel env vars
  `SUPABASE_*`, `STRIPE_*`, `PORTAL_*`, `CAPTURE_*`. (Stripe itself stays for
  the Listing Fix checkout, which links to /terms.)
- Push the git tag `archive-portal-2026-09` from a machine that can push tags.

## Could not be verified from the build sandbox

- Turbopack's font downloader does not use the sandbox's proxy, so local
  verification builds ran with `next build --webpack`. Vercel builds with
  Turbopack normally.
