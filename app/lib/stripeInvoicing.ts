/**
 * Stripe Invoicing for project work.
 *
 * Invoicing, not Checkout. A build has an agreed scope and a negotiated total,
 * so it gets an invoice the client can pay on their own terms — not a
 * fixed-price product in a shopping cart.
 *
 * Money split: 50% deposit to start, 50% on approval before handoff. The final
 * invoice being paid is what releases ownership transfer, and that rule is
 * enforced by a database trigger, not here.
 *
 * Care plans are separate monthly subscriptions, cancellable, and deliberately
 * never mixed into a project invoice.
 */

import { adminRest } from "./portalSupabase";
import {
  StripeInvoice,
  StripeSubscription,
  stripeRequest,
} from "./stripe";

export type InvoiceKind = "deposit" | "final" | "care" | "other";

/** Days a project invoice stays open before it is past due. */
const DEFAULT_NET_DAYS = 14;

function toCents(amount: number) {
  return Math.round(amount * 100);
}

/**
 * Splits an agreed total into the two halves. Odd cents land on the deposit so
 * the two invoices always sum to exactly the agreed total.
 */
export function splitTotal(total: number) {
  const cents = toCents(total);
  const final = Math.floor(cents / 2);
  const deposit = cents - final;
  return { depositCents: deposit, finalCents: final };
}

async function findOrCreateCustomer(email: string, name: string) {
  const existing = await stripeRequest<{ data: { id: string }[] }>(
    "/customers",
    { method: "GET", body: { email, limit: 1 } },
  );

  if (existing.data[0]) return existing.data[0].id;

  const created = await stripeRequest<{ id: string }>("/customers", {
    body: { email, name },
    idempotencyKey: `customer:${email}`,
  });

  return created.id;
}

export type IssueInvoiceInput = {
  projectId: string;
  projectName: string;
  kind: Extract<InvoiceKind, "deposit" | "final">;
  /** The full agreed project total, not the half. */
  agreedTotal: number;
  clientEmail: string;
  clientName: string;
  /** Shown as the invoice line item. Comes from the signed scope. */
  scopeSummary: string;
};

/**
 * Raises one half of a project invoice and sends it.
 *
 * Idempotent twice over: Stripe's own idempotency key stops a retry raising a
 * second invoice, and a unique index on (project_id, kind) stops a second
 * deposit or final ever being recorded for the same project.
 */
export async function issueProjectInvoice(input: IssueInvoiceInput) {
  const { depositCents, finalCents } = splitTotal(input.agreedTotal);
  const amountCents = input.kind === "deposit" ? depositCents : finalCents;

  const existing = await adminRest<{ id: string; stripe_invoice_id: string | null }[]>(
    `invoices?project_id=eq.${encodeURIComponent(input.projectId)}&kind=eq.${input.kind}&select=id,stripe_invoice_id&limit=1`,
  );

  if (existing[0]?.stripe_invoice_id) {
    throw new Error(
      `A ${input.kind} invoice already exists for this project.`,
    );
  }

  const customerId = await findOrCreateCustomer(
    input.clientEmail,
    input.clientName,
  );

  const half = input.kind === "deposit" ? "50% deposit" : "50% final payment";
  const description = `${input.projectName} — ${half}. ${input.scopeSummary}`.slice(
    0,
    500,
  );

  // Draft first so the line item can be attached, then finalise and send.
  const invoice = await stripeRequest<StripeInvoice>("/invoices", {
    body: {
      customer: customerId,
      collection_method: "send_invoice",
      days_until_due: DEFAULT_NET_DAYS,
      auto_advance: false,
      description,
      metadata: {
        project_id: input.projectId,
        invoice_kind: input.kind,
      },
    },
    idempotencyKey: `invoice:${input.projectId}:${input.kind}`,
  });

  await stripeRequest("/invoiceitems", {
    body: {
      customer: customerId,
      invoice: invoice.id,
      currency: "usd",
      amount: amountCents,
      description,
    },
    idempotencyKey: `invoiceitem:${input.projectId}:${input.kind}`,
  });

  const finalized = await stripeRequest<StripeInvoice>(
    `/invoices/${invoice.id}/finalize`,
    { idempotencyKey: `finalize:${input.projectId}:${input.kind}` },
  );

  const sent = await stripeRequest<StripeInvoice>(
    `/invoices/${finalized.id}/send`,
    { idempotencyKey: `send:${input.projectId}:${input.kind}` },
  );

  const dueAt = new Date(
    Date.now() + DEFAULT_NET_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  const row = {
    project_id: input.projectId,
    kind: input.kind,
    amount: (amountCents / 100).toFixed(2),
    status: "open",
    stripe_invoice_id: sent.id,
    stripe_customer_id: customerId,
    stripe_hosted_url: sent.hosted_invoice_url,
    issued_at: new Date().toISOString(),
    due_at: dueAt,
  };

  if (existing[0]) {
    await adminRest(`invoices?id=eq.${encodeURIComponent(existing[0].id)}`, {
      method: "PATCH",
      body: JSON.stringify(row),
    });
  } else {
    await adminRest("invoices", {
      method: "POST",
      body: JSON.stringify(row),
    });
  }

  return {
    stripeInvoiceId: sent.id,
    hostedUrl: sent.hosted_invoice_url,
    amount: amountCents / 100,
    kind: input.kind,
  };
}

export type StartCarePlanInput = {
  projectId: string;
  clientEmail: string;
  clientName: string;
  /** A Stripe recurring Price id, from the dashboard. Test mode. */
  priceId: string;
};

/**
 * Starts a monthly care-plan subscription.
 *
 * Deliberately separate from project invoices: a client can cancel care
 * without touching anything owed on the build, and cancelling the build does
 * not silently cancel their maintenance.
 */
export async function startCarePlan(input: StartCarePlanInput) {
  const customerId = await findOrCreateCustomer(
    input.clientEmail,
    input.clientName,
  );

  const subscription = await stripeRequest<StripeSubscription>(
    "/subscriptions",
    {
      body: {
        customer: customerId,
        items: [{ price: input.priceId }],
        collection_method: "send_invoice",
        days_until_due: DEFAULT_NET_DAYS,
        metadata: { project_id: input.projectId },
      },
      idempotencyKey: `care:${input.projectId}`,
    },
  );

  await adminRest("care_plans", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({
      project_id: input.projectId,
      status: subscription.status === "active" ? "active" : "inactive",
      stripe_subscription_id: subscription.id,
      started_at: new Date().toISOString(),
    }),
  });

  return { subscriptionId: subscription.id, status: subscription.status };
}

/**
 * Cancels at the end of the paid period rather than immediately: they have
 * paid for this month, so they keep this month.
 */
export async function cancelCarePlan(projectId: string) {
  const rows = await adminRest<{ stripe_subscription_id: string | null }[]>(
    `care_plans?project_id=eq.${encodeURIComponent(projectId)}&select=stripe_subscription_id&limit=1`,
  );

  const subscriptionId = rows[0]?.stripe_subscription_id;
  if (!subscriptionId) throw new Error("No care plan on this project.");

  await stripeRequest<StripeSubscription>(`/subscriptions/${subscriptionId}`, {
    body: { cancel_at_period_end: true },
  });

  await adminRest(`care_plans?project_id=eq.${encodeURIComponent(projectId)}`, {
    method: "PATCH",
    body: JSON.stringify({ cancelled_at: new Date().toISOString() }),
  });

  return { subscriptionId, cancelAtPeriodEnd: true };
}
