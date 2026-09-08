"use client";

import AdminDashboard from "../AdminDashboard";
import type { AdminUser } from "../adminTypes";

export default function DashboardClient({ user }: { user: AdminUser }) {
  return (
    <AdminDashboard
      user={user}
      onLogout={async () => {
        await fetch("/api/portal/auth/session", { method: "DELETE" }).catch(() => undefined);
        window.location.replace("/portal");
      }}
    />
  );
}
