"use client";

import { useState, type FormEvent } from "react";

import { partnerCategories, partnerInterests } from "../data/partners";
import { site } from "../data/site";
import styles from "../home/form.module.css";
import { track } from "../lib/track";

const NATIVE_ERRORS: Record<string, string> = {
  fields: "Please fill in your name, business, email, what you do and what you're interested in.",
  busy: "Too many requests in a row. Please wait a few minutes.",
  send: "I couldn't send that just now.",
};

/**
 * The partner inquiry. Posts JSON with JavaScript, or natively to the same
 * route without it (303 back here). Reuses the free check form's styles.
 */
export default function PartnerForm({ sent = false, errorCode = "" }: { sent?: boolean; errorCode?: string }) {
  const nativeError = NATIVE_ERRORS[errorCode] ?? (errorCode ? "That didn't go through." : "");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(sent ? "sent" : nativeError ? "error" : "idle");
  const [error, setError] = useState(nativeError);
  const [name, setName] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/partner-inquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error || "That didn't go through.");
      setName(data.name.trim());
      setState("sent");
      track("partner_submit", { partner_category: data.category || "unspecified", partner_interest: data.interest || "unspecified" });
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "That didn't go through.");
    }
  }

  if (state === "sent") {
    return (
      <div className={styles.sent} role="status">
        <h3>Got it{name ? `, ${name}` : ""}. I&rsquo;ll reply within two business days.</h3>
        <p>I&rsquo;ll read this and email you to set up a short call. No obligation. &mdash; Kyle</p>
        <p className={styles.sentSmall}>Prefer email? <a className="u" href={`mailto:${site.email}`}>{site.email}</a></p>
      </div>
    );
  }

  return (
    <form className={styles.form} id="partner-inquiry" onSubmit={onSubmit} method="post" action="/api/partner-inquiry">
      <p className={styles.fine}><span className={styles.req} aria-hidden="true">*</span> Required</p>
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="pi-name">Name <span className={styles.req} aria-hidden="true">*</span></label>
          <input className={styles.input} id="pi-name" name="name" autoComplete="name" required maxLength={100} />
        </div>
        <div className={styles.field}>
          <label htmlFor="pi-business">Business name <span className={styles.req} aria-hidden="true">*</span></label>
          <input className={styles.input} id="pi-business" name="business" autoComplete="organization" required maxLength={120} />
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="pi-site">Business website <small>optional</small></label>
          <input className={styles.input} id="pi-site" name="business_site" type="text" inputMode="url" autoComplete="url" placeholder="yourstudio.com" maxLength={200} />
        </div>
        <div className={styles.field}>
          <label htmlFor="pi-email">Professional email <span className={styles.req} aria-hidden="true">*</span></label>
          <input className={styles.input} id="pi-email" name="email" type="email" autoComplete="email" required maxLength={180} />
        </div>
      </div>
      <div className={styles.field}>
        <label htmlFor="pi-category">What you do <span className={styles.req} aria-hidden="true">*</span></label>
        <select className={styles.input} id="pi-category" name="category" required defaultValue="">
          <option value="" disabled>Choose one</option>
          {partnerCategories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <fieldset className={styles.fieldset}>
        <legend>Interested in <span className={styles.req} aria-hidden="true">*</span></legend>
        <div className={styles.choices}>
          {partnerInterests.map((i) => (
            <label className={styles.choice} key={i}>
              <input type="radio" name="interest" value={i} required />
              <span>{i}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className={styles.field}>
        <label htmlFor="pi-message">Anything you&rsquo;d like me to know <small>optional</small></label>
        <textarea className={styles.input} id="pi-message" name="message" rows={4} maxLength={1500} />
      </div>
      {/* Honeypot. `inert` keeps it out of focus, clicks and the accessibility
          tree in every browser; aria-hidden covers older ones; the CSS keeps it
          off screen. Password managers are told to leave it alone, so a real
          person never fills it by accident. The API drops any submission where
          `website` has a value. */}
      <div className={styles.honeypot} aria-hidden="true" inert>
        <label htmlFor="pi-website">Leave this empty</label>
        <input id="pi-website" name="website" type="text" tabIndex={-1} autoComplete="off" data-1p-ignore="" data-lpignore="true" data-bwignore="true" data-form-type="other" />
      </div>
      {state === "error" ? <p className={styles.error} role="alert">{error} Nothing was lost; try again, or email {site.email}.</p> : null}
      <div className={styles.submitRow}>
        <button className="btn" type="submit" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Start the conversation"}</button>
        <p className={styles.fine}>No cost, no commitment. Your details are used only to reply. <a className="u" href="/privacy">Privacy</a></p>
      </div>
    </form>
  );
}
