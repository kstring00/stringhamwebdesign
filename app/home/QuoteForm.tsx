"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

import { site } from "../data/site";
import styles from "./form.module.css";
import { track } from "../lib/track";
import { SOURCE_KEYS, useSourceFields } from "../lib/useSourceFields";

/** Messages for a native (no-JS) post that bounced back with ?error=… */
const NATIVE_ERRORS: Record<string, string> = {
  fields: "Please fill in your name, your business, and a phone number or email.",
  busy: "Too many requests in a row. Please wait a few minutes.",
  send: "I couldn't send that just now.",
};

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isPhone = (v: string) => v.replace(/\D/g, "").length >= 7;
const R = <span className={styles.req} aria-hidden="true">*</span>;

/**
 * The quote + free demo form. One contact field, a phone number or an
 * email, either accepted. Posts JSON with JavaScript, or natively to the
 * same route without it. The confirmation replaces the form and takes
 * focus. utm tags and the referrer ride along hidden.
 */
export default function QuoteForm({ sent = false, errorCode = "" }: { sent?: boolean; errorCode?: string }) {
  const nativeError = NATIVE_ERRORS[errorCode] ?? (errorCode ? "That didn't go through." : "");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(sent ? "sent" : nativeError ? "error" : "idle");
  const [error, setError] = useState(nativeError);
  const [who, setWho] = useState("");
  const done = useRef<HTMLDivElement>(null);

  useSourceFields("quote-form");
  useEffect(() => { if (state === "sent") done.current?.focus(); }, [state]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    const contact = (data.contact || "").trim();
    if (!isEmail(contact) && !isPhone(contact)) {
      setState("error");
      setError("Please add a phone number or an email, so I can reply.");
      form.querySelector<HTMLInputElement>("#q-contact")?.focus();
      return;
    }
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/website-quote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error || "That didn't go through.");
      setWho(data.name.trim().split(/\s+/)[0]);
      setState("sent");
      track("quote_submit", { contact: isEmail(contact) ? "email" : "phone", source: data.utm_source || (data.referrer ? "referral" : "direct") });
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "That didn't go through.");
    }
  }

  if (state === "sent") {
    return (
      <div ref={done} className={styles.sent} role="status" tabIndex={-1}>
        <h3>Got it{who ? `, ${who}` : ""}.</h3>
        <p>I&rsquo;ll text or email you within 24 hours to set up a short call. After that you&rsquo;ll get your fixed quote and a demo of your homepage.</p>
        <p className={styles.sentSmall}>Need me sooner? <a className="u" href={site.phoneHref}>Call or text {site.phone}</a>.</p>
      </div>
    );
  }

  return (
    <form className={styles.form} id="quote-form" onSubmit={onSubmit} method="post" action="/api/website-quote">
      <p className={styles.fine}>{R} Required</p>
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="q-name">Your name {R}</label>
          <input className={styles.input} id="q-name" name="name" autoComplete="name" required maxLength={100} />
        </div>
        <div className={styles.field}>
          <label htmlFor="q-business">Business name {R}</label>
          <input className={styles.input} id="q-business" name="business" autoComplete="organization" required maxLength={120} />
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="q-contact">Phone or email {R}</label>
          <input className={styles.input} id="q-contact" name="contact" required maxLength={180} autoComplete="on" inputMode="email" aria-describedby="q-contact-note" />
          <span className={styles.fine} id="q-contact-note">Either one. I&rsquo;ll reply the way you prefer.</span>
        </div>
        <div className={styles.field}>
          <label htmlFor="q-current">Current website <small>optional</small></label>
          <input className={styles.input} id="q-current" name="current_site" inputMode="url" maxLength={200} placeholder="yourbusiness.com" />
        </div>
      </div>
      <div className={styles.field}>
        <label htmlFor="q-goals">What should your site help customers do? <small>optional</small></label>
        <textarea className={styles.input} id="q-goals" name="goals" rows={3} maxLength={1000} placeholder="Call, book, order, ask for a quote…" />
      </div>
      <div className={styles.field}>
        <label htmlFor="q-heard">How did you hear about me, or who referred you? <small>optional</small></label>
        <input className={styles.input} id="q-heard" name="heard" maxLength={160} autoComplete="off" />
      </div>

      {/* Where the visitor came from. Filled by the script; harmless when empty. */}
      {SOURCE_KEYS.map((k) => <input key={k} type="hidden" name={k} defaultValue="" />)}
      <input type="hidden" name="referrer" defaultValue="" />
      {/* Honeypot: off screen, inert and skipped by password managers. The API
          drops any submission where `website` has a value. */}
      <div className={styles.honeypot} aria-hidden="true" inert>
        <label htmlFor="q-website">Leave this empty</label>
        <input id="q-website" name="website" type="text" tabIndex={-1} autoComplete="off" data-1p-ignore="" data-lpignore="true" data-bwignore="true" data-form-type="other" />
      </div>

      {state === "error" ? <p className={styles.error} role="alert">{error} Nothing was lost; try again, or <a className="u" href={site.phoneHref}>text me</a>.</p> : null}
      <div className={styles.submitRow}>
        <button className="btn" type="submit" disabled={state === "sending"} data-magnetic>
          {state === "sending" ? "Sending…" : "Get my quote + free demo"}
        </button>
        <p className={styles.fine}>No obligation. I reply within 24 hours. <a className="u" href="/privacy">Privacy</a></p>
      </div>
    </form>
  );
}
