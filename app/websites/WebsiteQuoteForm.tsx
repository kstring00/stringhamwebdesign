"use client";

import { useState, type FormEvent } from "react";

import { site } from "../data/site";
import styles from "../home/form.module.css";
import { track } from "../lib/track";
import { SOURCE_KEYS, useSourceFields } from "../lib/useSourceFields";

/** Messages for a native (no-JS) post that bounced back with ?error=… */
const NATIVE_ERRORS: Record<string, string> = {
  fields: "Please fill in your name, business, town, and a phone number or email.",
  busy: "Too many requests in a row. Please wait a few minutes.",
  send: "I couldn't send that just now.",
};

/**
 * The website quote form. Posts JSON with JavaScript, or natively to the
 * same route without it. "Who referred you?" is how a referrer gets credit
 * for the referral reward; utm tags and the referrer ride along hidden.
 */
export default function WebsiteQuoteForm({ sent = false, errorCode = "" }: { sent?: boolean; errorCode?: string }) {
  const nativeError = NATIVE_ERRORS[errorCode] ?? (errorCode ? "That didn't go through." : "");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(sent ? "sent" : nativeError ? "error" : "idle");
  const [error, setError] = useState(nativeError);
  const [who, setWho] = useState("");

  useSourceFields("website-quote-form");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/website-quote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error || "That didn't go through.");
      setWho(data.name.trim());
      setState("sent");
      track("website_quote_submit", { referred: data.referred_by ? "yes" : "no", source: data.utm_source || (data.referrer ? "referral" : "direct") });
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "That didn't go through.");
    }
  }

  if (state === "sent") {
    return (
      <div className={styles.sent} role="status">
        <h3>Thanks{who ? `, ${who}` : ""}.</h3>
        <p>I&rsquo;ll read this and text or email you within 24 hours. If it&rsquo;s a fit, the next step is a short conversation, then a fixed written quote. &mdash; Kyle</p>
        <p className={styles.sentSmall}>Need me sooner? <a className="u" href={site.phoneHref}>Call or text {site.phone}</a>.</p>
      </div>
    );
  }

  return (
    <form className={styles.form} id="website-quote-form" onSubmit={onSubmit} method="post" action="/api/website-quote">
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="wq-name">Your name</label>
          <input className={styles.input} id="wq-name" name="name" autoComplete="name" required maxLength={100} />
        </div>
        <div className={styles.field}>
          <label htmlFor="wq-business">Business name</label>
          <input className={styles.input} id="wq-business" name="business" autoComplete="organization" required maxLength={120} />
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="wq-town">Town</label>
          <input className={styles.input} id="wq-town" name="town" autoComplete="address-level2" required maxLength={80} />
        </div>
        <div className={styles.field}>
          <label htmlFor="wq-phone">Best phone number</label>
          <input className={styles.input} id="wq-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" maxLength={30} aria-describedby="wq-contact-note" />
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="wq-email">Email</label>
          <input className={styles.input} id="wq-email" name="email" type="email" autoComplete="email" maxLength={180} aria-describedby="wq-contact-note" />
        </div>
        <div className={styles.field}>
          <label htmlFor="wq-current">Current website <small>optional</small></label>
          <input className={styles.input} id="wq-current" name="current_site" inputMode="url" maxLength={200} />
        </div>
      </div>
      <p className={styles.fine} id="wq-contact-note">A phone number or an email is enough. I&rsquo;ll reply the way you prefer.</p>
      <div className={styles.field}>
        <label htmlFor="wq-goals">What should the site help your customers do? <small>optional</small></label>
        <textarea className={styles.input} id="wq-goals" name="goals" rows={4} maxLength={1000} />
      </div>
      <div className={styles.field}>
        <label htmlFor="wq-ref">Who referred you? <small>optional</small></label>
        <input className={styles.input} id="wq-ref" name="referred_by" maxLength={120} autoComplete="off" />
      </div>

      {/* Where the visitor came from. Filled by the script; harmless when empty. */}
      {SOURCE_KEYS.map((k) => <input key={k} type="hidden" name={k} defaultValue="" />)}
      <input type="hidden" name="referrer" defaultValue="" />
      {/* Honeypot: off screen, inert and skipped by password managers. The API
          drops any submission where `website` has a value. */}
      <div className={styles.honeypot} aria-hidden="true" inert>
        <label htmlFor="wq-website">Leave this empty</label>
        <input id="wq-website" name="website" type="text" tabIndex={-1} autoComplete="off" data-1p-ignore="" data-lpignore="true" data-bwignore="true" data-form-type="other" />
      </div>

      {state === "error" ? <p className={styles.error} role="alert">{error} Nothing was lost; try again, or email <a className="u" href={`mailto:${site.email}`}>{site.email}</a>.</p> : null}
      <div className={styles.submitRow}>
        <button className="btn" type="submit" disabled={state === "sending"}>
          {state === "sending" ? "Sending…" : "Request a website quote"}
        </button>
        <p className={styles.fine}>No obligation. I reply within 24 hours. <a className="u" href="/privacy">Privacy</a></p>
      </div>
    </form>
  );
}
