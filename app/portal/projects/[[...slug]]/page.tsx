import { redirect } from "next/navigation";

import { getPortalSession } from "../../../lib/portalSupabase";
import PortalClient from "../../PortalClient";

export default async function PortalProjectsPage() {
  let session;

  try {
    session = await getPortalSession();
  } catch {
    redirect("/portal");
  }

  if (!session) redirect("/portal");

  return <PortalClient />;
}
