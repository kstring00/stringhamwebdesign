# Referral partners: setup and day-to-day

The share-and-earn system: partners sign up at `/partners/join`, share
`/checkup?ref=CODE` or `/?ref=CODE`, and leads that arrive through those
links are tagged with the partner's code. You track each lead at `/manage`.

## One-time setup (about 5 minutes)

1. **Create the tables.** Supabase → your project → SQL Editor → paste
   `supabase/migrations/20261014000000_referrals.sql` → Run.
2. **Add three environment variables** in Vercel → the project → Settings →
   Environment Variables (Production):
   - `SUPABASE_URL`: the project URL, e.g. `https://abcd1234.supabase.co`
     (Supabase → Project Settings → Data API).
   - `SUPABASE_SECRET_KEY`: a secret key, `sb_secret_…` (Project Settings →
     API Keys). Server only; never add `NEXT_PUBLIC_` to it.
   - `ADMIN_PASSWORD`: the password for `/manage`, 8+ characters.
3. **Redeploy** (Deployments → the latest → Redeploy) so the variables load.

Until then, `/partners/join` tells people to text you, ref links are not
saved, and quote emails still show any `ref` code with a "not checked" note.

## How it works

- **Links carry only a code.** Codes are 3–32 letters, numbers and hyphens.
- **90 days, first link wins.** A visitor's code is saved in a first-party
  cookie (`swd_ref`) and localStorage, but only after the server confirms it
  belongs to an active partner. A later link from another partner doesn't
  replace it.
- **What gets tagged:** the home page quote form, the checkup's "Check my
  site for me" form, and the checkup's quote link. Each tagged lead lands
  in `referral_leads` and the email names the partner.
- **/checkup** shows "Shared with you by [first name]." for a valid code.

## At /manage

Sign in with `ADMIN_PASSWORD` (stays signed in 30 days). Each partner shows
their code, contact details and leads. For each lead set:

- **Status:** New → Quoted → Hired → Client paid → Partner paid.
- **Build price** from the written quote (Website Care never counts).

The partner's 20% appears once a lead is "Client paid". Pay within 14 days
of the client paying in full, then mark it "Partner paid".

To deactivate a partner, set `active` to false on their row in Supabase →
Table Editor → partners. Their links stop crediting new visitors.

## Clarity events

`partner_signup` (code), `ref_visit` (code), `ref_lead` (code). Clarity
never loads on `/manage`.
