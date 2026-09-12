# Real-invoice test run (Stripe test mode)

How to exercise the payments path end to end against real Stripe, with invoice
ids that actually match rows in `invoices` — so the handoff gate opens for real.

**Do not use `stripe trigger` for this.** It fabricates an invoice with a random
`in_...` id that no row references, so `applyInvoicePaid` finds nothing and
returns `No invoice row for in_...`. That confirms the plumbing and nothing else.
The run below creates a genuine invoice *and* its row in one call, so the
`invoice.paid` Stripe sends back already matches.

Test mode only. `requireTestKey()` throws on anything that is not `sk_test_`.

---

## 0. Preconditions

- `.env.local` filled in per `.env.example`. `SUPABASE_URL` must be the **bare
  project URL** — if it ends in `/rest/v1` the server prints a loud warning at
  startup and corrects it in memory; fix the value anyway.
- `STRIPE_SECRET_KEY` is an `sk_test_` key, and `STRIPE_CARE_PRICE_ID` points at
  a **test-mode** recurring price if you intend step 6.
- Migrations applied through `20260908180000_grant_stripe_events_to_service_role.sql`.
  See `docs/SUPABASE_MIGRATIONS.md` for how to apply and how to check.
- Your admin email matches `PORTAL_ADMIN_EMAIL` (or the hardcoded default in
  `app/lib/portalSupabase.ts`) — `bootstrapAdminIfNeeded` only promotes that one
  address to `admin`.

Two terminals, both left running:

```bash
npm run dev                                              # terminal 1
stripe listen --forward-to localhost:3000/api/stripe/webhook   # terminal 2
```

Copy the `whsec_...` that `stripe listen` prints into `STRIPE_WEBHOOK_SECRET` in
`.env.local` and **restart `npm run dev`**. It is not the dashboard's signing
secret, and Next does not reload env vars in place.

---

## 1. Sign in as admin

```bash
curl -s localhost:3000/api/portal/auth/request-link \
  -H 'Content-Type: application/json' \
  -d '{"email":"YOUR_ADMIN_EMAIL"}'
```

Open the emailed magic link in a browser. That lands on the portal, which posts
the tokens to `/api/portal/auth/session` and sets the `swd_portal_access` cookie.

Every admin route below is gated by `getPortalSession()` with
`profile.role === "admin"`, so the cookie must travel with each request. Pull it
out of devtools once and reuse it:

```bash
COOKIE='swd_portal_access=PASTE_VALUE_HERE'
curl -s localhost:3000/api/portal/auth/session -H "Cookie: $COOKIE"
```

Expect `{"authenticated":true, ... "role":"admin"}`. A `401` means the cookie is
wrong; a `403` on later calls means you are signed in but not admin.

---

## 2. Seed a client and a project with an agreed total

One call creates the user, the client and the project together:

```bash
curl -s localhost:3000/api/portal/admin/invite \
  -H "Cookie: $COOKIE" -H 'Content-Type: application/json' \
  -d '{
    "email":"test-client+run1@example.com",
    "name":"Test Client",
    "businessName":"Test Business",
    "projectName":"Stripe Test Run 1",
    "quotedTotal":2400.00
  }'
```

Keep the returned **project id**. `quotedTotal` is the agreed total; invoices are
generated from it and never typed in at the invoice API.

`splitTotal` puts odd cents on the deposit, so 2400.00 splits 120000 / 120000
cents. Use something like `2400.01` if you want to see the 120001 / 120000 split.

---

## 3. Raise the deposit invoice

```bash
curl -s localhost:3000/api/portal/admin/invoices \
  -H "Cookie: $COOKIE" -H 'Content-Type: application/json' \
  -d '{"projectId":"PROJECT_ID","kind":"deposit","scopeSummary":"Test run"}'
```

This drafts, attaches the line item, finalises and sends a real test invoice, then
writes `stripe_invoice_id` and `stripe_hosted_url` to the `invoices` row. Keep the
hosted URL.

Check before paying anything:

```sql
select id, kind, status, stripe_invoice_id, amount_cents
from invoices where project_id = 'PROJECT_ID';
```

Expect one `deposit` row, `status = 'sent'`, with a real `in_...` id.

---

## 4. Pay the deposit

Open the hosted URL and pay with `4242 4242 4242 4242`, any future expiry, any
CVC. Watch `stripe listen` forward `invoice.paid`.

Then:

```sql
select event_id, type, status, detail from stripe_events order by received_at desc limit 10;
select kind, status, paid_at from invoices where project_id = 'PROJECT_ID';
select status, started_at, final_payment_cleared_at from projects where id = 'PROJECT_ID';
```

Expect:

- a `stripe_events` row, `status = 'handled'`, detail `Deposit paid; project ... moved to build.`
- the deposit invoice `status = 'paid'` with `paid_at` set
- the project `status = 'build'` with `started_at` set
- **`final_payment_cleared_at` still null** — a deposit must not open the gate

Confirm the gate is shut:

```bash
curl -s -X POST localhost:3000/api/portal/admin/handoff \
  -H "Cookie: $COOKIE" -H 'Content-Type: application/json' \
  -d '{"projectId":"PROJECT_ID"}'
```

Expect **409**. That is the point of the exercise.

---

## 5. Raise and pay the final invoice

Same call with `"kind":"final"`, then pay it the same way.

```sql
select status, final_payment_cleared_at, ownership_transferred_at
from projects where id = 'PROJECT_ID';
```

`final_payment_cleared_at` is now set. The handoff call from step 4 should now
return success, and `ownership_transferred_at` gets set.

The database enforces this independently of the route. Prove it — try to set the
column directly on a project whose final invoice is unpaid:

```sql
update projects set ownership_transferred_at = now()
where id = 'SOME_OTHER_UNPAID_PROJECT_ID';
```

Expect the `projects_payment_before_transfer` trigger to reject it. The route's
409 is a courtesy; this is the actual guarantee.

---

## 6. Care plan subscription (optional)

```bash
curl -s localhost:3000/api/portal/admin/care-plan \
  -H "Cookie: $COOKIE" -H 'Content-Type: application/json' \
  -d '{"projectId":"PROJECT_ID"}'
```

Uses `STRIPE_CARE_PRICE_ID` unless you pass `priceId`. Cancel it from the Stripe
dashboard and confirm the `customer.subscription.deleted` webhook sets
`care_plans.status = 'cancelled'` with `cancelled_at`, and that
`projects.final_payment_cleared_at` is untouched — cancelling care never affects
what is owed on the build.

---

## 7. Idempotency (worth doing once)

```bash
stripe events resend EVENT_ID
```

The row count in `stripe_events` must not change and no invoice may be patched
twice. The primary key on `stripe_events` is what makes the redelivery a no-op.

---

## Cleanup

Test-mode data can be wiped from the Stripe dashboard. In Supabase, delete the
project, its client and user, and the `stripe_events` rows from the run. Use a
`+run1` style email alias per run so repeats do not collide.

---

## If nothing lands in `stripe_events`

The webhook returns **500** when the event store is unreachable, so `stripe
listen` will show a non-2xx and Stripe will retry. A `200` with
`{"duplicate":true}` means the id was genuinely already claimed. Anything odd —
check the `next dev` console: `adminRest` logs the status and body before
throwing, and that log is the fastest route to the cause.
