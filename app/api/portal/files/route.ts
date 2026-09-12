import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { normalizeSupabaseUrl } from "@/app/lib/supabaseUrl";

import {
  adminRest,
  getPortalSession,
  storageUserRequest,
  userRest,
} from "../../../lib/portalSupabase";
import { adminAddress, notifyNewFile } from "../../../lib/portalEmail";

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ALLOWED_KINDS = new Set(["deliverable", "asset", "doc"]);

type FileRow = {
  id: string;
  project_id: string;
  uploaded_by: string;
  filename: string;
  storage_path: string;
  size: number;
  kind: "deliverable" | "asset" | "doc";
  created_at: string;
};

function safeFilename(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\w.\- ]+/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 120) || "file";
}

export async function POST(request: NextRequest) {
  const session = await getPortalSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const form = await request.formData();
  const projectId = String(form.get("projectId") ?? "");
  const kind = String(form.get("kind") ?? "asset");
  const file = form.get("file");

  if (!UUID_RE.test(projectId) || !ALLOWED_KINDS.has(kind)) {
    return NextResponse.json({ error: "Invalid upload details." }, { status: 400 });
  }

  if (!(file instanceof File) || file.size <= 0 || file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Choose a file smaller than 20 MB." },
      { status: 400 },
    );
  }

  const accessible = await userRest<{ id: string }[]>(
    `projects?id=eq.${encodeURIComponent(projectId)}&select=id&limit=1`,
    session.accessToken,
  ).catch(() => []);

  if (!accessible[0]) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  const storagePath = `${projectId}/${crypto.randomUUID()}-${safeFilename(file.name)}`;
  const upload = await storageUserRequest(
    `/object/portal-files/${storagePath
      .split("/")
      .map(encodeURIComponent)
      .join("/")}`,
    session.accessToken,
    {
      method: "POST",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
        "x-upsert": "false",
      },
      body: await file.arrayBuffer(),
    },
  );

  if (!upload.ok) {
    const detail = await upload.text().catch(() => "");
    console.error("Portal file upload failed", upload.status, detail.slice(0, 400));
    return NextResponse.json({ error: "Could not upload that file." }, { status: 500 });
  }

  try {
    const inserted = await userRest<FileRow[]>("files", session.accessToken, {
      method: "POST",
      returnRepresentation: true,
      body: JSON.stringify({
        project_id: projectId,
        uploaded_by: session.user.id,
        filename: file.name,
        storage_path: storagePath,
        size: file.size,
        kind,
      }),
    });

    after(() =>
      notifyFileRecipient(
        projectId,
        session.profile.role,
        session.profile.name,
        file.name,
      ),
    );

    const { storage_path: _storagePath, ...publicFile } = inserted[0];
    return NextResponse.json({ file: publicFile });
  } catch (error) {
    console.error("Portal file metadata insert failed", error);
    await storageUserRequest(
      `/object/portal-files/${storagePath
        .split("/")
        .map(encodeURIComponent)
        .join("/")}`,
      session.accessToken,
      { method: "DELETE" },
    ).catch(() => null);
    return NextResponse.json({ error: "Could not save the uploaded file." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const session = await getPortalSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const fileId = request.nextUrl.searchParams.get("fileId") ?? "";
  if (!UUID_RE.test(fileId)) {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }

  const rows = await userRest<FileRow[]>(
    `files?id=eq.${encodeURIComponent(fileId)}&select=id,project_id,uploaded_by,filename,storage_path,size,kind,created_at&limit=1`,
    session.accessToken,
  ).catch(() => []);

  const row = rows[0];
  if (!row) return NextResponse.json({ error: "File not found." }, { status: 404 });

  const sign = await storageUserRequest(
    `/object/sign/portal-files/${row.storage_path
      .split("/")
      .map(encodeURIComponent)
      .join("/")}`,
    session.accessToken,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expiresIn: 60 }),
    },
  );

  if (!sign.ok) {
    return NextResponse.json({ error: "Could not prepare the download." }, { status: 500 });
  }

  const payload = (await sign.json()) as { signedURL?: string; signedUrl?: string };
  const signedPath = payload.signedURL ?? payload.signedUrl ?? "";

  if (!signedPath) {
    return NextResponse.json({ error: "Could not prepare the download." }, { status: 500 });
  }

  // Same normalization as PostgREST: /storage/v1 is appended below, so the
  // configured value must be the bare project URL.
  const base = normalizeSupabaseUrl(process.env.SUPABASE_URL)?.url ?? "";
  const url = signedPath.startsWith("http")
    ? signedPath
    : `${base}/storage/v1${signedPath.startsWith("/") ? "" : "/"}${signedPath}`;

  return NextResponse.json({ url, filename: row.filename });
}


/** Mails whoever did not upload the file. Never fails the upload. */
async function notifyFileRecipient(
  projectId: string,
  senderRole: "admin" | "client",
  senderName: string,
  filename: string,
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

    const toRole = senderRole === "admin" ? "client" : "admin";
    const to = toRole === "admin" ? adminAddress() : project.clients?.users?.email ?? "";

    await notifyNewFile({
      to,
      toRole,
      fromName: senderName,
      filename,
      projectName: project.name,
    });
  } catch (error) {
    console.error("File notification lookup failed", projectId, error);
  }
}
