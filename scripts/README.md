# scripts

Verification harnesses. Nothing here ships to the site.

## Stripe webhook checks

Exercises signature verification, replay rejection, idempotency, and the
recorded state changes — including that a paid **final** invoice is what opens
the ownership-transfer gate and a paid **deposit** is not.

No Stripe account, no network, and no keys are involved: a stub stands in for
Supabase PostgREST and events are signed locally with a throwaway secret.

The stub has an outage mode (`GET /rest/v1/__down`, cleared by `__down?off` or
`__reset`) which makes the `stripe_events` claim return 503. Five checks use it
to prove an unreachable datastore returns **500 so Stripe retries**, rather than
a 200 that would look like a settled duplicate and stop redelivery.

**What this harness cannot tell you.** The stub always answers; it cannot fail
the way a real datastore fails. On 2026-09-08 all 22 checks then in the file
passed while every real database write was failing with `PGRST125`, because
`SUPABASE_URL` was misconfigured — a fault living entirely in the boundary the
stub replaces. Green here means the handler's branching is right. It is not
evidence that the handler can reach a database; only a real run is.

```bash
node scripts/stripe-webhook-stub.js &            # stub datastore on :4000

SUPABASE_URL=http://localhost:4000 \
SUPABASE_SECRET_KEY=stub_secret \
STRIPE_WEBHOOK_SECRET=whsec_testsecret \
STRIPE_SECRET_KEY=sk_test_dummy \
npm run start &                                  # app on :3000

node scripts/stripe-webhook-check.js             # exits non-zero on failure
```

## Other checks

```bash
npx tsx app/lib/stripe.check.ts         # test-mode guard, 50/50 split, form encoding
npx tsx app/lib/businessDays.check.ts   # reply-date rules and US federal holidays
```

## Portal sign-in checks

Confirms the portal stays invite-only and that a caller cannot tell a real
client address from an unknown one — by response body **or by timing**. The
stub deliberately makes the mail send slow (300ms); if the response ever waited
on it, the timing assertion would catch it.

```bash
node scripts/portal-auth-stub.js &                 # Supabase stand-in on :4100

SUPABASE_URL=http://localhost:4100 \
SUPABASE_SECRET_KEY=stub \
PORTAL_ADMIN_EMAIL=admin@known.test \
PORTAL_URL=http://localhost:3000/portal \
npm run start &                                    # app on :3000

node scripts/portal-auth-check.js                  # exits non-zero on failure
```

No real Supabase project, no real keys, no mail leaves the machine.

## Client portal checks

`portal-data-stub.js` stands in for Supabase with one client, one project, a
five-item checklist and some logged hours. It enforces the same rules the real
database does — RLS hides other projects, the column grant rejects any write
outside `status` / `value` / `file_id`, and `accepted` is refused — so the UI is
exercised against the real constraints without a Supabase project.

```bash
node scripts/portal-data-stub.js &                 # stub on :4200

SUPABASE_URL=http://localhost:4200 \
SUPABASE_SECRET_KEY=stub \
PORTAL_URL=http://localhost:3000/portal \
npm run dev &                                      # dev, not start: see below

export NODE_PATH=./node_modules
node scripts/portal-client-check.js                # 15 behaviour assertions
node scripts/portal-a11y-check.js                  # keyboard, focus, touch targets
node scripts/portal-contrast-check.js 1440 onboarding
node scripts/portal-contrast-check.js 375 timesheet
```

Use `npm run dev`. Session cookies are `Secure` in a production build and are
dropped over plain HTTP.

### On the contrast checker

It measures one element at a time: scroll into view, blank only that element's
glyphs, screenshot the viewport, sample under its own text rects. A batched
sweep was tried first and produced false positives that survived several fixes;
the per-element version is slower but its results hold up. Two things it gets
right that are easy to get wrong:

- the painted colour is read **before** the element is blanked — read it after
  and every element reports `rgba(0,0,0,0)`;
- it waits for the scroll to settle before screenshotting — too short a wait
  and neighbouring gold accents get sampled as the backdrop.
