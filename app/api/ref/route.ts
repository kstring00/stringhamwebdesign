import { NextRequest, NextResponse } from "next/server";

import { isValidCode } from "@/app/lib/refCode";
import { findPartner } from "@/app/lib/referrals";
import { supabaseConfigured } from "@/app/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/ref?code=maria-cpa → { valid, firstName }. Lets /checkup say
 * "Shared with you by Maria", and RefTracker only save real codes. Only
 * the partner's first name comes back.
 */
export async function GET(request: NextRequest) {
  const code = (request.nextUrl.searchParams.get("code") || "").trim().toLowerCase();
  const none = NextResponse.json({ valid: false });
  if (!isValidCode(code) || !supabaseConfigured()) return none;
  try {
    const partner = await findPartner(code);
    if (!partner) return none;
    return NextResponse.json({ valid: true, firstName: partner.name.split(/\s+/)[0] }, { headers: { "Cache-Control": "private, max-age=600" } });
  } catch {
    return none;
  }
}
