import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import {
  adminRest,
  bootstrapAdminIfNeeded,
  sendPortalMagicLink,
} from "../../../../lib/portalSupabase";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PORTAL_URL = "https://www.stringhamwebdesign.com/portal";
const RESEND_WINDOW_MS = 60_000;

function emailFingerprint(email: string) {
  return createHash("sha256").update(email).digest("hex").slice(0, 12);
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | { email?: string }
    | null;
  const email = body?.email?.trim().toLowerCase() ?? "";

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  try {
    await bootstrapAdminIfNeeded(email);
  } catch (error) {
    console.error("Admin bootstrap failed", error);
    return NextResponse.json(
      { error: "Something went wrong sending that link. Try again in a moment." },
      { status: 500 },
    );
  }

  let profile: { id: string }[];
  try {
    profile = await adminRest<{ id: string }[]>(
      `users?email=eq.${encodeURIComponent(email)}&select=id&limit=1`,
    );
  } catch (error) {
    console.error("Portal account lookup failed", error);
    return NextResponse.json(
      { error: "Something went wrong sending that link. Try again in a moment." },
      { status: 500 },
    );
  }

  // Deliberately return the same success response for unknown addresses.
  // The fingerprint lets production logs show the event without storing the raw address.
  if (!profile[0]) {
    console.warn("Portal sign-in requested for unknown account", emailFingerprint(email));
    return NextResponse.json({ ok: true });
  }

  try {
    const latest = await adminRest<{ requested_at: string }[]>(
      `portal_magic_link_windows?email=eq.${encodeURIComponent(email)}&select=requested_at&order=requested_at.desc&limit=1`,
    );
    const lastSent = latest[0]?.requested_at ? new Date(latest[0].requested_at).getTime() : 0;

    // Preserve the same outward response during the 60-second resend window.
    if (lastSent && Date.now() - lastSent < RESEND_WINDOW_MS) {
      return NextResponse.json({ ok: true });
    }

    const inserted = await adminRest<{ id: string }[]>("portal_magic_link_windows", {
      method: "POST",
      returnRepresentation: true,
      body: JSON.stringify({ email }),
    });

    try {
      await sendPortalMagicLink(email, PORTAL_URL);
    } catch (error) {
      const id = inserted[0]?.id;
      if (id) {
        await adminRest(`portal_magic_link_windows?id=eq.${encodeURIComponent(id)}`, {
          method: "DELETE",
        }).catch(() => undefined);
      }
      throw error;
    }
  } catch (error) {
    console.error("Portal sign-in email failed", error);
    return NextResponse.json(
      { error: "Something went wrong sending that link. Try again in a moment." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
