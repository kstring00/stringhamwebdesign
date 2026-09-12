# Open work

Everything known to be unfinished as of 2026-09-12, written to be picked up
cold. Each item says what it is, why it matters, and where to start — so none
of it needs the original brief or the conversation it came from.

Nothing here is blocking a deploy. Production is live and healthy on `main`.

---

## 1. Verify before anything else

Two things were built and merged but never exercised against the live project.
Do these first — they are minutes of work, and if either is broken it changes
what else is worth doing.

### 1.1 Timesheet tab — never tested

Every other client-facing tab was walked end to end on 2026-09-11. The
timesheet was not. The code is in `app/portal/TimesheetPanel.tsx`.

With the dev server running (`npm run dev`) and both windows open per
`docs/PORTAL_TESTING.md`:

1. **As admin**, Quick add → **Log time** against Test Website. Log three
   entries so the grouping and the running total have something to show:
   - `2026-09-02` / Design / `Layout exploration` / **4.0** hours
   - `2026-09-04` / Design / `Type and colour` / **3.5** hours
   - `2026-10-01` / Build / `Homepage markup` / **3.0** hours
   The third is in a different month on purpose — that is what proves the
   month grouping rather than assuming it.
2. **As the client**, reload and open the **Timesheet** tab.

   Expect:
   - Two month groups, newest first: **October 2026** (3.0 hrs) and
     **September 2026** (7.5 hrs).
   - Header total **10.5 total**.
   - The check-in meter reading **0.5 of 10 hours since the last check-in**,
     with "the next one lands at 20 hours total".
   - On the entry that crossed 10.0 cumulative hours, an inline marker reading
     **10-hour check-in reached**.
3. **As admin**, click **Mark check-in sent** on the Time log check-in widget.
4. **As the client**, reload. That same marker should now read **10-hour
   check-in sent** rather than "reached".

The "reached" → "sent" flip is the assertion worth caring about: it is the
difference between the client seeing a cap was hit and seeing that Kyle
acknowledged it. `sentMarks` in `TimesheetPanel.tsx` drives it from the
`time_checkins` table.

If the marker never appears, the crossing arithmetic is the place to look —
`runningByEntry` orders oldest-first deliberately, because which entry crosses
a 10-hour boundary depends on the order the work happened in, not the order
the rows are displayed in.

### 1.2 Notification emails — never seen

`RESEND_API_KEY` has never been set in `.env.local`, so every portal
notification has silently no-opped. Routing is covered by 11 assertions in
`scripts/portal-notify-check.js`, but no real email has ever been sent. This
is blocked on item 3 below.

---

## 2. Test client cleanup

`Test Client` / `Test Practice` / `Test Website` is still live in the database,
created via `stringham00+testclient@gmail.com`.

**There is no rush.** It is genuinely useful to keep — it is the only way to
exercise the client side without inventing a new one, and everything in item 1
needs it. Delete it when the portal work is finished, not before.

When you do: **the delete order matters**, or foreign keys will block you. The
SQL is in `docs/PORTAL_TESTING.md` under "Cleaning up" — `clients` first, then
`users`, then the auth user under Authentication → Users in the dashboard.
Projects, checklist items, files, messages and time entries all cascade from
the `clients` row, so they do not need deleting individually.

---

## 3. Resend DNS — not set up, and it blocks all portal email

This is the single highest-value unblock left. Until it is done, every portal
notification silently does nothing.

**What is broken without it.** `app/lib/portalEmail.ts` returns
`{ sent: false, reason: "no-api-key" }` when `RESEND_API_KEY` is unset. Nothing
throws, nothing logs an error, and no email arrives. Three notifications are
affected: new message, new file, and the ten-hour check-in. The check-in is the
one that actually matters — it tells a client work has stopped and needs their
word to continue, which is the whole point of the cap.

**Sign-in is not affected.** Magic links come from Supabase Auth's own SMTP
(`/auth/v1/otp`), not Resend. Those already work.

**The four records**, added at your DNS host for `stringhamwebdesign.com`:

| Type | Host | Value |
|---|---|---|
| `MX` | `send` | `feedback-smtp.<region>.amazonses.com`, priority `10` |
| `TXT` | `send` | `v=spf1 include:amazonses.com ~all` |
| `TXT` | `resend._domainkey` | the long `p=MIGfMA0GCSq...` key from your Resend dashboard |
| `TXT` | `_dmarc` | `v=DMARC1; p=none;` |

Three things to get right:

- **The MX goes on the `send` subdomain, never the root.** A root MX record
  would redirect mail for `@stringhamwebdesign.com` away from Gmail. On the
  subdomain, your existing mail is untouched.
- **`<region>` must match the region you picked in Resend** (`us-east-1`,
  `eu-west-1`, …). Resend shows the exact hostname; copy it rather than
  assuming.
- **The DKIM value is unique to your domain** and exists only in your Resend
  dashboard. It cannot be written here or guessed.

**Then:** add `RESEND_API_KEY` and `PORTAL_FROM_EMAIL` to `.env.local` and to
the Vercel project settings. Until the domain verifies, mail falls back to
`onboarding@resend.dev` and lands in spam — deliverable enough to test with,
not to send a client.

---

## 4. Production environment variables (Vercel)

Every variable the app reads, what it does, and what actually breaks without
it. Set these under **Vercel → Project → Settings → Environment Variables →
Production**. Vercel does not restart on a change, so **redeploy after
editing** or the running instance keeps the old values.

### Required — the portal does not work without these

| Variable | Missing behaviour |
|---|---|
| `SUPABASE_URL` | `config()` in `app/lib/portalSupabase.ts` throws "Supabase server environment variables are not configured." Every portal route, sign-in included, returns 500. `instrumentation.ts` also warns at boot. Must be the **bare** project URL — a trailing `/rest/v1` triggers a loud boot warning and is corrected in memory, but fix the value. |
| `SUPABASE_SECRET_KEY` | Same throw, same result. This is the `sb_secret_*` key (formerly service_role) — server-only, it bypasses RLS. Never expose it to the browser. |
| `PORTAL_URL` | **The dangerous one.** Falls back to `NEXT_PUBLIC_SITE_URL + /portal`, then to `http://localhost:3000/portal`. Nothing errors — clients are simply mailed a sign-in link pointing at *their own machine*, which fails for them and looks fine to you. `portalUrlWarning()` prints at boot in production, but only in the log. Set it to `https://www.stringhamwebdesign.com/portal`. |

### Required for email to actually send

| Variable | Missing behaviour |
|---|---|
| `RESEND_API_KEY` | Silent no-op. `portalEmail.ts` returns `{ sent: false, reason: "no-api-key" }`, nothing throws, nothing logs an error. Kills the new-message, new-file and ten-hour check-in notifications, plus `/api/capture` and `/api/quote` confirmations. **Sign-in is unaffected** — magic links come from Supabase's own SMTP. Blocked on the DNS work in §3. |
| `PORTAL_FROM_EMAIL` | Falls back to `CAPTURE_FROM_EMAIL`, then `onboarding@resend.dev`, which lands in spam. Mail sends; clients may not see it. |
| `CAPTURE_TO_EMAIL` | Defaults differ per route — `kyle@stringhamwebdesign.com` in `/api/capture`, `stringham00@gmail.com` in `/api/quote` and `portalEmail.ts`. Inquiries still arrive, possibly at an address you do not read. Worth setting explicitly for that reason alone. |
| `CAPTURE_FROM_EMAIL` | Falls back to `onboarding@resend.dev`. Same spam problem. |

### Optional — sensible defaults, set them anyway

| Variable | Missing behaviour |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Only used as the fallback base for `PORTAL_URL`. Harmless if `PORTAL_URL` is set explicitly. **Public** — inlined into the client bundle, so never put anything secret here. |
| `PORTAL_ADMIN_EMAIL` | Defaults to `stringham00@gmail.com` (`DEFAULT_ADMIN_EMAIL` in `portalSupabase.ts`). Only that one address gets promoted to `admin` on first sign-in. If you ever change your address, setting this is what stops you locking yourself out. |

### Stripe — read the guard before setting these

`app/lib/stripe.ts` `requireTestKey()` **throws on anything that is not
`sk_test_`**. `sk_live_`, restricted (`rk_`) and publishable (`pk_`) keys all
fail. That is deliberate, and it means **the payments paths will not work in
production until someone consciously removes that guard.** Do not "fix" it by
pasting a live key; it will throw, not charge.

| Variable | Missing behaviour |
|---|---|
| `STRIPE_SECRET_KEY` | `StripeNotConfiguredError`. Invoice issuing and care plans are unavailable; `isStripeConfigured()` lets the needs route degrade rather than crash. |
| `STRIPE_WEBHOOK_SECRET` | Signature verification cannot run, so `/api/stripe/webhook` rejects everything. Payments would never be recorded — and the payment-before-transfer trigger depends on that record. |
| `STRIPE_CARE_PRICE_ID` | Only a fallback when `/api/portal/admin/care-plan` is called without a `priceId`; that route 400s if neither is present. |

### Not an environment variable, but in the same failure class

`https://www.stringhamwebdesign.com/portal` must be listed in Supabase under
**Authentication → URL Configuration → Redirect URLs**. Supabase refuses
unlisted redirect targets **quietly**: the magic link works, the user lands on
the site root, and nothing anywhere explains why. The localhost entry was
added 2026-09-11; the production entry has not been re-verified since.

## 5. Portfolio brief — sections 7, 8, 9

Three sections of the original nine were never delivered. Sections 1–6 are
done and merged.

### Section 7 — Transmission submit button audit

The button already exists at `app/TransmissionSubmit.tsx`, with a demo page at
`/transmission-demo`. It was built before the spec was written down and has
**never been checked against it**. This is an audit, not a build: go through
the list, fix what does not match.

The spec, in full:

- **Idle** — a slow carrier pulse, alive but not demanding attention.
- **Hover** — a scanline sweep, a ghost arrow, and a 2–3px pull toward the
  cursor.
- **Sending** — a segmented meter with a monospace counter, not a spinner.
- **Sent** — resolves to a gold rule. The `sentLabel` prop already exists so
  this can carry the real reply date rather than a generic "sent".
- **Error** — the meter stalls in place (it does not reset) and the gold
  shifts red.
- `aria-live` announces state changes.
- 44px minimum touch target.
- Works at 375px.
- All timings expressed as CSS custom properties, not hardcoded.

One trap, documented because it has already cost a debugging session: passing
**any** value to `controlledState` — including `"idle"` — makes `activate()`
return early, so `onTransmit` never fires. Let the button own its own
lifecycle unless you genuinely need to drive it from outside.

### Section 8 — Backgrounds and motion

Partly done; this is the finishing pass.

- **Faint technical grids on dark sections.** The work section and `/quote`
  already have one. Extend to the remaining dark sections.
- **Slow drifting gradient warmth on cream surfaces.** Not started.
- **Hairlines that draw in on scroll.** The process strip already does this;
  apply the same treatment elsewhere.
- **Instrument-panel section transitions.** Not started.

Constraint that applies throughout: every motion must have a
`prefers-reduced-motion` path, and the reduced path is an instant final state,
not a faster animation.

### Section 9 — `ASSETS_NEEDED.md` — done 2026-09-12

Written at the repo root. Three photograph slots on `/pricing` with exact
sizes, the `/work` screenshot spec, the dove, the Cal.com link, Stripe price
id, business email, legal pages, and testimonials.

---

## 6. Known-and-accepted, listed so they are not rediscovered as bugs

- **`/pricing` describes the process in four phases; everywhere else it is
  seven steps.** Deliberate, from the 2026-09-12 design reference. The four
  phases live in `app/data/pricing.ts` and each one names the steps of the
  seven it covers ("Steps 01–03 of the seven"), so the two cannot contradict.
  The deposit terms are one string, `depositTerms` in `app/data/process.ts`,
  shown in step 03 and under the four phases. If the seven steps change,
  check the four phases still summarise them.
- **Live updates are not wired.** After an action in one window, the other
  needs a manual reload. Deliberately deferred. Supabase Realtime on
  `messages`, `files`, `time_entries` and `project_onboarding_items` is the
  obvious route when it is wanted.
- **The AI intake tables are still in the database.** The UI, its three
  `/api/intake/*` routes and four supporting libs were removed on 2026-09-12
  because nothing referenced them. `public.intakes`, `public.intake_messages`
  and `public.intake_uploads` were **left in place** because
  `public.prospects.intake_id` carries a foreign key to `public.intakes`
  (`supabase/migrations/20260906214000_create_client_portal.sql`). Dropping
  them needs a migration that drops that column first, and `prospects` is
  described in its own migration as designed for the future
  `/start → quote → project` handoff — so this is a product decision, not a
  cleanup. `20260904232200_create_ai_intake_schema.sql` also creates the
  `pgcrypto` extension and an `intake-uploads` storage bucket; both would
  need consideration.
- **`BUSINESS_TIME_ZONE` is `America/Chicago` with a 17:00 cutoff.** Both
  confirmed 2026-09-12 and settled — not open questions. The zone had been
  `America/New_York`, inferred from a misreading of the *client* project "Lake
  City Self Storage"; League City, TX is correct. The 17:00 cutoff is correct
  as written. Both are single constants in `app/lib/businessDays.ts` and both
  decide a date the site promises a client in writing on `/quote/received`, so
  neither should be changed casually.
- **The binder headline "The work, up close." stays.** Confirmed 2026-09-12 —
  shipping it rather than holding the section for a rewrite.
- **`AGENTS.md` / `CLAUDE.md` stay committed.** Confirmed 2026-09-12. They are
  regenerated by `next dev`, so they will reappear as uncommitted changes;
  commit them with your work rather than reverting.

---

## 7. Where things live

| What | Where |
|---|---|
| Applying migrations, and the CLI | `docs/SUPABASE_MIGRATIONS.md` |
| Testing the portal, creating a test client | `docs/PORTAL_TESTING.md` |
| Real Stripe test-mode invoice run | `docs/stripe-invoice-test-run.md` |
| Verification scripts and how to run them | `scripts/README.md` |
| Prior context and decisions | `HANDOFF.md` |

```bash
npm run dev          # always dev, not start — session cookies are Secure in prod builds
npm run db:status    # migrations: local vs remote
npm run db:push -- --dry-run
npm run db:push
```
