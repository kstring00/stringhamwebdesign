import { NextRequest, NextResponse } from "next/server";

import { adminRest, getPortalSession, userRest } from "../../../../lib/portalSupabase";

type ProjectRow = { id: string; name: string; client_id: string };
type ClientRow = { id: string; business_name: string };
type InvoiceRow = { id: string; project_id: string; amount: number; due_at: string | null; stripe_invoice_id: string | null };

function invoiceLabel(invoice: InvoiceRow) {
  if (invoice.stripe_invoice_id) {
    const digits = invoice.stripe_invoice_id.match(/\d+/g)?.join("");
    if (digits) return `#${digits.slice(-6)}`;
  }
  return `#${invoice.id.replaceAll("-", "").slice(0, 6).toUpperCase()}`;
}

export async function PATCH(request: NextRequest) {
  const session = await getPortalSession();
  if (!session || session.profile.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as
    | { kind?: string; projectId?: string; invoiceId?: string }
    | null;
  const kind = body?.kind?.trim() ?? "";
  const projectId = body?.projectId?.trim() ?? "";
  if (!kind || !projectId) {
    return NextResponse.json({ error: "Action and project are required." }, { status: 400 });
  }

  try {
    const projects = await adminRest<ProjectRow[]>(
      `projects?id=eq.${encodeURIComponent(projectId)}&select=id,name,client_id&limit=1`,
    );
    const project = projects[0];
    if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });

    const clients = await adminRest<ClientRow[]>(
      `clients?id=eq.${encodeURIComponent(project.client_id)}&select=id,business_name&limit=1`,
    );
    const clientName = clients[0]?.business_name ?? "there";

    let message = "";
    let responseMessage = "Follow-up sent.";

    if (kind === "nudge_client") {
      message = `Hi ${clientName} — quick check-in from Kyle. When you have a moment, send me the latest update or anything you need from me so I can keep the project moving.`;
      responseMessage = `Follow-up sent to ${clientName}.`;
    } else if (kind === "invoice_reminder") {
      const invoiceId = body?.invoiceId?.trim() ?? "";
      if (!invoiceId) return NextResponse.json({ error: "Invoice is required." }, { status: 400 });
      const invoices = await adminRest<InvoiceRow[]>(
        `invoices?id=eq.${encodeURIComponent(invoiceId)}&project_id=eq.${encodeURIComponent(projectId)}&select=id,project_id,amount,due_at,stripe_invoice_id&limit=1`,
      );
      const invoice = invoices[0];
      if (!invoice) return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
      const amount = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(invoice.amount));
      let stripeResent = false;
      const stripeSecret = process.env.STRIPE_SECRET_KEY;
      if (stripeSecret && invoice.stripe_invoice_id) {
        const stripeResponse = await fetch(
          `https://api.stripe.com/v1/invoices/${encodeURIComponent(invoice.stripe_invoice_id)}/send`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${stripeSecret}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: "",
          },
        );
        stripeResent = stripeResponse.ok;
        if (!stripeResponse.ok) {
          const detail = await stripeResponse.text().catch(() => "");
          console.error("Stripe invoice resend failed", stripeResponse.status, detail.slice(0, 300));
        }
      }
      message = `Invoice reminder: ${invoiceLabel(invoice)} for ${amount} is still outstanding. If you already handled it, thank you — otherwise please take a look when you can.`;
      responseMessage = stripeResent
        ? `Stripe invoice resent to ${clientName}.`
        : `Invoice reminder sent to ${clientName}.`;
    } else {
      return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
    }

    await userRest("messages", session.accessToken, {
      method: "POST",
      body: JSON.stringify({
        project_id: projectId,
        sender_id: session.user.id,
        body: message,
      }),
    });

    return NextResponse.json({ ok: true, message: responseMessage });
  } catch (error) {
    console.error("Needs-you action failed", error);
    return NextResponse.json({ error: "The follow-up could not be sent." }, { status: 500 });
  }
}
