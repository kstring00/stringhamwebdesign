import type { Metadata } from "next";

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

export default function PortalPage() {
  return <PortalRouter />;
}
