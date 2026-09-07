import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getPortalSession } from "../lib/portalSupabase";
import PortalRouter from "./PortalRouter";

export const metadata: Metadata = {
  title: "Client Portal | Kyle Stringham",
  description:
    "Private project workspace for Stringham Web Design clients — project status, messages, files, time logs, and invoices.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PortalPage() {
  let session = null;

  try {
    session = await getPortalSession();
  } catch {
    // A stale access cookie can require refresh; the client entry point below
    // resolves that through the session route handler, where cookies can be updated.
  }

  if (session) {
    redirect(session.profile.role === "admin" ? "/portal/dashboard" : "/portal/projects");
  }

  return <PortalRouter />;
}
