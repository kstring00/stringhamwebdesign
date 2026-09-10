import { NextRequest, NextResponse } from "next/server";

import {
  adminRest,
  getPortalSession,
  sendPortalMagicLink,
} from "../../../../../lib/portalSupabase";
import { portalUrl } from "../../../../../lib/portalUrl";


type ClientRow = {
  id: string;
  user_id: string;
  business_name: string;
  invited_at: string | null;
};

type UserRow = {
  id: string;
  email: string;
};

export async function POST(request: NextRequest) {
  const session = await getPortalSession();
  if (!session || session.profile.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as { clientId?: string } | null;
  const clientId = body?.clientId?.trim() ?? "";
  if (!clientId) return NextResponse.json({ error: "Client is required." }, { status: 400 });

  try {
    const clients = await adminRest<ClientRow[]>(
      `clients?id=eq.${encodeURIComponent(clientId)}&select=id,user_id,business_name,invited_at&limit=1`,
    );
    const client = clients[0];
    if (!client) return NextResponse.json({ error: "Client not found." }, { status: 404 });

    const users = await adminRest<UserRow[]>(
      `users?id=eq.${encodeURIComponent(client.user_id)}&select=id,email&limit=1`,
    );
    const email = users[0]?.email;
    if (!email) return NextResponse.json({ error: "Client email not found." }, { status: 404 });

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

    const now = new Date().toISOString();
    await adminRest(`clients?id=eq.${encodeURIComponent(client.id)}`, {
      method: "PATCH",
      body: JSON.stringify({
        invited_at: client.invited_at || now,
        invite_last_sent_at: now,
      }),
    });

    return NextResponse.json({ ok: true, message: `Portal invite sent to ${client.business_name}.` });
  } catch (error) {
    console.error("Portal invite resend failed", error);
    return NextResponse.json({ error: "The portal invite could not be sent." }, { status: 500 });
  }
}
