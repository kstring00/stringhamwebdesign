"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

import { site } from "../../data/site";
import { track } from "../../lib/track";
import s from "./join.module.css";

const DISCLOSURE = "Free website checkup from my web designer, Kyle. (I get a referral fee if you hire him.)";
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const host = site.url.replace(/^https?:\/\//, "").replace(/^www\./, "");

/** A link or message with a Copy button (and a select-all fallback). */
function CopyRow({ label, value, shown, multiline = false }: { label: string; value: string; shown?: string; multiline?: boolean }) {
  const [done, setDone] = useState(false);
  const ref = useRef<HTMLTextAreaElement & HTMLInputElement>(null);
  const copy = async () => {
    try { await navigator.clipboard.writeText(value); setDone(true); window.setTimeout(() => setDone(false), 2000); }
    catch { ref.current?.focus(); ref.current?.select(); }
  };
  return (
    <div className={s.copyRow}>
      <span className={s.copyLabel}>{label}</span>
      <div className={s.copyBox}>
        {multiline
          ? <textarea ref={ref} readOnly value={value} rows={4} aria-label={label} onFocus={(e) => e.currentTarget.select()} />
          : <input ref={ref} readOnly value={shown ?? value} aria-label={label} onFocus={(e) => e.currentTarget.select()} />}
        <button type="button" className={s.copyBtn} onClick={copy} aria-live="polite">{done ? "Copied" : "Copy"}</button>
      </div>
    </div>
  );
}

/**
 * The partner signup: name, email, phone, how you know business owners,
 * an optional code, and the terms checkbox. On success it swaps for the
 * partner's two links, each with a Copy button, and a ready-to-share
 * message with the referral-fee disclosure built in.
 */
export default function JoinForm() {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ code: string; firstName: string } | null>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (state === "done") doneRef.current?.focus(); }, [state]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const data = { name: String(fd.get("name") || ""), email: String(fd.get("email") || ""), phone: String(fd.get("phone") || ""), how: String(fd.get("how") || ""), code: String(fd.get("code") || ""), agree: fd.get("agree") === "on", website: String(fd.get("website") || "") };
    const fail = (msg: string, field: string) => { setState("error"); setError(msg); form.querySelector<HTMLInputElement>(`[name="${field}"]`)?.focus(); };
    if (data.name.trim().length < 2) return fail("Please add your name.", "name");
    if (!isEmail(data.email.trim())) return fail("Please add a working email, so I can reach you about payouts.", "email");
    if (!data.agree) return fail("Please read and agree to the partner terms.", "agree");
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/partner-join", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; code?: string; firstName?: string; error?: string; field?: string };
      if (!res.ok || !json.ok || !json.code) { fail(json.error || "That didn't go through.", json.field || "name"); return; }
      setResult({ code: json.code, firstName: json.firstName || "" });
      setState("done");
      track("partner_signup", { code: json.code });
    } catch {
      setState("error");
      setError(`That didn't go through. Try again, or text me at ${site.phone}.`);
    }
  }

  if (state === "done" && result) {
    const checkup = `${site.url}/checkup?ref=${result.code}`;
    const home = `${site.url}/?ref=${result.code}`;
    const message = `${DISCLOSURE} ${checkup}`;
    return (
      <div className={s.done}>
        <h2 ref={doneRef} tabIndex={-1} className={s.doneTitle}>You&rsquo;re in{result.firstName ? `, ${result.firstName}` : ""}. Your code is <b>{result.code}</b>.</h2>
        <p className={s.doneLede}>Share either link. When a business uses it to run the checkup or ask for a quote, I see that it came from you. Save these somewhere; I&rsquo;ve also got a copy.</p>
        <CopyRow label="Your checkup link (best to share)" value={checkup} shown={`${host}/checkup?ref=${result.code}`} />
        <CopyRow label="Your home page link" value={home} shown={`${host}/?ref=${result.code}`} />
        <CopyRow label="A message ready to share (the disclosure is built in)" value={message} multiline />
        <div className={s.doneActions}>
          <a className="btn" href={`sms:?&body=${encodeURIComponent(message)}`}>Text it to someone</a>
          <a className="u" href="/partners/terms">Re-read the partner terms</a>
        </div>
        <p className={s.fine}>Always say you earn a referral fee when you share, in your own words or with the message above.</p>
      </div>
    );
  }

  return (
    <form className={s.form} onSubmit={onSubmit} noValidate>
      <div className={s.row}>
        <label className={s.field}>Your name<input name="name" autoComplete="name" maxLength={100} required /></label>
        <label className={s.field}>Email<input name="email" type="email" autoComplete="email" maxLength={180} required /></label>
      </div>
      <div className={s.row}>
        <label className={s.field}>Phone <small>optional</small><input name="phone" type="tel" autoComplete="tel" maxLength={40} /></label>
        <label className={s.field}>Pick your code <small>optional</small><input name="code" maxLength={32} autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder="maria-cpa" aria-describedby="code-note" /><span className={s.note} id="code-note">Letters, numbers and hyphens. Leave it blank and I&rsquo;ll use your first name.</span></label>
      </div>
      <label className={s.field}>How do you know business owners? <small>optional</small><textarea name="how" rows={3} maxLength={500} placeholder="I'm an accountant · I run a chamber group · my family owns a shop…" /></label>
      <label className={s.agree}>
        <input type="checkbox" name="agree" required />
        <span>I&rsquo;ve read and agree to the <a className="u" href="/partners/terms" target="_blank" rel="noopener">partner terms<span className="sr-only"> (opens in a new tab)</span></a>, including saying I earn a referral fee whenever I share.</span>
      </label>
      <div className={s.honeypot} aria-hidden="true" inert>
        <label htmlFor="j-website">Leave this empty</label>
        <input id="j-website" name="website" type="text" tabIndex={-1} autoComplete="off" data-1p-ignore="" data-lpignore="true" data-bwignore="true" data-form-type="other" />
      </div>
      {state === "error" ? <p className={s.error} role="alert">{error}</p> : null}
      <div className={s.submit}>
        <button className="btn" type="submit" disabled={state === "sending"}>{state === "sending" ? "Creating your link…" : "Get my referral link"}</button>
        <p className={s.note}>Free. Your details stay with me. <a className="u" href="/privacy">Privacy</a></p>
      </div>
    </form>
  );
}
