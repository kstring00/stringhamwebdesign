import { NextRequest, NextResponse } from "next/server";

import { ADMIN_COOKIE } from "@/app/lib/adminAuth";

export const dynamic = "force-dynamic";

/** Signs out: clears the session cookie and goes back to the sign-in. */
export async function POST(request: NextRequest) {
  const res = NextResponse.redirect(new URL("/manage", request.url), 303);
  res.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
