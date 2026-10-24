import { NextRequest, NextResponse } from "next/server";

import { ADMIN_COOKIE, validSession } from "@/app/lib/adminAuth";
import { clean } from "@/app/lib/inbox";
import { upsertSearchMonth } from "@/app/lib/referrals";

export const dynamic = "force-dynamic";

/** Saves one month's Search Console totals (impressions, clicks, a note), typed in at /manage. Signed-in admin only. */
export async function PUT(request: NextRequest) {
  if (!validSession(request.cookies.get(ADMIN_COOKIE)?.value)) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  let body: Record<string, unknown>;
  try { body = (await request.json()) as Record<string, unknown>; } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const month = clean(body.month, 7);
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return NextResponse.json({ error: "Pick a month." }, { status: 400 });
  const num = (v: unknown) => { const n = Number(v); return Number.isInteger(n) && n >= 0 && n <= 100_000_000 ? n : null; };
  const impressions = num(body.impressions), clicks = num(body.clicks);
  if (impressions === null || clicks === null) return NextResponse.json({ error: "Impressions and clicks are whole numbers." }, { status: 400 });
  try {
    const row = await upsertSearchMonth({ month: `${month}-01`, impressions, clicks, note: clean(body.note, 500) || null });
    return NextResponse.json({ ok: true, row });
  } catch {
    return NextResponse.json({ error: "Couldn't save. Check that the leads SQL has been run." }, { status: 502 });
  }
}
