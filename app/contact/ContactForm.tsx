"use client";

import { useState, type FormEvent } from "react";

import { site } from "../data/site";
import styles from "./contact.module.css";

export const NEEDS = ["New website", "Redesign", "Family Resource Hub for my clinic", "Something else"] as const;
type Need = (typeof NEEDS)[number];

/** Messages for a native (no-JS) post that bounced back with ?error=… */
const NATIVE_ERRORS: Record<string, string> = {
  fields: "Please fill in every field.",
  busy: "Too many messages in a row. Please wait a few minutes.",
  send: "I couldn't send that just now.",
};

export default function ContactForm({ initialNeed = "", sent = false, errorCode = "" }: { initialNeed?: Need | ""; sent?: boolean; errorCode?: string }) {
  const [need, setNeed] = useState<Need | "">(initialNeed);
  const nativeError = NATIVE_ERRORS[errorCode] ?? (errorCode ? "That didn't go through." : "");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(sent ? "sent" : nativeError ? "error" : "idle");
  const [error, setError] = useState(nativeError);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error || "That didn't go through.");
      setState("sent");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "That didn't go through.");
    }
  }

  if (state === "sent") {
    return (
      <div className={styles.sent} role="status">
        <h2>Got it.</h2>
        <p>I'll reply within one business day with a link to book the call. If you'd rather not wait, <a className="u" href={site.phoneHref}>call {site.phone}</a>.</p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} method="post" action="/api/contact">
      <div className={styles.field}>
        <label htmlFor="name">Name</label>
        <input className={styles.input} id="name" name="name" autoComplete="name" required maxLength={100} />
      </div>
      <div className={styles.field}>
        <label htmlFor="email">Email</label>
        <input className={styles.input} id="email" name="email" type="email" autoComplete="email" required maxLength={180} />
      </div>
      <div className={styles.field}>
        <label htmlFor="business">Business name</label>
        <input className={styles.input} id="business" name="business" autoComplete="organization" required maxLength={120} />
      </div>
      <div className={styles.field}>
        <label htmlFor="need">What do you need?</label>
        <select className={styles.input} id="need" name="need" required value={need} onChange={(e) => setNeed(e.target.value as Need)}>
          <option value="" disabled>Choose one</option>
          {NEEDS.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
      {need === "Family Resource Hub for my clinic" ? (
        <p className={styles.note} role="note">Please don't include any client or patient information.</p>
      ) : null}
      <div className={styles.field}>
        <label htmlFor="message">Message</label>
        <textarea className={styles.input} id="message" name="message" required maxLength={2000} rows={6} />
      </div>
      {/* Honeypot: invisible to people and assistive tech, filled only by bots. */}
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="website">Leave this empty</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      </div>
      {state === "error" ? <p className={styles.error} role="alert">{error} Nothing was lost; try again or email me directly.</p> : null}
      <div>
        <button className="btn" type="submit" disabled={state === "sending"}>
          {state === "sending" ? "Sending…" : "Send it"}
        </button>
      </div>
      <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>By sending this you agree to the <a className="u" href="/privacy">privacy policy</a>.</p>
    </form>
  );
}
