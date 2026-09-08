import { NextRequest, NextResponse } from "next/server";

import { adminRest, getPortalSession } from "@/app/lib/portalSupabase";
import { isStripeConfigured } from "@/app/lib/stripe";
import { issueProjectInvoice, splitTotal } from "@/app/lib/stripeInvoicing";

export const dynamic = "force-dynamic";

type ProjectRow = {
  id: string;
  name: string;
  quoted_total: string | number | null;
  clients: {
    business_name: string;
    contact_name: string;
    users: { email: string } | null;
  } | null;
};

/**
 * Raises the deposit or final invoice for a project from its agreed total.
 *
 * The total comes from the project record, which is set when the scope is
 * signed — invoices are generated from agreed scope, never typed in here.
 */
export async function POST(request: NextRequest) {
  const session = await getPortalSession();
  if (!session || session.profile.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe is not configured with a test key." },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => null)) as {
    projectId?: string;
    kind?: "deposit" | "final";
    scopeSummary?: string;
  } | null;

  const projectId = body?.projectId?.trim() ?? "";
  const kind = body?.kind;

  if (!projectId) {
    return NextResponse.json({ error: "Project is required." }, { status: 400 });
  }
  if (kind !== "deposit" && kind !== "final") {
    return NextResponse.json(
      { error: "Invoice kind must be deposit or final." },
      { status: 400 },
    );
  }

  const rows = await adminRest<ProjectRow[]>(
    `projects?id=eq.${encodeURIComponent(projectId)}` +
      "&select=id,name,quoted_total,clients(business_name,contact_name,users(email))&limit=1",
  );

  const project = rows[0];
  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  const agreedTotal = Number(project.quoted_total);
  if (!Number.isFinite(agreedTotal) || agreedTotal <= 0) {
    return NextResponse.json(
      { error: "This project has no agreed total yet. Confirm scope first." },
      { status: 409 },
    );
  }

  const email = project.clients?.users?.email;
  if (!email) {
    return NextResponse.json(
      { error: "This project has no client email on file." },
      { status: 409 },
    );
  }

  // The final invoice only goes out once the work is approved. The deposit is
  // what starts the build, so it has no precondition beyond an agreed total.
  if (kind === "final") {
    const deposit = await adminRest<{ status: string }[]>(
      `invoices?project_id=eq.${encodeURIComponent(projectId)}&kind=eq.deposit&select=status&limit=1`,
    );
    if (deposit[0] && deposit[0].status !== "paid") {
      return NextResponse.json(
        { error: "The deposit has not cleared yet." },
        { status: 409 },
      );
    }
  }

  try {
    const result = await issueProjectInvoice({
      projectId,
      projectName: project.name,
      kind,
      agreedTotal,
      clientEmail: email,
      clientName:
        project.clients?.contact_name ||
        project.clients?.business_name ||
        "Client",
      scopeSummary:
        body?.scopeSummary?.trim() || "Scope as agreed and signed.",
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not raise that invoice.";
    console.error("Invoice creation failed", projectId, kind, message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

/** The 50/50 split for a project, so the portal can show it before issuing. */
export async function GET(request: NextRequest) {
  const session = await getPortalSession();
  if (!session || session.profile.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const projectId = request.nextUrl.searchParams.get("projectId")?.trim() ?? "";
  if (!projectId) {
    return NextResponse.json({ error: "Project is required." }, { status: 400 });
  }

  const rows = await adminRest<{ quoted_total: string | number | null }[]>(
    `projects?id=eq.${encodeURIComponent(projectId)}&select=quoted_total&limit=1`,
  );

  const total = Number(rows[0]?.quoted_total);
  if (!Number.isFinite(total) || total <= 0) {
    return NextResponse.json({ ok: true, agreedTotal: null, split: null });
  }

  const { depositCents, finalCents } = splitTotal(total);
  const invoices = await adminRest<
    { kind: string; status: string; stripe_hosted_url: string | null }[]
  >(
    `invoices?project_id=eq.${encodeURIComponent(projectId)}&select=kind,status,stripe_hosted_url`,
  );

  return NextResponse.json({
    ok: true,
    agreedTotal: total,
    split: { deposit: depositCents / 100, final: finalCents / 100 },
    invoices,
  });
}
