import { NextRequest, NextResponse } from "next/server";

import { adminRest, getPortalSession } from "../../../../lib/portalSupabase";

const ALLOWED = new Set(["consultation", "plan_quote", "build", "launch", "paused"]);

function slugify(value: string) {
  const base = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 52);
  return `${base || "project"}-${crypto.randomUUID().slice(0, 6)}`;
}

export async function POST(request: NextRequest) {
  const session = await getPortalSession();
  if (!session || session.profile.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as
    | { clientId?: string; name?: string; status?: string }
    | null;
  const clientId = body?.clientId?.trim() ?? "";
  const name = body?.name?.trim() ?? "";
  const status = ALLOWED.has(body?.status ?? "") ? body?.status : "consultation";
  if (!clientId || !name) {
    return NextResponse.json({ error: "Client and project name are required." }, { status: 400 });
  }

  try {
    const client = await adminRest<{ id: string }[]>(
      `clients?id=eq.${encodeURIComponent(clientId)}&select=id&limit=1`,
    );
    if (!client[0]) return NextResponse.json({ error: "Client not found." }, { status: 404 });

    const inserted = await adminRest<{ id: string; name: string }[]>("projects", {
      method: "POST",
      returnRepresentation: true,
      body: JSON.stringify({
        client_id: clientId,
        name,
        slug: slugify(name),
        status,
      }),
    });

    return NextResponse.json({ ok: true, project: inserted[0], message: `${name} created with the onboarding template.` });
  } catch (error) {
    console.error("Admin project create failed", error);
    return NextResponse.json({ error: "The project could not be created." }, { status: 500 });
  }
}
