import { NextResponse } from "next/server";

import { getPortalSession, userRest } from "../../../lib/portalSupabase";

type Project = {
  id: string;
  client_id: string;
  name: string;
  slug: string;
  status: string;
  tier: string | null;
  quoted_total: number | null;
  started_at: string | null;
  launched_at: string | null;
  created_at: string;
};

type Client = {
  id: string;
  user_id: string;
  business_name: string;
  contact_name: string;
  phone: string | null;
};

type FileRow = {
  id: string;
  project_id: string;
  uploaded_by: string;
  filename: string;
  size: number;
  kind: "deliverable" | "asset" | "doc";
  created_at: string;
};

type TimeEntry = {
  id: string;
  project_id: string;
  date: string;
  phase: string;
  description: string;
  hours: number;
};

type Invoice = {
  id: string;
  project_id: string;
  amount: number;
  status: string;
  due_at: string | null;
  paid_at: string | null;
};

type OnboardingItem = {
  id: string;
  project_id: string;
  name: string;
  item_type: "file" | "text" | "link" | "confirm";
  status: "pending" | "submitted" | "accepted" | "needs_changes" | "not_applicable";
  note: string | null;
  value: string | null;
  file_id: string | null;
  position: number;
  submitted_at: string | null;
  accepted_at: string | null;
  updated_at: string;
};

/** The 10-hour marks already sent, so the client timesheet can show them. */
type TimeCheckin = {
  id: string;
  project_id: string;
  hours_mark: number;
  sent_at: string;
};

export async function GET() {
  const session = await getPortalSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const [
      projects,
      clients,
      fileRows,
      timeEntries,
      invoices,
      onboardingItems,
      timeCheckins,
    ] = await Promise.all([
      userRest<Project[]>(
        "projects?select=id,client_id,name,slug,status,tier,quoted_total,started_at,launched_at,created_at&order=created_at.desc",
        session.accessToken,
      ),
      userRest<Client[]>(
        "clients?select=id,user_id,business_name,contact_name,phone&order=business_name.asc",
        session.accessToken,
      ),
      userRest<FileRow[]>(
        "files?select=id,project_id,uploaded_by,filename,size,kind,created_at&order=created_at.desc",
        session.accessToken,
      ),
      userRest<TimeEntry[]>(
        "time_entries?select=id,project_id,date,phase,description,hours&order=date.desc,created_at.desc",
        session.accessToken,
      ),
      userRest<Invoice[]>(
        "invoices?select=id,project_id,amount,status,due_at,paid_at&order=created_at.desc",
        session.accessToken,
      ),
      userRest<OnboardingItem[]>(
        "project_onboarding_items?select=id,project_id,name,item_type,status,note,value,file_id,position,submitted_at,accepted_at,updated_at&order=position.asc,created_at.asc",
        session.accessToken,
      ),
      userRest<TimeCheckin[]>(
        "time_checkins?select=id,project_id,hours_mark,sent_at&order=hours_mark.asc",
        session.accessToken,
      ),
    ]);

    return NextResponse.json({
      user: session.profile,
      projects,
      clients,
      files: fileRows,
      timeEntries,
      invoices,
      onboardingItems,
      timeCheckins,
    });
  } catch (error) {
    console.error("Portal dashboard load failed", error);
    return NextResponse.json(
      { error: "The portal data could not be loaded." },
      { status: 500 },
    );
  }
}
