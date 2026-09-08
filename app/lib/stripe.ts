/**
 * Minimal Stripe REST client.
 *
 * No SDK dependency: the rest of this codebase talks to Supabase and Resend
 * with plain fetch, and Stripe's API is form-encoded REST. Keeping it the same
 * shape means one less package to keep patched.
 *
 * TEST MODE ONLY. `requireTestKey` throws on anything that is not an
 * `sk_test_` key, so a live key pasted into the environment by mistake fails
 * loudly at the first call instead of quietly charging somebody.
 */

const STRIPE_API = "https://api.stripe.com/v1";
const STRIPE_VERSION = "2024-06-20";

export class StripeNotConfiguredError extends Error {
  constructor() {
    super("Stripe is not configured.");
    this.name = "StripeNotConfiguredError";
  }
}

export class StripeLiveKeyError extends Error {
  constructor() {
    super(
      "Refusing to call Stripe with a non-test key. This project is test mode only.",
    );
    this.name = "StripeLiveKeyError";
  }
}

/**
 * Returns the secret key, or throws. Never log or echo the return value.
 */
export function requireTestKey() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new StripeNotConfiguredError();

  // The only accepted prefix. `sk_live_`, restricted keys and publishable keys
  // all fail here.
  if (!key.startsWith("sk_test_")) throw new StripeLiveKeyError();

  return key;
}

export function isStripeConfigured() {
  const key = process.env.STRIPE_SECRET_KEY;
  return Boolean(key && key.startsWith("sk_test_"));
}

/**
 * Flattens a nested object into Stripe's bracket form encoding.
 * `{ metadata: { ref: "BUILD-0247" } }` becomes `metadata[ref]=BUILD-0247`.
 */
export function toFormBody(
  input: Record<string, unknown>,
  prefix = "",
): URLSearchParams {
  const params = new URLSearchParams();

  const walk = (value: unknown, key: string) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      value.forEach((item, index) => walk(item, `${key}[${index}]`));
      return;
    }

    if (typeof value === "object") {
      for (const [childKey, childValue] of Object.entries(
        value as Record<string, unknown>,
      )) {
        walk(childValue, key ? `${key}[${childKey}]` : childKey);
      }
      return;
    }

    params.append(key, String(value));
  };

  walk(input, prefix);
  return params;
}

type StripeRequestOptions = {
  method?: "GET" | "POST" | "DELETE";
  body?: Record<string, unknown>;
  /**
   * Stripe deduplicates POSTs carrying the same idempotency key for 24 hours.
   * Pass a stable key derived from what is being created, so a retry cannot
   * raise a second invoice.
   */
  idempotencyKey?: string;
};

export async function stripeRequest<T>(
  path: string,
  options: StripeRequestOptions = {},
): Promise<T> {
  const key = requireTestKey();
  const { method = "POST", body, idempotencyKey } = options;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${key}`,
    "Stripe-Version": STRIPE_VERSION,
  };

  let url = `${STRIPE_API}${path}`;
  let payload: string | undefined;

  if (body && method === "GET") {
    url += `?${toFormBody(body).toString()}`;
  } else if (body) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    payload = toFormBody(body).toString();
  }

  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;

  const response = await fetch(url, {
    method,
    headers,
    body: payload,
    cache: "no-store",
  });

  const text = await response.text();

  if (!response.ok) {
    // Stripe error bodies carry no secrets, but the request never should have
    // included one either. Log the message only.
    let message = `Stripe request failed with status ${response.status}.`;
    try {
      const parsed = JSON.parse(text) as { error?: { message?: string } };
      if (parsed.error?.message) message = parsed.error.message;
    } catch {
      // Non-JSON error body; keep the status message.
    }
    console.error("Stripe request failed", path, response.status, message);
    throw new Error(message);
  }

  return text ? (JSON.parse(text) as T) : (undefined as T);
}

export type StripeInvoice = {
  id: string;
  status: string;
  hosted_invoice_url: string | null;
  amount_due: number;
  customer: string;
  metadata?: Record<string, string>;
};

export type StripeSubscription = {
  id: string;
  status: string;
  cancel_at_period_end: boolean;
  metadata?: Record<string, string>;
};
