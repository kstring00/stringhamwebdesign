import { NextRequest, NextResponse } from "next/server";

import { adminRest, getPortalSession } from "@/app/lib/portalSupabase";
import { isStripeConfigured } from "@/app/lib/stripe";
import { cancelCarePlan, startCarePlan } from "@/app/lib/stripeInvoicing";

export const dynamic = "force-dynamic";

type ProjectRow = {
  id: string;
  clients: {
    business_name: string;
    contact_name: string;
    users: { email: string } | null;
  } | null;
};

async function requireAdmin() {
  const session = await getPortalSession();
  if (!session || session.profile.role !== "admin") return null;
  return session;
}

/** Starts a monthly care-plan subscription, separate from project invoices. */
export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) {
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
    priceId?: string;
  } | null;

  const projectId = body?.projectId?.trim() ?? "";
  // Price ids come from the Stripe dashboard, never from a value in this repo.
  const priceId = body?.priceId?.trim() || process.env.STRIPE_CARE_PRICE_ID || "";

  if (!projectId) {
    return NextResponse.json({ error: "Project is required." }, { status: 400 });
  }
  if (!priceId) {
    return NextResponse.json(
      { error: "No care plan price is configured." },
      { status: 400 },
    );
  }

  const rows = await adminRest<ProjectRow[]>(
    `projects?id=eq.${encodeURIComponent(projectId)}` +
      "&select=id,clients(business_name,contact_name,users(email))&limit=1",
  );

  const project = rows[0];
  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  const email = project.clients?.users?.email;
  if (!email) {
    return NextResponse.json(
      { error: "This project has no client email on file." },
      { status: 409 },
    );
  }

  try {
    const result = await startCarePlan({
      projectId,
      priceId,
      clientEmail: email,
      clientName:
        project.clients?.contact_name ||
        project.clients?.business_name ||
        "Client",
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not start that care plan.";
    console.error("Care plan start failed", projectId, message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

/**
 * Cancels at the end of the paid period. They paid for this month, so they
 * keep this month.
 */
export async function DELETE(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe is not configured with a test key." },
      { status: 503 },
    );
  }

  const projectId = request.nextUrl.searchParams.get("projectId")?.trim() ?? "";
  if (!projectId) {
    return NextResponse.json({ error: "Project is required." }, { status: 400 });
  }

  try {
    const result = await cancelCarePlan(projectId);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not cancel that care plan.";
    console.error("Care plan cancel failed", projectId, message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
