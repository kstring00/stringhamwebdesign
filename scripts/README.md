# scripts

Verification harnesses. Nothing here ships to the site.

## Stripe webhook checks

Exercises signature verification, replay rejection, idempotency, and the
recorded state changes — including that a paid **final** invoice is what opens
the ownership-transfer gate and a paid **deposit** is not.

No Stripe account, no network, and no keys are involved: a stub stands in for
Supabase PostgREST and events are signed locally with a throwaway secret.

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
