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
