import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";

import {
  adminRest,
  getPortalSession,
  userRest,
} from "../../../lib/portalSupabase";
import { adminAddress, notifyNewMessage } from "../../../lib/portalEmail";

type MessageRow = {
  id: string;
  project_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
};

export async function GET(request: NextRequest) {
  const session = await getPortalSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const projectId = request.nextUrl.searchParams.get("projectId") ?? "";
  if (!projectId) {
    return NextResponse.json({ error: "Project is required." }, { status: 400 });
  }

  try {
    const messages = await userRest<MessageRow[]>(
      `messages?project_id=eq.${encodeURIComponent(projectId)}&select=id,project_id,sender_id,body,created_at,read_at&order=created_at.asc`,
      session.accessToken,
    );

    const senderIds = Array.from(new Set(messages.map((message) => message.sender_id)));
    const senderMap: Record<string, { name: string; role: string }> = {};

    if (senderIds.length) {
      const filter = senderIds.map(encodeURIComponent).join(",");
      const senders = await adminRest<
        { id: string; name: string; role: string }[]
      >(`users?id=in.(${filter})&select=id,name,role`);

      for (const sender of senders) {
        senderMap[sender.id] = { name: sender.name, role: sender.role };
      }
    }

    return NextResponse.json({
      messages: messages.map((message) => ({
        ...message,
        sender: senderMap[message.sender_id] ?? {
          name: "Portal user",
          role: "client",
        },
      })),
    });
  } catch (error) {
    console.error("Portal messages load failed", error);
    return NextResponse.json({ error: "Could not load messages." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getPortalSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as
    | { projectId?: string; body?: string }
    | null;
  const projectId = body?.projectId ?? "";
  const messageBody = body?.body?.trim() ?? "";

  if (!projectId || !messageBody || messageBody.length > 10000) {
    return NextResponse.json({ error: "Enter a message." }, { status: 400 });
  }

  try {
    const inserted = await userRest<MessageRow[]>("messages", session.accessToken, {
      method: "POST",
      returnRepresentation: true,
      body: JSON.stringify({
        project_id: projectId,
        sender_id: session.user.id,
        body: messageBody,
      }),
    });

    // Tell whoever did not write it. Scheduled after the response so a mail
    // outage cannot fail a message that was already saved.
    after(() => notifyRecipient(projectId, session.profile.role, session.profile.name));

    return NextResponse.json({
      message: {
        ...inserted[0],
        sender: {
          name: session.profile.name,
          role: session.profile.role,
        },
      },
    });
  } catch (error) {
    console.error("Portal message send failed", error);
    return NextResponse.json({ error: "Could not send the message." }, { status: 500 });
  }
}


/**
 * Resolves who should hear about a new message and mails them.
 *
 * Uses the service key deliberately: a client cannot read the admin's row, and
 * the admin cannot be expected to be online. This reads two columns to build
 * an address and nothing else.
 */
async function notifyRecipient(
  projectId: string,
  senderRole: "admin" | "client",
  senderName: string,
) {
  try {
    const projects = await adminRest<
      { name: string; clients: { users: { email: string } | null } | null }[]
    >(
      `projects?id=eq.${encodeURIComponent(projectId)}` +
        "&select=name,clients(users(email))&limit=1",
    );

    const project = projects[0];
    if (!project) return;

    const clientEmail = project.clients?.users?.email ?? "";
    const toRole = senderRole === "admin" ? "client" : "admin";
    const to = toRole === "admin" ? adminAddress() : clientEmail;

    await notifyNewMessage({
      to,
      toRole,
      fromName: senderName,
      projectName: project.name,
    });
  } catch (error) {
    console.error("Message notification lookup failed", projectId, error);
  }
}

/**
 * Marks every message on a project read, except your own.
 *
 * The database decides what that means: the policy excludes rows you sent and
 * rows already read, `read_at` is stamped by a trigger, and UPDATE is granted
 * on that one column. This just names the project.
 */
export async function PATCH(request: NextRequest) {
  const session = await getPortalSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as
    | { projectId?: string }
    | null;
  const projectId = body?.projectId?.trim() ?? "";
  if (!projectId) {
    return NextResponse.json({ error: "Project is required." }, { status: 400 });
  }

  try {
    const updated = await userRest<{ id: string }[]>(
      `messages?project_id=eq.${encodeURIComponent(projectId)}` +
        `&sender_id=neq.${encodeURIComponent(session.user.id)}&read_at=is.null`,
      session.accessToken,
      {
        method: "PATCH",
        returnRepresentation: true,
        body: JSON.stringify({ read_at: new Date().toISOString() }),
      },
    );

    return NextResponse.json({ ok: true, marked: updated?.length ?? 0 });
  } catch (error) {
    // Read receipts are a convenience. Never fail the thread over one.
    console.error("Marking messages read failed", projectId, error);
    return NextResponse.json({ ok: true, marked: 0 });
  }
}
