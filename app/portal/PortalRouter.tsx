"use client";

import { FormEvent, useEffect, useState } from "react";

import styles from "./PortalSignIn.module.css";

type SessionResponse = {
  authenticated?: boolean;
  redirectTo?: "/portal/dashboard" | "/portal/projects";
  error?: string;
};

export default function PortalRouter() {
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [resendBusy, setResendBusy] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

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
        const payload = (await response.json().catch(() => null)) as SessionResponse | null;

        if (!response.ok) {
          if (!cancelled) {
            setError(payload?.error || "This sign-in link could not be used.");
            setChecking(false);
          }
          return;
        }

        if (payload?.redirectTo) {
          window.location.replace(payload.redirectTo);
          return;
        }
      }

      const session = await fetch("/api/portal/auth/session", { cache: "no-store" });
      if (session.ok) {
        const payload = (await session.json()) as SessionResponse;
        if (payload.redirectTo) {
          window.location.replace(payload.redirectTo);
          return;
        }
      }

      if (!cancelled) setChecking(false);
    }

    resolvePortal().catch(() => {
      if (!cancelled) {
        setError("Something went wrong. Try again in a moment.");
        setChecking(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = window.setInterval(() => {
      setCountdown((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [countdown]);

  async function sendLink(address: string, preserveSuccess = false) {
    setError("");
    if (preserveSuccess) setResendBusy(true);
    else setStatus("sending");

    const response = await fetch("/api/portal/auth/request-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: address }),
    });
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      setError(payload?.error || "Something went wrong sending that link. Try again in a moment.");
      if (preserveSuccess) setResendBusy(false);
      else setStatus("idle");
      return;
    }

    setSubmittedEmail(address.trim().toLowerCase());
    setStatus("sent");
    setResendBusy(false);
    setCountdown(60);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || status === "sending") return;
    await sendLink(email);
  }

  if (checking) {
    return (
      <main className={styles.page}>
        <div className={styles.loading} aria-label="Checking portal session">
          <span>KS</span>
          <i />
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <a className={styles.back} href="/">← Stringham Web Design</a>
      <section className={styles.card} aria-labelledby="portal-title">
        <div className={styles.brand} aria-label="Stringham Web Design">
          <span>KS</span>
          <i aria-hidden="true" />
          <b>Stringham Web Design</b>
        </div>

        {status === "sent" ? (
          <div className={styles.success} role="status" aria-live="polite">
            <p className={styles.eyebrow}>Secure sign-in</p>
            <h1 id="portal-title">Check your email.</h1>
            <p>
              I sent a sign-in link to <strong>{submittedEmail}</strong>. It expires in 15 minutes.
            </p>
            <div className={styles.linkRow}>
              <button
                className={styles.textLink}
                type="button"
                onClick={() => {
                  setStatus("idle");
                  setEmail("");
                  setSubmittedEmail("");
                  setCountdown(0);
                  setError("");
                }}
              >
                Use a different email
              </button>
              <button
                className={styles.textLink}
                type="button"
                disabled={countdown > 0 || resendBusy}
                onClick={() => sendLink(submittedEmail, true)}
              >
                {resendBusy ? "Resending…" : countdown > 0 ? `Resend in ${countdown}s` : "Resend"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className={styles.eyebrow}>Private workspace</p>
            <h1 id="portal-title">Client portal</h1>
            <p className={styles.subline}>Enter your email and I&apos;ll send you a sign-in link.</p>

            <form className={styles.form} onSubmit={onSubmit}>
              <label htmlFor="portal-email">Email</label>
              <input
                id="portal-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@business.com"
              />
              <button className={styles.primary} type="submit" disabled={status === "sending"}>
                {status === "sending" ? "Sending…" : "Send sign-in link"}
              </button>
            </form>

            <p className={styles.smallPrint}>No password needed. The link works for 15 minutes.</p>
          </>
        )}

        {error ? <p className={styles.error} role="alert">{error}</p> : null}
      </section>
    </main>
  );
}
