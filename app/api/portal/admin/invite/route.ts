import { NextRequest, NextResponse } from "next/server";

import {
  adminRest,
  ensurePortalUser,
  getPortalSession,
  sendPortalMagicLink,
} from "../../../../lib/portalSupabase";
import { portalUrl } from "../../../../lib/portalUrl";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function slugify(value: string) {
  const base = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 52);
  return `${base || "project"}-${crypto.randomUUID().slice(0, 6)}`;
}

export async function POST(request: NextRequest) {
  const session = await getPortalSession();

  if (!session || session.profile.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as
    | {
        email?: string;
        name?: string;
        businessName?: string;
        phone?: string;
        projectName?: string;
        tier?: string;
        quotedTotal?: number | null;
      }
    | null;

  const email = body?.email?.trim().toLowerCase() ?? "";
  const name = body?.name?.trim() ?? "";
  const businessName = body?.businessName?.trim() ?? "";
  const projectName = body?.projectName?.trim() ?? "";
  const quotedTotal =
    typeof body?.quotedTotal === "number" && Number.isFinite(body.quotedTotal)
      ? Math.max(0, body.quotedTotal)
      : null;

  if (!EMAIL_RE.test(email) || !name || !businessName || !projectName) {
    return NextResponse.json(
      { error: "Name, email, business, and project name are required." },
      { status: 400 },
    );
  }

  try {
    const profile = await ensurePortalUser(email, name, "client");

    const existingClients = await adminRest<{ id: string; invited_at: string | null }[]>(
      `clients?user_id=eq.${encodeURIComponent(profile.id)}&select=id,invited_at&limit=1`,
    );

    let clientId = existingClients[0]?.id;
    const originalInvitedAt = existingClients[0]?.invited_at ?? null;

    if (!clientId) {
      const insertedClients = await adminRest<{ id: string }[]>("clients", {
        method: "POST",
        returnRepresentation: true,
        body: JSON.stringify({
          user_id: profile.id,
          business_name: businessName,
          contact_name: name,
          phone: body?.phone?.trim() || null,
        }),
      });
      clientId = insertedClients[0].id;
    }

    const projects = await adminRest<
      {
        id: string;
        client_id: string;
        name: string;
        slug: string;
        status: string;
        tier: string | null;
        quoted_total: number | null;
        created_at: string;
      }[]
    >("projects", {
      method: "POST",
      returnRepresentation: true,
      body: JSON.stringify({
        client_id: clientId,
        name: projectName,
        slug: slugify(projectName),
        status: "consultation",
        tier: body?.tier?.trim() || null,
        quoted_total: quotedTotal,
      }),
    });

    const windows = await adminRest<{ id: string }[]>("portal_magic_link_windows", {
      method: "POST",
      returnRepresentation: true,
      body: JSON.stringify({ email }),
    });

    try {
      await sendPortalMagicLink(email, portalUrl());
    } catch (error) {
      const windowId = windows[0]?.id;
      if (windowId) {
        await adminRest(`portal_magic_link_windows?id=eq.${encodeURIComponent(windowId)}`, {
          method: "DELETE",
        }).catch(() => undefined);
      }
      throw error;
    }

    const sentAt = new Date().toISOString();
    await adminRest(`clients?id=eq.${encodeURIComponent(clientId)}`, {
      method: "PATCH",
      body: JSON.stringify({
        invited_at: originalInvitedAt || sentAt,
        invite_last_sent_at: sentAt,
      }),
    });

    return NextResponse.json({
      ok: true,
      project: projects[0],
      message: `Invite sent to ${email}.`,
    });
  } catch (error) {
    console.error("Portal client invite failed", error);
    return NextResponse.json(
      { error: "The client could not be added. Check the details and try again." },
      { status: 500 },
    );
  }
}
