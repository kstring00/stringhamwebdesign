"use client";

import { useState, type FormEvent } from "react";

import { site } from "../data/site";
import { track } from "../lib/track";
import { SOURCE_KEYS, useSourceFields } from "../lib/useSourceFields";
import styles from "./form.module.css";

/** Messages for a native (no-JS) post that bounced back with ?error=… */
const NATIVE_ERRORS: Record<string, string> = {
  fields: "Please fill in your name, business, town and phone number.",
  busy: "Too many requests in a row. Please wait a few minutes.",
  send: "I couldn't send that just now.",
};

/**
 * The free check form. Posts JSON with JavaScript, or natively to the same
 * route without it (that gets a 303 back to /?sent=1#free-check). Where
 * the visitor came from (utm tags and the referrer) rides along in hidden
 * fields so Kyle can see which outreach brought them.
 */
export default function FreeCheckForm({ sent = false, errorCode = "" }: { sent?: boolean; errorCode?: string }) {
  const nativeError = NATIVE_ERRORS[errorCode] ?? (errorCode ? "That didn't go through." : "");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(sent ? "sent" : nativeError ? "error" : "idle");
  const [error, setError] = useState(nativeError);
  const [who, setWho] = useState<{ name: string; business: string }>({ name: "", business: "" });

  useSourceFields("free-check-form");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/free-check", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error || "That didn't go through.");
      setWho({ name: data.name.trim(), business: data.business.trim() });
      setState("sent");
      track("free_check_submit", { business_type: data.type || "unspecified", source: data.utm_source || (data.referrer ? "referral" : "direct") });
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "That didn't go through.");
    }
  }

  if (state === "sent") {
    return (
      <div className={styles.sent} role="status">
        <h3>Got it{who.name ? `, ${who.name}` : ""}. I&rsquo;ll text or email you within 24 hours.</h3>
        <p>I&rsquo;ll look up {who.business || "your business"} the way your customers do and send you what I find. No obligation. &mdash; Kyle</p>
        <p className={styles.sentSmall}>Need me sooner? <a className="u" href={site.phoneHref}>Call or text {site.phone}</a>.</p>
      </div>
    );
  }

  return (
    <form className={styles.form} id="free-check-form" onSubmit={onSubmit} method="post" action="/api/free-check">
      <p className={styles.fine}><span className={styles.req} aria-hidden="true">*</span> Required</p>
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="fc-name">Your name <span className={styles.req} aria-hidden="true">*</span></label>
          <input className={styles.input} id="fc-name" name="name" autoComplete="name" required maxLength={100} />
        </div>
        <div className={styles.field}>
          <label htmlFor="fc-business">Business name <span className={styles.req} aria-hidden="true">*</span></label>
          <input className={styles.input} id="fc-business" name="business" autoComplete="organization" required maxLength={120} />
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="fc-town">Town <span className={styles.req} aria-hidden="true">*</span></label>
          <input className={styles.input} id="fc-town" name="town" autoComplete="address-level2" required maxLength={80} />
        </div>
        <div className={styles.field}>
          <label htmlFor="fc-phone">Best phone number <span className={styles.req} aria-hidden="true">*</span></label>
          <input className={styles.input} id="fc-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" required maxLength={30} />
        </div>
      </div>
      <div className={styles.field}>
        <label htmlFor="fc-email">Email <small>optional</small></label>
        <input className={styles.input} id="fc-email" name="email" type="email" autoComplete="email" maxLength={180} />
      </div>
      <div className={styles.field}>
        <label htmlFor="fc-notes">Anything going on with your listing or website? <small>optional</small></label>
        <textarea className={styles.input} id="fc-notes" name="notes" rows={3} maxLength={1000} />
      </div>
      <div className={styles.field}>
        <label htmlFor="fc-heard">How did you hear about me? <small>optional</small></label>
        <input className={styles.input} id="fc-heard" name="heard" maxLength={160} />
      </div>

      {/* Where the visitor came from. Filled by the script; harmless when empty. */}
      {SOURCE_KEYS.map((k) => <input key={k} type="hidden" name={k} defaultValue="" />)}
      <input type="hidden" name="referrer" defaultValue="" />
      {/* Honeypot. `inert` keeps it out of focus, clicks and the accessibility
          tree in every browser; aria-hidden covers older ones; the CSS keeps it
          off screen. Password managers are told to leave it alone, so a real
          person never fills it by accident. The API drops any submission where
          `website` has a value. */}
      <div className={styles.honeypot} aria-hidden="true" inert>
        <label htmlFor="fc-website">Leave this empty</label>
        <input id="fc-website" name="website" type="text" tabIndex={-1} autoComplete="off" data-1p-ignore="" data-lpignore="true" data-bwignore="true" data-form-type="other" />
      </div>

      {state === "error" ? <p className={styles.error} role="alert">{error} Nothing was lost; try again, or text {site.phone}.</p> : null}
      <div className={styles.submitRow}>
        <button className="btn" type="submit" disabled={state === "sending"}>
          {state === "sending" ? "Sending…" : "Get my free check"}
        </button>
        <p className={styles.fine}>Free, no obligation. I reply within 24 hours. <a className="u" href="/privacy">Privacy</a></p>
      </div>
    </form>
  );
}
