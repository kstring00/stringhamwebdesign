import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import { adminRest } from "@/app/lib/portalSupabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SIGNATURE_TOLERANCE_SECONDS = 5 * 60;

function safeEqualHex(left: string, right: string) {
  try {
    const a = Buffer.from(left, "hex");
    const b = Buffer.from(right, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function verifyStripeSignature(
  payload: string,
  signatureHeader: string,
  secret: string,
) {
  const parts = signatureHeader.split(",").map((part) => part.trim());
  const timestampPart = parts.find((part) => part.startsWith("t="));
  const signatures = parts
    .filter((part) => part.startsWith("v1="))
    .map((part) => part.slice(3));

  if (!timestampPart || signatures.length === 0) return false;

  const timestamp = Number(timestampPart.slice(2));
  if (!Number.isFinite(timestamp)) return false;

  // Rejects replays of a signature captured earlier.
  const age = Math.abs(Math.floor(Date.now() / 1000) - timestamp);
  if (age > SIGNATURE_TOLERANCE_SECONDS) return false;

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${payload}`, "utf8")
    .digest("hex");

  return signatures.some((signature) => safeEqualHex(expected, signature));
}

type StripeObject = Record<string, unknown>;

function readString(source: StripeObject, key: string) {
  const value = source[key];
  return typeof value === "string" ? value : "";
}

function readMetadata(object: StripeObject) {
  const metadata = object.metadata;
  return (metadata && typeof metadata === "object"
    ? (metadata as Record<string, string>)
    : {}) as Record<string, string>;
}

/**
 * Claims an event id before any state change.
 *
 * Stripe retries on every non-2xx and can deliver the same event twice even
 * after a success. The primary key on stripe_events is what makes a duplicate
 * a no-op: the insert fails, we return 200, and no invoice is marked paid a
 * second time.
 *
 * Returns false when this event has already been claimed.
 */
async function claimEvent(eventId: string, type: string) {
  try {
    await adminRest("stripe_events", {
      method: "POST",
      body: JSON.stringify({ event_id: eventId, type }),
    });
    return true;
  } catch {
    // Either a duplicate (the expected case) or the datastore is unreachable.
    // Both mean: do not apply a state change on this delivery.
    return false;
  }
}

async function closeEvent(
  eventId: string,
  status: "handled" | "ignored" | "failed",
  detail?: string,
) {
  try {
    await adminRest(`stripe_events?event_id=eq.${encodeURIComponent(eventId)}`, {
      method: "PATCH",
      body: JSON.stringify({
        status,
        handled_at: new Date().toISOString(),
        detail: detail ? detail.slice(0, 500) : null,
      }),
    });
  } catch (error) {
    console.error("Could not close Stripe event", eventId, error);
  }
}

/** Marks the invoice row paid, and opens the handoff gate on a final payment. */
async function applyInvoicePaid(object: StripeObject) {
  const stripeInvoiceId = readString(object, "id");
  if (!stripeInvoiceId) return "No invoice id on event.";

  const paidAt = new Date().toISOString();

  const updated = await adminRest<{ id: string; project_id: string; kind: string }[]>(
    `invoices?stripe_invoice_id=eq.${encodeURIComponent(stripeInvoiceId)}`,
    {
      method: "PATCH",
      returnRepresentation: true,
      body: JSON.stringify({ status: "paid", paid_at: paidAt }),
    },
  );

  const row = updated?.[0];
  if (!row) return `No invoice row for ${stripeInvoiceId}.`;

  // A paid final invoice is what releases ownership transfer. The database
  // trigger refuses the transfer until this column is set.
  if (row.kind === "final") {
    await adminRest(`projects?id=eq.${encodeURIComponent(row.project_id)}`, {
      method: "PATCH",
      body: JSON.stringify({ final_payment_cleared_at: paidAt }),
    });
    return `Final invoice paid; project ${row.project_id} cleared for handoff.`;
  }

  if (row.kind === "deposit") {
    await adminRest(`projects?id=eq.${encodeURIComponent(row.project_id)}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "build", started_at: paidAt }),
    });
    return `Deposit paid; project ${row.project_id} moved to build.`;
  }

  return `Invoice ${stripeInvoiceId} marked paid.`;
}

async function applyInvoiceFailed(object: StripeObject) {
  const stripeInvoiceId = readString(object, "id");
  if (!stripeInvoiceId) return "No invoice id on event.";

  await adminRest(
    `invoices?stripe_invoice_id=eq.${encodeURIComponent(stripeInvoiceId)}`,
    {
      method: "PATCH",
      body: JSON.stringify({ status: "past_due" }),
    },
  );

  return `Invoice ${stripeInvoiceId} marked past due.`;
}

const SUBSCRIPTION_STATUS: Record<string, string> = {
  active: "active",
  trialing: "active",
  past_due: "past_due",
  unpaid: "past_due",
  canceled: "cancelled",
  incomplete_expired: "cancelled",
};

async function applySubscriptionChange(object: StripeObject, type: string) {
  const subscriptionId = readString(object, "id");
  if (!subscriptionId) return "No subscription id on event.";

  const stripeStatus = readString(object, "status");
  const status =
    type === "customer.subscription.deleted"
      ? "cancelled"
      : SUBSCRIPTION_STATUS[stripeStatus] ?? "inactive";

  const patch: Record<string, unknown> = { status };
  if (status === "cancelled") patch.cancelled_at = new Date().toISOString();

  const updated = await adminRest<{ id: string }[]>(
    `care_plans?stripe_subscription_id=eq.${encodeURIComponent(subscriptionId)}`,
    {
      method: "PATCH",
      returnRepresentation: true,
      body: JSON.stringify(patch),
    },
  );

  if (!updated?.[0]) {
    const projectId = readMetadata(object).project_id;
    return projectId
      ? `No care plan row for subscription ${subscriptionId} (project ${projectId}).`
      : `No care plan row for subscription ${subscriptionId}.`;
  }

  return `Care plan ${subscriptionId} set to ${status}.`;
}

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  // Must be the raw body: re-serialising JSON changes the bytes and breaks HMAC.
  const rawBody = await request.text();
  if (!verifyStripeSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  let event: StripeObject;
  try {
    event = JSON.parse(rawBody) as StripeObject;
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const eventId = readString(event, "id");
  const type = readString(event, "type") || "unknown";
  if (!eventId) {
    return NextResponse.json({ error: "Missing event id." }, { status: 400 });
  }

  const data = event.data as { object?: StripeObject } | undefined;
  const object = data?.object ?? {};

  const handled = new Set([
    "invoice.paid",
    "invoice.payment_succeeded",
    "invoice.payment_failed",
    "invoice.marked_uncollectible",
    "customer.subscription.created",
    "customer.subscription.updated",
    "customer.subscription.deleted",
  ]);

  if (!handled.has(type)) {
    // Still claimed, so the ignore is recorded rather than invisible.
    if (await claimEvent(eventId, type)) {
      await closeEvent(eventId, "ignored", `Unhandled event type ${type}.`);
    }
    return NextResponse.json({ received: true, handled: false });
  }

  // Claim before acting. A duplicate delivery stops here.
  if (!(await claimEvent(eventId, type))) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    let detail: string;

    switch (type) {
      case "invoice.paid":
      case "invoice.payment_succeeded":
        detail = await applyInvoicePaid(object);
        break;
      case "invoice.payment_failed":
      case "invoice.marked_uncollectible":
        detail = await applyInvoiceFailed(object);
        break;
      default:
        detail = await applySubscriptionChange(object, type);
        break;
    }

    await closeEvent(eventId, "handled", detail);
    return NextResponse.json({ received: true, handled: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown failure.";
    console.error("Stripe webhook handler failed", type, message);
    await closeEvent(eventId, "failed", message);

    // 500 so Stripe retries. The event row is already claimed, so a retry
    // would be dropped as a duplicate — release the claim first.
    await adminRest(
      `stripe_events?event_id=eq.${encodeURIComponent(eventId)}`,
      { method: "DELETE" },
    ).catch(() => undefined);

    return NextResponse.json({ error: "Handler failed." }, { status: 500 });
  }
}
