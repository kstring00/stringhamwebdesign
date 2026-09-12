# Handoff — stringhamwebdesign

Written for a new assistant picking this up cold. Read this whole file before
touching code.

**Repo:** `kstring00/stringhamwebdesign` · **Stack:** Next.js 16 (App Router),
React 19, TypeScript, CSS Modules, GSAP. No UI library, no CSS framework.

**Branch state**
- `main` — sections 1–5 merged, plus the binder capability panel (PR #6) and a
  round of work by another assistant: the homepage scope and process sections
  merged into one interactive "How this goes." section with a dove and a
  navigator, the quick-contact block removed, the timesheet artefact removed
  from step 5, and the About portrait replaced.
- `claude/section6-payments-qzec6b` — section 6, payments. See 3c.

Note: `origin/chatgpt/stripe-webhook` shares **no merge base** with `main`. It
is an old unrelated lineage (it still carries pricing tiers). Ignore it.

---

## 1. Non-negotiable design rules

These came from the owner directly. Treat them as hard constraints.

- **Palette is closed.** Cream ground, deep navy, gold accent. No new colours,
  no new fonts, no UI libraries. Tokens live in `app/globals.css`.
- **Typography:** display serif (Cormorant Garamond) for headings;
  small-caps, letterspaced, uppercase labels for technical text.
- **Vocabulary:** the site's language is signal and instrumentation — ENTRY
  SIGNAL, SIGNAL CATALOG, energy meters, REC dots. Extend that, don't invent a
  new metaphor.
- **Every animation must respect `prefers-reduced-motion`.**
- **Every interactive element must be fully keyboard operable with a visible
  focus ring at 3:1 contrast minimum.**
- **Accessibility failures are disqualifying, not cosmetic.** He sells to ABA
  and counseling practices. This is the single most important rule here.
- **No dollar figures anywhere on the site.** Pricing was deliberately removed.
  Scope is confirmed on a call, then priced. Never reintroduce package tiers,
  add-on menus, or price ranges.
- No particles, no parallax, no scroll-jacking, no video backgrounds.

### How to verify contrast (do not skip this)

Do **not** trust `getComputedStyle().backgroundColor`. Gradients and
translucent surfaces report `transparent`, which produces both false passes and
false failures. The method that works, and that the repo README already
describes:

1. Set the text to `color: transparent` — **never** `visibility: hidden`, which
   also removes the element's own background.
2. Screenshot.
3. Sample the pixels under the **glyph boxes** (use `Range.getClientRects()`,
   not the element's bounding box — a rounded corner or padding otherwise reads
   as the backdrop).
4. Compare the **worst** backdrop pixel against the text colour.

Also: use **viewport** screenshots, not `fullPage`. `fullPage` composites
sticky/fixed headers at coordinates that don't match their rects, and the
header then reads as the backdrop for content it scrolled past. This produced
several false failures during the last session.

Two real bugs this method caught that computed-style checking missed:
- A section-level `color: var(--cream)` inherited into cream paper surfaces —
  text was rendering **cream on cream, ~1:1, invisible**.
- Small gold labels at 7–10px failing AA on cream.

For the second, `--gold-ink: #6f5620` and `--slate-ink: #425b6f` were added
(darker values of existing hues, not new colours) — following the precedent
`globals.css` already set with `--gold-on-dark`.

---

## 2. What is already done and merged

| Section | Status |
|---|---|
| 1 — Remove pricing | Done. `grep -rE '\$[0-9]' app/` returns nothing. |
| 2 — Refine the binder | Done. |
| 3 — `/quote` intake | Done. |
| 4 — `/quote/received` | Done. |
| 5 — Seven-step process | Done, copy approved by owner. |
| 6 — Payments | Done. Stripe Invoicing, DB-enforced handoff gate. |
| 7 — Transmission button | Built (pre-existing). **Never audited against spec.** |

### Key files

- `app/SelectedWork.tsx` + `SelectedWork.module.css` + `SelectedWorkPolish.module.css`
  — the binder. **The Polish file loads after the base file and uses
  `!important` throughout.** If a rule seems not to apply, that's why. There is
  a comment in it warning not to reintroduce an `animation` declaration on
  `.projectPage`, which silently killed the page-turn once already.
- `app/data/process.ts` — the seven steps. Shared by the homepage strip, the
  confirmation page, and the email, so they cannot drift.
- `app/data/capabilities.ts` — the new binder capability panels.
- `app/ProcessSteps.tsx` — disclosure list. Panels collapse via a `0fr` grid
  row (animates height with no measured pixels); the inner uses
  `visibility: hidden` so collapsed copy leaves the a11y tree and tab order.
- `app/quote/QuoteForm.tsx` — 7-step form, persists to `sessionStorage`.
- `app/quote/received/page.tsx` — **server component.** Reads an httpOnly
  cookie set by the API. This is why the reply date can't drift with client
  clocks.
- `app/lib/businessDays.ts` — reply-date calculator.
- `app/lib/businessDays.check.ts` — **30 assertions. Run it after any change
  here:** `npx tsx app/lib/businessDays.check.ts`
- `app/api/quote/route.ts` — validates, emails owner + client, sets the cookie.
- `app/TransmissionSubmit.tsx` — the submit button, four states.

### Landmines already hit — don't repeat these

- **`TransmissionSubmit` has a `controlledState` prop. If you pass it *any*
  value — including `"idle"` — `activate()` returns early and `onTransmit` is
  never called.** It's meant only for the demo page forcing states. Real forms
  must not pass it. This cost a debugging cycle.
- The confirmation cookie is `Secure` in production, so **it will not be set
  over plain HTTP.** Test the confirmation flow with `npm run dev`
  (`NODE_ENV=development` → `secure:false`), not `npm run start`.
- `next dev` on Next 16 regenerates `AGENTS.md` and `CLAUDE.md` every run and
  recreates them if deleted. They're committed for that reason.
- Don't put `pkill` in a compound bash command; it kills the shell before the
  rest runs.
- **`SUPABASE_URL` must be the bare project URL, never the REST endpoint.**
  Every caller appends its own prefix (`/rest/v1/...`, `/storage/v1/...`), so a
  value ending in `/rest/v1` builds `/rest/v1/rest/v1/...` and PostgREST
  rejects **every** request with `PGRST125 Invalid path specified in request
  URL`. This cost most of a session on 2026-09-08. `app/lib/supabaseUrl.ts` now
  strips the suffix and `instrumentation.ts` prints a loud banner at server
  start, but fix the env value — the correction is a safety net.
- **A stale `next start` survives killing the npm wrapper.** `next start`
  forks `next-server`, which keeps port 3000 and will happily answer requests
  you believe are hitting a freshly booted server with different env. If a test
  gives an impossible result, check for `EADDRINUSE` in the boot log before
  believing it.

---

## 3. What is IN PROGRESS on this branch

### 3a. Binder capability panel — DONE, merged

The "under the hood" content used to sit on a loose sheet below the binder and
was easy to scroll straight past. Three tabs now sit on the top edge of the
binder page; clicking one opens a partial overlay over the rendered site.
Project tabs stay on the right. `Systems` reads the active project's own
feature list; the other two are global, in `app/data/capabilities.ts`.

The panel starts **closed** so the work stays the largest element — that was
the whole point of section 2, where the screenshot went from ~610px to ~1054px
wide at a 1440px viewport. Don't regress it.

**Still unverified:** contrast sweep and keyboard operation on the new tabs and
panel.

### 3b. Scope section — DONE by another assistant, merged

Folded into the unified homepage process section, with the dove and the quote
CTA. `app/PricingConfigurator.tsx` still exists but is **no longer imported by
`app/page.tsx`** — check whether it is dead before extending it.

### 3c. Section 6 — Payments — DONE

Built on `claude/section6-payments-qzec6b`. Stripe **Invoicing**, not Checkout.

- `supabase/migrations/20260908120000_stripe_invoicing.sql` — `invoices.kind`
  (deposit / final / care / other) with a unique index so a project can only
  ever have one of each; `stripe_events` for idempotency;
  `projects.final_payment_cleared_at` and `.ownership_transferred_at`; and the
  **`projects_payment_before_transfer` trigger**, which refuses any write that
  sets `ownership_transferred_at` without a cleared final payment. That rule is
  in the database on purpose — a route bug or a hand-written PostgREST call
  must not be able to bypass it.
- `app/lib/stripe.ts` — dependency-free REST client. **`requireTestKey()`
  throws on anything that is not `sk_test_`**, so a live key in the environment
  fails loudly instead of quietly charging someone.
- `app/lib/stripeInvoicing.ts` — 50/50 split (odd cents land on the deposit so
  the halves always sum to the agreed total), draft → finalise → send, and care
  plans as separate monthly subscriptions cancelled at period end.
- `app/api/stripe/webhook/route.ts` — rewritten. Claims the event id **before**
  any state change, so a duplicate delivery is a no-op. Real state changes, not
  `console.log`. Handles `invoice.*` and `customer.subscription.*`.
- Admin routes: `POST /api/portal/admin/invoices` (raise deposit or final from
  the project's agreed total), `POST /api/portal/admin/handoff`,
  `POST|DELETE /api/portal/admin/care-plan`.

**Verified** — `node scripts/stripe-webhook-check.js` (22 assertions:
signature, replay rejection, idempotency, final-vs-deposit gating) and
`npx tsx app/lib/stripe.check.ts` (26 assertions: key guard, money split, form
encoding). See `scripts/README.md`.

**NOT YET DONE for section 6:**
- ~~The migration has not been applied to Supabase.~~ **Applied 2026-09-08**,
  along with `20260908180000_grant_stripe_events_to_service_role.sql`.
- No portal UI for these routes — they are API-only until the portal exists.
- `STRIPE_SECRET_KEY` (test), `STRIPE_WEBHOOK_SECRET` and
  `STRIPE_CARE_PRICE_ID` need setting in the environment. Never in a file.
- ~~Never exercised against real Stripe.~~ **Plumbing confirmed 2026-09-08** —
  see 3d. Still not exercised with an invoice id that matches a real row; that
  run is written up in `docs/stripe-invoice-test-run.md` and not yet done.

### 3d. Payments — first real webhook run, 2026-09-08

`stripe listen` + `stripe trigger invoice.paid` against `npm run dev`. The
cascade produced **14 rows** in `stripe_events`: one `handled` row for
`invoice.paid` with detail `No invoice row for in_1UDSmAE39qJFLJXwnU7rC5Ui.`,
and `ignored` rows carrying a reason for each unhandled type. Signature
verification, the claim, dispatch and the recorded outcome are all confirmed
against real Stripe. Those 14 rows also prove `service_role` can write to
`stripe_events`.

The `No invoice row` detail is the **expected** result for `stripe trigger`: it
fabricates an invoice no row references. Use `docs/stripe-invoice-test-run.md`
for a run where the ids match and the handoff gate actually opens.

**Two bugs found and fixed on the way (`claude/stripe-webhook-local-setup-ks9g3g`):**

1. **Doubled REST path.** `SUPABASE_URL` carried a `/rest/v1` suffix, so every
   database call 404'd with `PGRST125`. See the landmine above. Fixed centrally
   in `app/lib/supabaseUrl.ts`, used by `portalSupabase.ts`, `supabaseAdmin.ts`
   and the Storage URL in `app/api/portal/files/route.ts`.

2. **`claimEvent` swallowed an outage into a 200.** Its `catch` treated *every*
   failure as "already claimed", and the caller answered `200 {duplicate:true}`.
   A 200 tells Stripe the event is settled and stops redelivery — so while
   Supabase was unreachable, payments were being **dropped, not deferred**.
   `adminRest` now throws `PortalRestError` carrying the HTTP status;
   `claimEvent` returns `claimed | duplicate | unavailable`; only a PostgREST
   `409` (SQLSTATE 23505) is a duplicate, and anything else returns **500** so
   Stripe retries.

**The lesson worth keeping: the harness passed 22/22 while every database write
was failing.**

`scripts/stripe-webhook-stub.js` answers `201` to the claim insert
unconditionally. It cannot fail the way a real datastore fails, so it proved the
*handler logic* and said nothing about whether the handler could reach a
database — and its green result actively delayed finding the real fault. It also
could not have caught bug 2, because the stub never returned a non-409 error.

So: a green harness means the branching is right, not that the integration
works. When a stub is the only evidence, the untested surface is the boundary
between the code and the thing it stubs. The harness now has an outage mode
(`__down`) and 27 checks, five of them covering exactly that boundary — added
only because a real run exposed what the stub could not.

## 4. Still outstanding after the above

> Superseded by `docs/OPEN_WORK.md`, which is the maintained list. Kept here
> for the reasoning behind each item.

- **Section 7 audit.** The button exists at `app/TransmissionSubmit.tsx` with a
  demo page at `/transmission-demo`. It was built before this work and has
  never been checked against the written spec (idle carrier pulse, hover
  scanline + ghost arrow + 2–3px pull, segmented sending meter with monospace
  counter, sent → gold rule, error → stalled meter with red-shifted gold,
  `aria-live`, 44px target, works at 375px, timings as CSS custom properties).
  A `sentLabel` prop was added so SENT resolves to the real reply date.
- **Section 8 — backgrounds and motion.** Faint technical grids on dark
  sections (partly done — the work section and `/quote` already have one), slow
  drifting gradient warmth on cream, hairlines that draw in on scroll (the
  process strip already does this), instrument-panel section transitions.
- **Section 9 — `ASSETS_NEEDED.md`.** Not started. Should list: screenshots at
  what dimensions, copy that couldn't be written, the Cal.com link, Stripe
  product IDs, business email, legal page content, **and the dove illustration
  from 3b**.

---

## 5. Open questions for the owner

1. ~~**`AIIntakeSection` is orphaned.**~~ Resolved 2026-09-12: removed. The
   component, its three `/api/intake/*` routes and four supporting libs had no
   referents. The three Supabase tables were **kept** —
   `public.prospects.intake_id` has a foreign key to `public.intakes`. See
   `docs/OPEN_WORK.md` §6.
2. ~~**`BUSINESS_TIME_ZONE` is `America/New_York`**~~ Resolved 2026-09-12:
   `America/Chicago`. The Eastern value came from misreading the client project
   "Lake City Self Storage" as Kyle's own location — `app/about/page.tsx`
   already said League City, Texas. The 17:00 cutoff is still unconfirmed.
3. ~~The binder headline **"The work, up close."** is a placeholder.~~ Resolved
   2026-09-12: it stays as written.
4. ~~Do the `AGENTS.md` / `CLAUDE.md` generated files stay committed?~~ Resolved
   2026-09-12: yes. Commit them with your work rather than reverting.

---

## 6. Working practices he asked for

- Show the file list before large changes.
- Stop between sections for review rather than delivering everything at once.
- Write copy in his voice: plain, direct, no agency language, no "we".
- No destructive git operations, no force push, no branch deletion.
- Don't build the client portal yet — step 4 of the process is written so it
  slots in later.

## 7. Commands

```bash
npm run dev        # use this to test the confirmation flow (cookie is Secure in prod)
npm run build
npx tsx app/lib/businessDays.check.ts   # 30 assertions, must stay green
```

Chromium for verification is at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`;
Playwright resolves from the repo's `node_modules`.
