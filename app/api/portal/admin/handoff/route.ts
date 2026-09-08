import { NextRequest, NextResponse } from "next/server";

import { adminRest, getPortalSession } from "@/app/lib/portalSupabase";

export const dynamic = "force-dynamic";

/**
 * Records that accounts have transferred to the client.
 *
 * This route checks the final payment first so the admin gets a clear message
 * rather than a database error — but the check here is a courtesy, not the
 * control. The real rule lives in the `projects_payment_before_transfer`
 * trigger, which rejects the write regardless of what any route does. If this
 * check is ever removed or wrong, the transfer still cannot happen.
 */
export async function POST(request: NextRequest) {
  const session = await getPortalSession();
  if (!session || session.profile.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as {
    projectId?: string;
  } | null;

  const projectId = body?.projectId?.trim() ?? "";
  if (!projectId) {
    return NextResponse.json({ error: "Project is required." }, { status: 400 });
  }

  const rows = await adminRest<
    {
      id: string;
      final_payment_cleared_at: string | null;
      ownership_transferred_at: string | null;
    }[]
  >(
    `projects?id=eq.${encodeURIComponent(projectId)}` +
      "&select=id,final_payment_cleared_at,ownership_transferred_at&limit=1",
  );

  const project = rows[0];
  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  if (project.ownership_transferred_at) {
    return NextResponse.json({
      ok: true,
      alreadyTransferred: true,
      transferredAt: project.ownership_transferred_at,
    });
  }

  if (!project.final_payment_cleared_at) {
    return NextResponse.json(
      {
        error:
          "The final payment has not cleared. Ownership transfers on payment.",
      },
      { status: 409 },
    );
  }

  try {
    const transferredAt = new Date().toISOString();

    await adminRest(`projects?id=eq.${encodeURIComponent(projectId)}`, {
      method: "PATCH",
      body: JSON.stringify({
        ownership_transferred_at: transferredAt,
        status: "complete",
        launched_at: transferredAt,
      }),
    });

    return NextResponse.json({ ok: true, transferredAt });
  } catch (error) {
    // The trigger raises check_violation if the gate is not open. Surface it
    // as a refusal rather than a generic 500.
    const message =
      error instanceof Error ? error.message : "Could not record the transfer.";
    console.error("Ownership transfer refused", projectId, message);
    return NextResponse.json(
      { error: "Ownership transfer was refused. Check the final payment." },
      { status: 409 },
    );
  }
}
