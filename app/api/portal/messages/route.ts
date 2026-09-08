import { NextRequest, NextResponse } from "next/server";

import {
  adminRest,
  getPortalSession,
  userRest,
} from "../../../lib/portalSupabase";

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
