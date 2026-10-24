# Leads and referral partners: setup and day-to-day

Every inquiry the site receives (the quote form, the checkup's "check my
site for me", the free Google check, the partner inquiry) is emailed to you
and written to one table, `leads`, which `/manage` turns into the monthly
dashboard. Calls and texts you take are logged there by hand. Referral
partners sign up at `/partners/join`, share `/checkup?ref=CODE` or
`/?ref=CODE`, and leads that arrive through those links carry the
partner's code.

## One-time setup (about 5 minutes)

1. **Create the tables.** Supabase → your project → SQL Editor → paste
   `supabase/migrations/20261014000000_referrals.sql` → Run, then paste
   `20261024000000_leads.sql` → Run. The second one turns `referral_leads`
   into `leads` (every lead, referred or not; existing rows are kept) and
   adds `search_months`. Both are safe to run again.
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
  in `leads` with the partner's code, and the email names the partner.
- **/checkup** shows "Shared with you by [first name]." for a valid code.

## What a lead stores, and what it doesn't

Each row keeps what's needed to follow up and to report: the kind of form,
business, name, phone or email, website, the checkup result, "how did you
hear about me", one short detail (the town for a Google check; what a
partner does and wants), where the visit came from (utm tags, the
**host** of the outside referrer such as `google.com`, and the first page
seen on this site), the partner code, and the status you set. Not stored:
IP addresses, user agents, or the free-text message (that's in the email).

The same person sending the same form twice on the same day is one lead:
the second submit is refused by a unique key, the email says "already
recorded today", and nothing is lost.

## At /manage

Sign in with `ADMIN_PASSWORD` (stays signed in 30 days). The page shows:

- **This month:** inquiries, consultations, quotes sent, signed clients,
  and inquiry → client. An inquiry is a validated form, or a call or text
  you logged. Taps on the phone number are never counted.
- **The last six months** as a table, with Search Console impressions and
  clicks beside each month once you've typed them in (the Performance
  report link is on the page; set its date range to the month).
- **Log a call or text:** a conversation you had by phone, so it counts.
- **All leads**, newest first. For each, set the **status** (New →
  Consultation held → Quoted → Hired → Client paid → Partner paid; or Not a
  fit, which removes it from every count), the **build price** from the
  written quote (Website Care never counts) and notes.
- **Referral partners** with their code, contact details and what they're
  owed.

A month's numbers are a cohort: a lead that came in during September and
signed in October counts as September's client, so each month's conversion
rate is "of the people who asked that month, how many signed".

The partner's 20% appears once a lead is "Client paid". Pay within 14 days
of the client paying in full, then mark it "Partner paid".

To deactivate a partner, set `active` to false on their row in Supabase →
Table Editor → partners. Their links stop crediting new visitors.

## The business card

The card's QR code points to `/card?ref=card`. `/card` is a **temporary
(307)** redirect to `/checkup?utm_source=card&utm_medium=print&utm_campaign=business-card`,
set in `next.config.ts`, so it can be repointed any time without breaking
printed cards (a 301 would be cached by phones forever). `card` is a
reserved code: it is never saved as a partner code, never replaces one, and
no partner can sign up with it. Card visitors' leads say
`Source: utm_source=card · utm_medium=print · utm_campaign=business-card`
in the email (and "Source: card" in /manage when a partner also referred
them). Clarity gets `card_scan` once per visit, with the session tagged
`source=card`; filter recordings by that tag.

## Clarity events

`partner_signup` (code), `ref_visit` (code), `ref_lead` (code). Clarity
never loads on `/manage`.
