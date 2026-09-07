import { redirect } from "next/navigation";

import { getPortalSession } from "../../lib/portalSupabase";
import DashboardClient from "./DashboardClient";

export default async function PortalDashboardPage() {
  let session;

  try {
    session = await getPortalSession();
  } catch {
    redirect("/portal");
  }

  if (!session) redirect("/portal");
  if (session.profile.role !== "admin") redirect("/portal/projects");

  return (
    <DashboardClient
      user={{
        id: session.profile.id,
        email: session.profile.email,
        name: session.profile.name,
      }}
    />
  );
}
