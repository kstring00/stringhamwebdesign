import { NextRequest, NextResponse } from "next/server";

import { adminRest, getPortalSession, userRest } from "../../../../lib/portalSupabase";

type ItemRow = {
  id: string;
  project_id: string;
  name: string;
  item_type: "file" | "text" | "link" | "confirm";
  status: "pending" | "submitted" | "accepted" | "needs_changes" | "not_applicable";
  note: string | null;
  position: number;
};

async function requireAdmin() {
  const session = await getPortalSession();
  if (!session || session.profile.role !== "admin") return null;
  return session;
}

async function getItem(itemId: string) {
  const rows = await adminRest<ItemRow[]>(
    `project_onboarding_items?id=eq.${encodeURIComponent(itemId)}&select=id,project_id,name,item_type,status,note,position&limit=1`,
  );
  return rows[0] ?? null;
}

export async function PATCH(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  const body = (await request.json().catch(() => null)) as
    | { itemId?: string; action?: string; note?: string }
    | null;
  const itemId = body?.itemId?.trim() ?? "";
  const action = body?.action?.trim() ?? "";
  if (!itemId || !action) {
    return NextResponse.json({ error: "Checklist item and action are required." }, { status: 400 });
  }

  try {
    const item = await getItem(itemId);
    if (!item) return NextResponse.json({ error: "Checklist item not found." }, { status: 404 });

    const now = new Date().toISOString();

    if (action === "nudge") {
      const note = item.status === "needs_changes" && item.note ? ` The requested change is: ${item.note}` : "";
      await userRest("messages", session.accessToken, {
        method: "POST",
        body: JSON.stringify({
          project_id: item.project_id,
          sender_id: session.user.id,
          body: `Quick onboarding reminder: please send or update ${item.name}.${note}`,
        }),
      });
      return NextResponse.json({ ok: true, message: `Reminder sent for ${item.name}.` });
    }

    if (action === "request_changes") {
      const note = body?.note?.trim() ?? "";
      if (!note) return NextResponse.json({ error: "Add a note describing what needs to change." }, { status: 400 });
      await adminRest(`project_onboarding_items?id=eq.${encodeURIComponent(item.id)}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: "needs_changes",
          note,
          reviewed_at: now,
          accepted_at: null,
        }),
      });
      await userRest("messages", session.accessToken, {
        method: "POST",
        body: JSON.stringify({
          project_id: item.project_id,
          sender_id: session.user.id,
          body: `Onboarding update for ${item.name}: ${note}`,
        }),
      });
      return NextResponse.json({ ok: true, message: `Changes requested for ${item.name}.` });
    }

    if (action === "accept") {
      await adminRest(`project_onboarding_items?id=eq.${encodeURIComponent(item.id)}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: "accepted",
          note: null,
          reviewed_at: now,
          accepted_at: now,
        }),
      });
      return NextResponse.json({ ok: true, message: `${item.name} accepted.` });
    }

    if (action === "not_applicable") {
      await adminRest(`project_onboarding_items?id=eq.${encodeURIComponent(item.id)}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: "not_applicable",
          note: null,
          reviewed_at: now,
          accepted_at: null,
        }),
      });
      return NextResponse.json({ ok: true, message: `${item.name} marked not applicable.` });
    }

    if (action === "restore") {
      await adminRest(`project_onboarding_items?id=eq.${encodeURIComponent(item.id)}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: "pending",
          note: null,
          reviewed_at: null,
          accepted_at: null,
        }),
      });
      return NextResponse.json({ ok: true, message: `${item.name} restored to pending.` });
    }

    return NextResponse.json({ error: "Unsupported checklist action." }, { status: 400 });
  } catch (error) {
    console.error("Checklist action failed", error);
    return NextResponse.json({ error: "The checklist could not be updated." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  const body = (await request.json().catch(() => null)) as
    | { projectId?: string; name?: string; itemType?: string }
    | null;
  const projectId = body?.projectId?.trim() ?? "";
  const name = body?.name?.trim() ?? "";
  const itemType = body?.itemType?.trim() ?? "confirm";

  if (!projectId || !name || !["file", "text", "link", "confirm"].includes(itemType)) {
    return NextResponse.json({ error: "Project, item name, and a valid item type are required." }, { status: 400 });
  }

  try {
    const last = await adminRest<{ position: number }[]>(
      `project_onboarding_items?project_id=eq.${encodeURIComponent(projectId)}&select=position&order=position.desc&limit=1`,
    );
    const position = (last[0]?.position ?? 0) + 10;
    const inserted = await adminRest<ItemRow[]>("project_onboarding_items", {
      method: "POST",
      returnRepresentation: true,
      body: JSON.stringify({
        project_id: projectId,
        name,
        item_type: itemType,
        status: "pending",
        position,
      }),
    });
    return NextResponse.json({ ok: true, item: inserted[0], message: `${name} added to the checklist.` });
  } catch (error) {
    console.error("Checklist item create failed", error);
    return NextResponse.json({ error: "The checklist item could not be added." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  const itemId = request.nextUrl.searchParams.get("itemId")?.trim() ?? "";
  if (!itemId) return NextResponse.json({ error: "Checklist item is required." }, { status: 400 });

  try {
    const item = await getItem(itemId);
    if (!item) return NextResponse.json({ error: "Checklist item not found." }, { status: 404 });
    await adminRest(`project_onboarding_items?id=eq.${encodeURIComponent(itemId)}`, { method: "DELETE" });
    return NextResponse.json({ ok: true, message: `${item.name} removed from this project.` });
  } catch (error) {
    console.error("Checklist item delete failed", error);
    return NextResponse.json({ error: "The checklist item could not be removed." }, { status: 500 });
  }
}
