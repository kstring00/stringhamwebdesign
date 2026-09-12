import { NextRequest, NextResponse } from "next/server";

import { getPortalSession, userRest } from "../../../lib/portalSupabase";

export const dynamic = "force-dynamic";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const MAX_VALUE_LENGTH = 4000;

type ItemRow = {
  id: string;
  project_id: string;
  name: string;
  item_type: "file" | "text" | "link" | "confirm";
  status: string;
  note: string | null;
  value: string | null;
  file_id: string | null;
  position: number;
  submitted_at: string | null;
  accepted_at: string | null;
  updated_at: string;
};

const SELECT =
  "id,project_id,name,item_type,status,note,value,file_id,position,submitted_at,accepted_at,updated_at";

/**
 * A client answering one of their own onboarding items.
 *
 * Deliberately thin. Every rule that matters is in Postgres and applies no
 * matter what this handler does:
 *
 *   - the request is sent with the CLIENT's token via userRest, so row-level
 *     security decides which rows exist at all;
 *   - the UPDATE policy excludes items already accepted or marked not
 *     applicable, and its WITH CHECK permits only 'pending' and 'submitted',
 *     so a client cannot accept their own work;
 *   - UPDATE is granted per-column, so name, position and accepted_at are not
 *     writable here even by a hand-rolled request;
 *   - submitted_at is stamped by a trigger, and an attached file must belong
 *     to the same project.
 *
 * So this validates shape and returns a useful error. It is not the control.
 */
export async function PATCH(request: NextRequest) {
  const session = await getPortalSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as
    | { itemId?: string; value?: string | null; fileId?: string | null; submit?: boolean }
    | null;

  const itemId = body?.itemId?.trim() ?? "";
  if (!UUID_RE.test(itemId)) {
    return NextResponse.json({ error: "Checklist item is required." }, { status: 400 });
  }

  const fileId = body?.fileId?.trim() || null;
  if (fileId && !UUID_RE.test(fileId)) {
    return NextResponse.json({ error: "That file reference is not valid." }, { status: 400 });
  }

  const rawValue = typeof body?.value === "string" ? body.value.trim() : null;
  if (rawValue && rawValue.length > MAX_VALUE_LENGTH) {
    return NextResponse.json(
      { error: "That answer is too long. Keep it under 4000 characters." },
      { status: 400 },
    );
  }

  // Read it back through the client's own token first: if RLS hides the row,
  // or it is already accepted, this returns nothing and we can say why.
  const existing = await userRest<ItemRow[]>(
    `project_onboarding_items?id=eq.${encodeURIComponent(itemId)}&select=${SELECT}&limit=1`,
    session.accessToken,
  ).catch(() => []);

  const item = existing[0];
  if (!item) {
    return NextResponse.json({ error: "Checklist item not found." }, { status: 404 });
  }
  if (item.status === "accepted" || item.status === "not_applicable") {
    return NextResponse.json(
      { error: "That item is already settled. Send me a message if it needs reopening." },
      { status: 409 },
    );
  }

  const submitting = body?.submit !== false;

  if (submitting) {
    const missing =
      item.item_type === "file" ? !fileId && !item.file_id : !rawValue && !item.value;
    if (missing) {
      return NextResponse.json(
        {
          error:
            item.item_type === "file"
              ? "Attach a file before submitting this one."
              : "Add an answer before submitting this one.",
        },
        { status: 400 },
      );
    }
  }

  const patch: Record<string, unknown> = {
    status: submitting ? "submitted" : "pending",
  };
  if (rawValue !== null) patch.value = rawValue;
  if (fileId !== null) patch.file_id = fileId;

  try {
    const updated = await userRest<ItemRow[]>(
      `project_onboarding_items?id=eq.${encodeURIComponent(itemId)}&select=${SELECT}`,
      session.accessToken,
      {
        method: "PATCH",
        returnRepresentation: true,
        body: JSON.stringify(patch),
      },
    );

    if (!updated?.[0]) {
      // RLS accepted the read but refused the write.
      return NextResponse.json(
        { error: "That item could not be updated." },
        { status: 403 },
      );
    }

    return NextResponse.json({ ok: true, item: updated[0] });
  } catch (error) {
    console.error("Onboarding submission failed", itemId, error);
    return NextResponse.json(
      { error: "That answer could not be saved. Try again in a moment." },
      { status: 500 },
    );
  }
}
