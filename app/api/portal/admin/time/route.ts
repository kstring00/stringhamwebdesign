import { NextRequest, NextResponse } from "next/server";

import { adminRest, getPortalSession } from "../../../../lib/portalSupabase";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function POST(request: NextRequest) {
  const session = await getPortalSession();
  if (!session || session.profile.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as
    | {
        mode?: "entry" | "checkin";
        projectId?: string;
        date?: string;
        phase?: string;
        description?: string;
        hours?: number;
        hoursMark?: number;
      }
    | null;
  const projectId = body?.projectId?.trim() ?? "";
  if (!projectId) return NextResponse.json({ error: "Project is required." }, { status: 400 });

  try {
    if (body?.mode === "checkin") {
      const hoursMark = Number(body.hoursMark);
      if (!Number.isFinite(hoursMark) || hoursMark <= 0) {
        return NextResponse.json({ error: "A valid check-in mark is required." }, { status: 400 });
      }
      const existing = await adminRest<{ id: string }[]>(
        `time_checkins?project_id=eq.${encodeURIComponent(projectId)}&hours_mark=eq.${encodeURIComponent(String(hoursMark))}&select=id&limit=1`,
      );
      if (!existing[0]) {
        await adminRest("time_checkins", {
          method: "POST",
          body: JSON.stringify({ project_id: projectId, hours_mark: hoursMark }),
        });
      }
      return NextResponse.json({ ok: true, message: `${hoursMark.toFixed(0)}-hour client check-in marked sent.` });
    }

    const date = body?.date?.trim() ?? "";
    const phase = body?.phase?.trim() ?? "";
    const description = body?.description?.trim() ?? "";
    const hours = Number(body?.hours);
    if (!DATE_RE.test(date) || !phase || !description || !Number.isFinite(hours) || hours <= 0 || hours > 24) {
      return NextResponse.json({ error: "Date, phase, description, and valid hours are required." }, { status: 400 });
    }

    const inserted = await adminRest<{ id: string }[]>("time_entries", {
      method: "POST",
      returnRepresentation: true,
      body: JSON.stringify({
        project_id: projectId,
        date,
        phase,
        description,
        hours,
      }),
    });
    return NextResponse.json({ ok: true, entry: inserted[0], message: `${hours.toFixed(1)} hours logged.` });
  } catch (error) {
    console.error("Admin time action failed", error);
    return NextResponse.json({ error: "The time entry could not be saved." }, { status: 500 });
  }
}
