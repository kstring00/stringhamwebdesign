# Leads and referral partners: setup and day-to-day

Every inquiry the site receives (the quote form, the checkup's "check my
site for me", the free Google check, the partner inquiry) is emailed to you
and written to one table, `leads`, which `/manage` turns into the monthly
dashboard. Calls and texts you take are logged there by hand. Referral
partners sign up at `/partners/join`, share `/checkup?ref=CODE` or
`/?ref=CODE`, and leads that arrive through those links carry the
partner's code.

## One-time setup (about 5 minutes)

1. **Create or widen the tables.** Supabase → your project → SQL Editor →
   paste `supabase/migrations/20261024000000_leads.sql` → Run. On a fresh
   project it creates `partners`, `referral_leads` and `search_months`; on
   the existing project it widens `referral_leads` in place (nothing is
   renamed or dropped, every referred lead and its status and build price
   stay). Safe to run again. The two older files are no longer needed.

   **Order matters for a deploy with no downtime:** run the SQL *first*,
   then deploy. The code on main keeps working after the SQL (it only
   writes the original columns). The new code needs the SQL (new columns
   and statuses); without it, leads still email but aren't saved, and the
   email says "Not saved to /manage". **Rollback:** redeploy the previous
   version; no SQL to undo. `scripts/migration-check.js` proves all of
   this against a real Postgres.
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

## What the visitor sees

A form says "got it" only when the request reached at least one durable
place: an email actually sent (Resend), or a row in the ledger. If both
are missing (no `RESEND_API_KEY` and no Supabase, or both failed), the
visitor gets an honest "I couldn't send that just now. Please text or
email me directly." and the server log records *which* destination failed,
never what was typed. Nothing a prospect types is written to any log;
Supabase error details are redacted before logging.

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

- **This month:** inquiries, consultations, quotes sent, signed (from this
  month's inquiries) and signed this calendar month. An inquiry is a
  validated form or a logged call or text from a prospective website
  customer. Partner inquiries are counted separately. Taps on the phone
  number are never counted.
- **The last six months** as a table, with Search Console impressions and
  clicks beside each month once you've typed them in (the Performance
  report link is on the page; set its date range to the month).
- **Where inquiries come from:** every source with its evidence: *partner*
  (a partner's code on the link), *campaign* (utm tags, e.g. the business
  card), *referrer* (what the browser reported; often stripped),
  *self-reported* (what they said), or *unknown* (none of those; not proof
  of a direct visit).
- **Explain my leads:** a button that sends only the counts (no names,
  contacts, notes, partner codes or websites) to Anthropic's cheapest
  current model and shows a short plain-English reading. Needs
  `ANTHROPIC_API_KEY` in Vercel; without it the button explains that and
  the numbers stand on their own. One short request per click, the same
  numbers aren't sent twice in a day, 20 a day at most.
- **Log a call or text:** a conversation you had by phone, so it counts;
  "how they heard" is a fixed list.
- **All leads**, newest first. For each, set the **status** (New →
  Consultation held → Quoted → Hired → Client paid → Partner paid; or Lost,
  a real inquiry that didn't become a project and still counts; or Spam,
  left out of everything), the **build price** from the written quote
  (Website Care never counts) and notes. "Hired" stamps the signed date.
- **Referral partners** with their code, contact details and what they're
  owed. Only a referred lead (one with a partner code) can owe a partner.

A month's numbers are a cohort: a lead that came in during September and
signed in October counts as September's "signed" and October's "signed this
calendar month", so each month's conversion rate is "of the people who
asked that month, how many signed", and the calendar column answers "how
many did I sign this month".

## Before launch: the controlled live-form check

After the SQL has run and the site is deployed with `RESEND_API_KEY`,
`SUPABASE_URL`, `SUPABASE_SECRET_KEY` and `ADMIN_PASSWORD` set in Vercel
(Production): send one request through each form on the live site with
the word TEST in the business name (quote, checkup "check my site for me",
free Google check, partner inquiry). Each email must end "Saved to
/manage"; `/manage` must show the four TEST leads with their sources. Mark
them Spam so they drop out of the numbers.

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
