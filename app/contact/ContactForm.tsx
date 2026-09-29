"use client";

import { useState, type FormEvent } from "react";

import { site } from "../data/site";
import styles from "./contact.module.css";

export const STAGES = ["Just an idea", "Ready to launch", "Already running"] as const;
export const NEEDS = ["Website", "Online ordering or booking", "Payments", "Getting found on Google", "Email or text list", "Family Resource Hub for a clinic", "Not sure yet"] as const;
/** The option that gets the "no client or patient information" note. */
const CLINICAL = "Family Resource Hub for a clinic";
type Need = (typeof NEEDS)[number];

/** Messages for a native (no-JS) post that bounced back with ?error=… */
const NATIVE_ERRORS: Record<string, string> = {
  fields: "Please fill in every field.",
  busy: "Too many messages in a row. Please wait a few minutes.",
  send: "I couldn't send that just now.",
};

export default function ContactForm({ initialNeeds = [], sent = false, errorCode = "" }: { initialNeeds?: Need[]; sent?: boolean; errorCode?: string }) {
  const [needs, setNeeds] = useState<Need[]>(initialNeeds);
  const nativeError = NATIVE_ERRORS[errorCode] ?? (errorCode ? "That didn't go through." : "");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(sent ? "sent" : nativeError ? "error" : "idle");
  const [error, setError] = useState(nativeError);

  const toggle = (n: Need, on: boolean) => setNeeds((cur) => (on ? [...cur.filter((x) => x !== n), n] : cur.filter((x) => x !== n)));

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const data = { ...Object.fromEntries(fd.entries()), needs: fd.getAll("needs") };
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
        <p>I&rsquo;ll reply within one business day with a link to book the call. If you&rsquo;d rather not wait, <a className="u" href={site.phoneHref}>call {site.phone}</a>.</p>
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

      <fieldset className={styles.fieldset}>
        <legend>Where are you at?</legend>
        <div className={styles.chips}>
          {STAGES.map((s) => (
            <label className={styles.chip} key={s}>
              <input type="radio" name="stage" value={s} required />
              <span>{s}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend>What do you need? <small>Pick any</small></legend>
        <div className={styles.chips}>
          {NEEDS.map((n) => (
            <label className={styles.chip} key={n}>
              <input type="checkbox" name="needs" value={n} checked={needs.includes(n)} onChange={(e) => toggle(n, e.target.checked)} />
              <span>{n}</span>
            </label>
          ))}
        </div>
      </fieldset>
      {needs.includes(CLINICAL) ? (
        <p className={styles.note} role="note">Please don&rsquo;t include any client or patient information.</p>
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
        <button className="btn" type="submit" disabled={state === "sending"} data-cursor="grow">
          {state === "sending" ? "Sending…" : "Send it"}
        </button>
      </div>
      <p className={styles.fine}>By sending this you agree to the <a className="u" href="/privacy">privacy policy</a>.</p>
    </form>
  );
}
