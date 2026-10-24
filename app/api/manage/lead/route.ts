import { NextRequest, NextResponse } from "next/server";

import { ADMIN_COOKIE, validSession } from "@/app/lib/adminAuth";
import { clean } from "@/app/lib/inbox";
import { createManualLead, LEAD_STATUSES, owed, updateLead, type LeadStatus } from "@/app/lib/referrals";

export const dynamic = "force-dynamic";

/** Updates one lead's status, build price and notes. Signed-in admin only. */
export async function PATCH(request: NextRequest) {
  if (!validSession(request.cookies.get(ADMIN_COOKIE)?.value)) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  let body: Record<string, unknown>;
  try { body = (await request.json()) as Record<string, unknown>; } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const id = clean(body.id, 64);
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Invalid lead." }, { status: 400 });
  const status = String(body.status || "") as LeadStatus;
  if (!LEAD_STATUSES.includes(status)) return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  const raw = body.build_price;
  const price = raw === "" || raw === null || raw === undefined ? null : Number(raw);
  if (price !== null && (!Number.isFinite(price) || price < 0 || price > 1_000_000)) return NextResponse.json({ error: "Build price must be a dollar amount." }, { status: 400 });
  try {
    const lead = await updateLead(id, { status, build_price: price === null ? null : Math.round(price * 100) / 100, notes: clean(body.notes, 1000) || null });
    if (!lead) return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    return NextResponse.json({ ok: true, lead, owed: owed(lead) });
  } catch {
    return NextResponse.json({ error: "Couldn't save. Try again." }, { status: 502 });
  }
}

/** Logs a call or a text Kyle took by phone, as a lead. Signed-in admin only. */
export async function POST(request: NextRequest) {
  if (!validSession(request.cookies.get(ADMIN_COOKIE)?.value)) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  let body: Record<string, unknown>;
  try { body = (await request.json()) as Record<string, unknown>; } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const kind = body.kind === "text" ? "text" : body.kind === "call" ? "call" : null;
  const business = clean(body.business, 120);
  const contact_name = clean(body.contact_name, 100);
  const contact = clean(body.contact, 180);
  if (!kind || (!business && !contact_name && !contact)) return NextResponse.json({ error: "Add at least a business, a name or a number." }, { status: 400 });
  try {
    const lead = await createManualLead({ kind, business, contact_name, contact, heard: clean(body.heard, 160), notes: clean(body.notes, 1000) });
    return NextResponse.json({ ok: true, lead });
  } catch {
    return NextResponse.json({ error: "Couldn't save. Check that the leads SQL has been run." }, { status: 502 });
  }
}
