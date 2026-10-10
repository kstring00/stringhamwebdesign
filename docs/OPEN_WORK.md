# Open work

Updated 2026-10-09 (referral terms, /websites).

## Needs the owner

- Send one real request through each form on the live site (free check,
  website quote, partner inquiry) and confirm each arrives at
  kyle@stringhamwebdesign.com. Without `RESEND_API_KEY` in Vercel
  Production, requests are only written to the Vercel logs.
- Referral reward: decide whether it applies to any new client, or only to
  businesses that weren't already talking to Kyle, and whether there's a
  payout window. Today the site says only "paid once the business has paid
  for its website in full".
- Dubai & Dips is shown as archived with a demo link
  (dubaianddips2.vercel.app). Confirm the owner is fine with it being public.
- The Vary Board is off the partner page (`onPartners: false`) until the owner
  agrees. Northline and Casa Matcha are off too; their data is kept.
- Set `NEXT_PUBLIC_CLARITY_ID` in Vercel (Production only) if it isn't, so the
  custom events (`free_check_submit`, `website_quote_submit`, `cta_click`,
  `call_tap`, `email_click`, `work_sample_click`, `terms_view`) start
  recording.
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
