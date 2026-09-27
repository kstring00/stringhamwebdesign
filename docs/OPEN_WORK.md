# Open work

Updated 2026-09-27 (launch fixes).

## Needs the owner

- `NEXT_PUBLIC_BOOKING_URL` on Vercel (Production and Preview): the booking
  link for the free 30-minute call. Until it's set, no booking buttons render
  and every "book a call" path goes to /contact.
- Family Resource Hub answers in `app/data/hub.ts` → `clinicQuestions`:
  pricing after the 60-day trial, who keeps content up to date, and what
  happens if a clinic stops. Each renders only once its answer is filled in.
- A parent quote for the hub page (`hub.parentQuote`); renders only when set.
- At least one client testimonial. The site has none, by design, until one
  is supplied word for word.
- Confirm in Vercel → Domains that `stringhamwebdesign.com` redirects to
  `www.stringhamwebdesign.com` with a 301/308, and that http goes to https
  (Vercel does the latter automatically).

- Shut down the services the removed portal used (the code is gone; the
  accounts are not): the Supabase project (auth, database, storage), the Stripe
  webhook endpoint and any test products, the portal-notification usage of
  Resend (the contact form still uses Resend), and the dead Vercel env vars
  `SUPABASE_*`, `STRIPE_*`, `PORTAL_*`, `CAPTURE_*`.
- Push the git tag `archive-portal-2026-09` from a machine that can push tags
  (the build sandbox could push branches but not tags). The commit is the head
  of `archive/portal-site`, so nothing is lost either way.
- Confirm a real contact-form submission arrives at kyle@stringhamwebdesign.com
  on the preview deployment (the sandbox has no `RESEND_API_KEY`, so it was
  tested to the API route only).
- Items in `ASSETS_NEEDED.md` (photo).

## Could not be verified from the build sandbox

- The sandbox cannot reach commongroundautism.org (egress blocked), so the
  case-study screens were captured from the Common Ground source
  (`kstring00/CG2`, branch `claude/loving-newton-de9zlg`, the unbranded
  build) run locally. Compare them with the live site once and re-capture if
  the live site has moved on.

## Nice to have

- A second hub screenshot on `/family-resource-hub` once a clinic is live.
