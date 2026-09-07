"use client";

import { useEffect, useState } from "react";

import AdminDashboard from "./AdminDashboard";
import PortalClient from "./PortalClient";
import styles from "./portal.module.css";

type PortalUser = {
  id: string;
  email: string;
  role: "admin" | "client";
  name: string;
};

export default function PortalRouter() {
  const [checking, setChecking] = useState(true);
  const [admin, setAdmin] = useState<PortalUser | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function resolvePortal() {
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");
      const expiresIn = Number(hash.get("expires_in") || "3600");

      if (accessToken && refreshToken) {
        const response = await fetch("/api/portal/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken, refreshToken, expiresIn }),
        });
        history.replaceState(null, "", window.location.pathname);
        if (!response.ok) {
          if (!cancelled) setChecking(false);
          return;
        }
      }

      const session = await fetch("/api/portal/auth/session", { cache: "no-store" });
      if (session.ok) {
        const payload = (await session.json()) as { user: PortalUser };
        if (!cancelled && payload.user.role === "admin") {
          setAdmin(payload.user);
        }
      }
      if (!cancelled) setChecking(false);
    }

    resolvePortal().catch(() => {
      if (!cancelled) setChecking(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (checking) {
    return (
      <main className={styles.portalShell}>
        <div className={styles.loadingMark} aria-label="Loading client portal">
          <span>KS</span>
          <i />
        </div>
      </main>
    );
  }

  if (admin) {
    return (
      <AdminDashboard
        user={admin}
        onLogout={async () => {
          await fetch("/api/portal/auth/session", { method: "DELETE" });
          setAdmin(null);
          window.location.replace("/portal");
        }}
      />
    );
  }

  return <PortalClient />;
}
