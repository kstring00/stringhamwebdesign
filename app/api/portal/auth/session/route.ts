import { NextRequest, NextResponse } from "next/server";

import {
  adminRest,
  clearPortalCookies,
  getPortalSession,
  setPortalCookies,
  validatePortalTokens,
} from "../../../../lib/portalSupabase";

function redirectFor(role: "admin" | "client") {
  return role === "admin" ? "/portal/dashboard" : "/portal/projects";
}

export async function GET() {
  const session = await getPortalSession();

  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: session.profile,
    redirectTo: redirectFor(session.profile.role),
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | {
        accessToken?: string;
        refreshToken?: string;
        expiresIn?: number;
      }
    | null;

  const accessToken = body?.accessToken ?? "";
  const refreshToken = body?.refreshToken ?? "";

  if (!accessToken || !refreshToken) {
    return NextResponse.json({ error: "Missing session tokens." }, { status: 400 });
  }

  const validated = await validatePortalTokens(accessToken);

  if (!validated) {
    await clearPortalCookies();
    return NextResponse.json(
      { error: "This email isn't set up for portal access yet." },
      { status: 403 },
    );
  }

  const email = validated.profile.email.trim().toLowerCase();
  const now = new Date().toISOString();
  let windowRow: { id: string } | undefined;

  try {
    const windows = await adminRest<{ id: string }[]>(
      `portal_magic_link_windows?email=eq.${encodeURIComponent(email)}&used_at=is.null&expires_at=gt.${encodeURIComponent(now)}&select=id&order=requested_at.desc&limit=1`,
    );
    windowRow = windows[0];
  } catch (error) {
    console.error("Portal magic-link window lookup failed", error);
    await clearPortalCookies();
    return NextResponse.json(
      { error: "This sign-in link could not be verified. Request a new one." },
      { status: 500 },
    );
  }

  if (!windowRow) {
    await clearPortalCookies();
    return NextResponse.json(
      { error: "This sign-in link has expired. Request a new one." },
      { status: 403 },
    );
  }

  await setPortalCookies(
    accessToken,
    refreshToken,
    Math.max(60, Math.min(body?.expiresIn ?? 3600, 7200)),
  );

  await adminRest(`portal_magic_link_windows?id=eq.${encodeURIComponent(windowRow.id)}`, {
    method: "PATCH",
    body: JSON.stringify({ used_at: new Date().toISOString() }),
  }).catch((error) => console.error("Portal magic-link consume failed", error));

  return NextResponse.json({
    authenticated: true,
    user: validated.profile,
    redirectTo: redirectFor(validated.profile.role),
  });
}

export async function DELETE() {
  await clearPortalCookies();
  return NextResponse.json({ ok: true });
}
