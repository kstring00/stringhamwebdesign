# Open work

Updated 2026-09-27 with the `revamp-2026` rebuild.

## Needs the owner

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
- Items in `ASSETS_NEEDED.md` (Lake City, photo).

## Could not be verified from the build sandbox

- Outbound requests to client sites return 403, so the three `/work` links
  were not fetched and no fresh Playwright captures of the live sites were
  taken. Open each once on the preview: commongroundautism.org,
  beethebehaviorbae.com, withlittle.app.

## Nice to have

- AVIF variants of the work captures (WebP is shipped).
- A second hub screenshot on `/family-resource-hub` once a clinic is live.
