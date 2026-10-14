import { NextRequest, NextResponse } from "next/server";

import { ADMIN_COOKIE, ADMIN_DAYS, adminConfigured, newSession, passwordMatches } from "@/app/lib/adminAuth";
import { clientIp, rateLimited } from "@/app/lib/inbox";

export const dynamic = "force-dynamic";

/** The admin sign-in form posts here (natively). A right password sets the session cookie; either way, back to /manage. */
export async function POST(request: NextRequest) {
  const back = (error?: string) => {
    const to = new URL("/manage", request.url);
    if (error) to.searchParams.set("error", error);
    return NextResponse.redirect(to, 303);
  };
  if (!adminConfigured()) return back("setup");
  if (rateLimited(`admin-login:${clientIp(request.headers)}`)) return back("busy");
  let password = "";
  try { password = String((await request.formData()).get("password") || ""); } catch { return back("wrong"); }
  if (!passwordMatches(password)) return back("wrong");
  const res = back();
  res.cookies.set(ADMIN_COOKIE, newSession(), { httpOnly: true, secure: request.nextUrl.protocol === "https:", sameSite: "strict", path: "/", maxAge: ADMIN_DAYS * 24 * 60 * 60 });
  return res;
}
