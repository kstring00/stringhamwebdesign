/**
 * Checks for the Stripe test-mode guard and the deposit / final money split.
 * No test runner is configured in this project, so run it directly:
 *
 *   npx tsx app/lib/stripe.check.ts
 *
 * Exits non-zero if anything fails. Touches no network and no real key.
 */
import { requireTestKey, isStripeConfigured, toFormBody, StripeLiveKeyError } from "./stripe";
import { splitTotal } from "./stripeInvoicing";

let fails = 0;
const ok = (label: string, cond: boolean, extra = "") => {
  if (!cond) fails += 1;
  console.log(`${cond ? "ok  " : "FAIL"} ${label}${extra ? `  ${extra}` : ""}`);
};
const throws = (label: string, fn: () => unknown, expected: string) => {
  try {
    fn();
    fails += 1;
    console.log(`FAIL ${label}: did not throw`);
  } catch (error) {
    const name = error instanceof Error ? error.name : "";
    ok(label, name === expected, `threw ${name}`);
  }
};

// --- the guard that keeps this test mode only ---
const original = process.env.STRIPE_SECRET_KEY;

delete process.env.STRIPE_SECRET_KEY;
throws("missing key throws", requireTestKey, "StripeNotConfiguredError");
ok("missing key is not 'configured'", isStripeConfigured() === false);

process.env.STRIPE_SECRET_KEY = "sk_live_abc123";
throws("LIVE key is refused", requireTestKey, "StripeLiveKeyError");
ok("live key is not 'configured'", isStripeConfigured() === false);

process.env.STRIPE_SECRET_KEY = "rk_live_abc123";
throws("restricted live key is refused", requireTestKey, "StripeLiveKeyError");

process.env.STRIPE_SECRET_KEY = "pk_test_abc123";
throws("publishable key is refused", requireTestKey, "StripeLiveKeyError");

process.env.STRIPE_SECRET_KEY = "sk_test_abc123";
ok("test key accepted", requireTestKey() === "sk_test_abc123");
ok("test key is 'configured'", isStripeConfigured() === true);

if (original === undefined) delete process.env.STRIPE_SECRET_KEY;
else process.env.STRIPE_SECRET_KEY = original;

// --- the 50/50 split must never lose or invent a cent ---
const cases = [1250, 2000.5, 3500.01, 999.99, 0.01, 12345.67, 7.77];
for (const total of cases) {
  const { depositCents, finalCents } = splitTotal(total);
  const sum = depositCents + finalCents;
  const expected = Math.round(total * 100);
  ok(`split of ${total} sums exactly`, sum === expected, `${sum} vs ${expected}`);
  ok(`split of ${total} is even or deposit-heavy by 1c`,
     depositCents - finalCents === 0 || depositCents - finalCents === 1,
     `${depositCents}/${finalCents}`);
}

// --- Stripe's bracket form encoding ---
const form = toFormBody({
  customer: "cus_1",
  metadata: { project_id: "p1", invoice_kind: "deposit" },
  items: [{ price: "price_1" }],
  nothing: undefined,
});
ok("flat value encoded", form.get("customer") === "cus_1");
ok("nested metadata encoded", form.get("metadata[project_id]") === "p1");
ok("array encoded", form.get("items[0][price]") === "price_1");
ok("undefined omitted", form.has("nothing") === false);

console.log(fails ? `\n${fails} FAILURE(S)` : "\nall checks passed");
process.exit(fails ? 1 : 0);
