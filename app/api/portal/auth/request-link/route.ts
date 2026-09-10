import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";

import {
  adminRest,
  bootstrapAdminIfNeeded,
  sendPortalMagicLink,
} from "../../../../lib/portalSupabase";
import { portalUrl } from "../../../../lib/portalUrl";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_WINDOW_MS = 60_000;

/**
 * The portal is invite-only. This endpoint never creates an account:
 * `bootstrapAdminIfNeeded` only matches the single configured admin address,
 * and `sendPortalMagicLink` passes `create_user: false`, so Supabase will not
 * mint one either. An address that is not already in `public.users` gets
 * nothing but the same reply everyone else gets.
 *
 * Preventing account enumeration takes more than an identical response body.
 * The work for a known address — a throttle lookup, a window insert, an SMTP
 * round-trip to Supabase — takes measurably longer than the single failed
 * lookup for an unknown one, and a failed send used to surface as a 500 that
 * only a *known* address could ever produce. Both are usable oracles.
 *
 * So the response is sent first and every branch runs in `after()`. The caller
 * gets the same status, the same body, and the same timing whether the address
 * is a client, the admin, throttled, or completely unknown.
 */

/** Logs the event without putting a client's address in the log. */
function emailFingerprint(email: string) {
  return createHash("sha256").update(email).digest("hex").slice(0, 12);
}

async function deliverSignInLink(email: string) {
  const fingerprint = emailFingerprint(email);

  try {
    await bootstrapAdminIfNeeded(email);
  } catch (error) {
    console.error("Admin bootstrap failed", fingerprint, error);
    return;
  }

  let profile: { id: string }[];
  try {
    profile = await adminRest<{ id: string }[]>(
      `users?email=eq.${encodeURIComponent(email)}&select=id&limit=1`,
    );
  } catch (error) {
    console.error("Portal account lookup failed", fingerprint, error);
    return;
  }

  if (!profile[0]) {
    console.warn("Portal sign-in requested for unknown account", fingerprint);
    return;
  }

  try {
    const latest = await adminRest<{ requested_at: string }[]>(
      `portal_magic_link_windows?email=eq.${encodeURIComponent(email)}` +
        "&select=requested_at&order=requested_at.desc&limit=1",
    );
    const lastSent = latest[0]?.requested_at
      ? new Date(latest[0].requested_at).getTime()
      : 0;

    if (lastSent && Date.now() - lastSent < RESEND_WINDOW_MS) return;

    const inserted = await adminRest<{ id: string }[]>(
      "portal_magic_link_windows",
      {
        method: "POST",
        returnRepresentation: true,
        body: JSON.stringify({ email }),
      },
    );

    try {
      await sendPortalMagicLink(email, portalUrl());
    } catch (error) {
      // Release the window so the next attempt is not throttled by a send
      // that never happened.
      const id = inserted[0]?.id;
      if (id) {
        await adminRest(
          `portal_magic_link_windows?id=eq.${encodeURIComponent(id)}`,
          { method: "DELETE" },
        ).catch(() => undefined);
      }
      throw error;
    }
  } catch (error) {
    console.error("Portal sign-in email failed", fingerprint, error);
  }
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | { email?: string }
    | null;
  const email = body?.email?.trim().toLowerCase() ?? "";

  // Format validation is safe to answer differently: it reveals nothing about
  // who holds an account, only that the string is not an address.
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  after(() => deliverSignInLink(email));

  return NextResponse.json({ ok: true });
}
