"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type FormEvent } from "react";

import { site } from "../data/site";
import { currentRef } from "../lib/ref";
import { track } from "../lib/track";
import { SOURCE_KEYS, sourceQuery, useSourceFields } from "../lib/useSourceFields";
import { gsap, prefersReducedMotion } from "../motion/gsap";
import {
  ESTIMATE_DEFAULTS, EXAMPLE, EXPECT, FOOTNOTE, HOW_CALCULATED, OPTIONS, QUESTIONS, TIMELINE, WEBSITE_PRICE,
  estimate, result, summary, type AnswerValue, type ZoneKey,
} from "./data";
import s from "./checkup.module.css";

const n0 = (x: number) => Math.round(x).toLocaleString("en-US");
const money = (x: number) => `$${n0(x)}`;
const one = (x: number) => (Math.round(x * 10) / 10).toLocaleString("en-US");
const range = (a: number, b: number, f: (x: number) => string) => (Math.round(a) === Math.round(b) ? f(a) : `${f(a)}–${f(b)}`);
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isPhone = (v: string) => v.replace(/\D/g, "").length >= 7;
const STORE = "checkup-est";

/* ---------- the wireframe phone ---------- */

function Zone({ z, label, state, pin, warnPin, className, children }: { z: ZoneKey; label: string; state: string; pin?: number; warnPin?: boolean; className: string; children?: React.ReactNode }) {
  return (
    <div className={`${s.zone} ${className}`} data-z={z} data-state={state || undefined}>
      {children}
      <span className={s.tip}>{label}</span>
      {pin ? <span className={`${s.pin} ${warnPin ? s.pinWarn : ""}`}>{pin}</span> : null}
    </div>
  );
}

function Phone({ answers, idx, done, rank }: { answers: (AnswerValue | undefined)[]; idx: number; done: boolean; rank: Record<number, number> }) {
  const at = (z: ZoneKey) => {
    const i = QUESTIONS.findIndex((q) => q.z === z);
    const a = answers[i];
    const state = !done && i === idx ? "active" : a ? (a === "yes" ? "pass" : a === "kind" ? "part" : "leak") : "";
    return { label: QUESTIONS[i].zone, state, pin: done ? rank[i] : undefined, warnPin: a === "kind" };
  };
  return (
    <div className={s.rig} aria-hidden="true">
      <div className={s.phone}>
        <div className={s.screen}>
          <Zone z="speed" className={s.zSpeed} {...at("speed")}><div className={s.load} /></Zone>
          <div className={s.notch} />
          <div className={s.navrow}><div className={s.logo} /><div className={s.burger}><i /><i /><i /></div></div>
          <Zone z="clarity" className={s.zClarity} {...at("clarity")}><div className={s.h1bar} /><div className={`${s.h1bar} ${s.h1short}`} /></Zone>
          <Zone z="words" className={s.zWords} {...at("words")}><div className={s.wbar} /><div className={s.wbar} /><div className={s.wbar} /></Zone>
          <Zone z="price" className={s.zPrice} {...at("price")}><span className={s.chip}>From $___</span></Zone>
          <Zone z="action" className={s.zAction} {...at("action")}><div className={s.btnW}><span /></div></Zone>
          <Zone z="questions" className={s.zQuestions} {...at("questions")}>
            {[0, 1, 2].map((k) => <div key={k} className={s.qrow}><div className={s.wbar} /><b>+</b></div>)}
          </Zone>
          <Zone z="reviews" className={s.zReviews} {...at("reviews")}><div className={s.stars}>★★★★★</div><div className={s.wbar} /><div className={s.wbar} /></Zone>
          <Zone z="form" className={s.zForm} {...at("form")}><div className={s.field} /><div className={s.field} /><div className={s.send} /></Zone>
          <Zone z="call" className={s.zCall} {...at("call")}><span>CALL</span><span>TEXT</span></Zone>
        </div>
        <Zone z="google" className={s.zGoogle} {...at("google")}>
          <div className={s.gh}><i className={s.gpin} />Google listing</div><div className={s.wbar} /><div className={s.wbar} />
        </Zone>
      </div>
    </div>
  );
}

/* ---------- the lead form on the report ---------- */

function LeadForm({ summaryText, refCode }: { summaryText: string; refCode: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const done = useRef<HTMLParagraphElement>(null);
  useSourceFields("checkup-lead");
  useEffect(() => { if (state === "sent") done.current?.focus(); }, [state]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    const contact = (data.contact || "").trim();
    if ((data.current_site || "").trim().length < 3) { setState("error"); setError("Please add your website's address."); form.querySelector<HTMLInputElement>("#cl-site")?.focus(); return; }
    if (!isEmail(contact) && !isPhone(contact)) { setState("error"); setError("Please add a phone number or an email, so I can reply."); form.querySelector<HTMLInputElement>("#cl-contact")?.focus(); return; }
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/website-quote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; referred?: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error || "That didn't go through.");
      setState("sent");
      track("checkup_lead", { contact: isEmail(contact) ? "email" : "phone" });
      if (json.referred && refCode) track("ref_lead", { code: refCode });
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "That didn't go through.");
    }
  }

  if (state === "sent") {
    return <p ref={done} className={s.leadSent} role="status" tabIndex={-1}>Got it. I&rsquo;ll look at your site myself and text or email you your top three fixes within 24 hours.</p>;
  }

  return (
    <form className={s.lead} id="checkup-lead" onSubmit={onSubmit} method="post" action="/api/website-quote" noValidate>
      <p className={s.leadTitle}>Or send it here and I&rsquo;ll reply with your top three fixes</p>
      <div className={s.leadRow}>
        <label htmlFor="cl-site">Your website<input id="cl-site" name="current_site" inputMode="url" autoComplete="url" maxLength={200} placeholder="yourbusiness.com" required /></label>
        <label htmlFor="cl-contact">Phone or email<input id="cl-contact" name="contact" autoComplete="on" inputMode="email" maxLength={180} required /></label>
      </div>
      <input type="hidden" name="source" value="checkup" />
      <input type="hidden" name="checkup" value={summaryText} />
      <input type="hidden" name="ref" value={refCode} />
      {SOURCE_KEYS.map((k) => <input key={k} type="hidden" name={k} defaultValue="" />)}
      <input type="hidden" name="referrer" defaultValue="" />
      <div className={s.honeypot} aria-hidden="true" inert>
        <label htmlFor="cl-website">Leave this empty</label>
        <input id="cl-website" name="website" type="text" tabIndex={-1} autoComplete="off" data-1p-ignore="" data-lpignore="true" data-bwignore="true" data-form-type="other" />
      </div>
      {state === "error" ? <p className={s.leadError} role="alert">{error}</p> : null}
      <div className={s.leadSubmit}>
        <button className={`btn ${s.onInkBtn}`} type="submit" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Check my site for me"}</button>
        <span>Free. I reply within 24 hours. <a className="u" href="/privacy">Privacy</a></span>
      </div>
    </form>
  );
}

/* ---------- the whole tool ---------- */

/**
 * The checkup: an inspection bench. Left, a wireframe phone whose parts
 * light up as each question inspects them (and carry numbered pins on the
 * report). Right, one question at a time, then the report: the score, the
 * leaks ranked by points lost with a fix for each, what's already working,
 * the estimate, what to expect, and the ways to reach Kyle. Nothing is
 * gated: the report shows before any ask. Keys Y, K, N and ? answer.
 * "Download my report (PDF)" prints the report with its own stylesheet.
 */
export default function Checkup() {
  const [answers, setAnswers] = useState<(AnswerValue | undefined)[]>([]);
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(false);
  const [example, setExample] = useState(false);
  const [inputs, setInputs] = useState({ vis: String(ESTIMATE_DEFAULTS.vis), close: String(ESTIMATE_DEFAULTS.close), val: String(ESTIMATE_DEFAULTS.val) });
  const [copyMsg, setCopyMsg] = useState("");
  const [copyText, setCopyText] = useState("");
  const started = useRef(false);
  const bench = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const scoreRef = useRef<HTMLHeadingElement>(null);
  const howRef = useRef<HTMLDetailsElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const [today, setToday] = useState("");
  // A referral partner's code from a shared link, and their first name if the code is real.
  const [refCode, setRefCode] = useState("");
  const [sharer, setSharer] = useState("");
  // The visit's utm tags (a business-card scan, outreach), for the quote link.
  const [srcQuery, setSrcQuery] = useState("");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read once from this browser after hydration
    setSrcQuery(sourceQuery());
    const code = currentRef();
    if (!code) return;
    setRefCode(code);
    let live = true;
    fetch(`/api/ref?code=${encodeURIComponent(code)}`)
      .then((r) => r.json() as Promise<{ valid?: boolean; firstName?: string }>)
      .then((j) => { if (live && j.valid && j.firstName) setSharer(j.firstName); })
      .catch(() => {});
    return () => { live = false; };
  }, []);

  // The estimate's three numbers are remembered on this device.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE) || "null") as Partial<typeof ESTIMATE_DEFAULTS> | null;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reading this device's saved numbers once, after hydration
      if (saved) setInputs((p) => ({ vis: saved.vis != null ? String(saved.vis) : p.vis, close: saved.close != null ? String(saved.close) : p.close, val: saved.val != null ? String(saved.val) : p.val }));
    } catch { /* no storage: the defaults stand */ }
    setToday(new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }));
  }, []);

  const est = useMemo(() => {
    const num = (v: string) => Math.max(0, parseFloat(v) || 0);
    return { vis: num(inputs.vis), close: Math.min(100, num(inputs.close)), val: num(inputs.val) };
  }, [inputs]);
  useEffect(() => { try { localStorage.setItem(STORE, JSON.stringify(est)); } catch { /* fine */ } }, [est]);

  // The print stylesheet only applies on this page.
  useEffect(() => {
    document.body.dataset.checkup = "1";
    const open = () => { if (howRef.current) { howRef.current.dataset.wasOpen = howRef.current.open ? "1" : ""; howRef.current.open = true; } };
    const close = () => { if (howRef.current && !howRef.current.dataset.wasOpen) howRef.current.open = false; };
    window.addEventListener("beforeprint", open);
    window.addEventListener("afterprint", close);
    return () => { delete document.body.dataset.checkup; window.removeEventListener("beforeprint", open); window.removeEventListener("afterprint", close); };
  }, []);

  const complete = answers.length === QUESTIONS.length && answers.every(Boolean);
  const r = useMemo(() => (done && complete ? result(answers as AnswerValue[]) : null), [done, complete, answers]);
  const summaryText = r ? summary(r.score, r.band.name, r.leaks) : "";
  const copyBody = r ? `My Website Checkup score: ${r.score}/100 (${r.band.name})\n${r.leaks.length ? `Top fixes:\n${r.leaks.slice(0, 3).map((x, n) => `${n + 1}. ${x.q.leak}`).join("\n")}\n` : ""}My website: ` : "";
  const e = r ? estimate(r.score, est.vis, est.close, est.val) : null;

  const pick = useCallback((v: AnswerValue) => {
    if (done) return;
    if (!started.current) { started.current = true; track("checkup_start"); }
    setAnswers((prev) => { const next = [...prev]; next[idx] = v; return next; });
    if (idx < QUESTIONS.length - 1) setIdx(idx + 1);
    else setDone(true);
  }, [done, idx]);

  // When the report appears: count it as complete, then take focus to the score.
  const reported = useRef("");
  useEffect(() => {
    if (!r) return;
    const key = `${r.score}-${example}`;
    if (reported.current !== key && !example) track("checkup_complete", { score: String(r.score), band: r.band.name });
    reported.current = key;
  }, [r, example]);

  // Keyboard: Y, K, N, ? (or /) answer while a question is showing.
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (done || ev.metaKey || ev.ctrlKey || ev.altKey) return;
      const t = ev.target as HTMLElement | null;
      if (t && (t.closest("input, textarea, select") || t.isContentEditable)) return;
      const m = ({ y: "yes", k: "kind", n: "no", "?": "unsure", "/": "unsure" } as Record<string, AnswerValue>)[ev.key.toLowerCase()];
      if (m) { ev.preventDefault(); pick(m); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [done, pick]);

  // Motion: each new question, and the report, settle in; the score counts up. Off under reduced motion.
  const first = useRef(true);
  useLayoutEffect(() => {
    const el = panel.current;
    if (!el) return;
    if (first.current) { first.current = false; return; }
    if (done) {
      scoreRef.current?.focus({ preventScroll: true });
      const top = bench.current?.getBoundingClientRect().top ?? 0;
      if (top < 0 || top > window.innerHeight * 0.6) bench.current?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
    } else {
      el.querySelector<HTMLButtonElement>("button[data-v]")?.focus({ preventScroll: true });
    }
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el.querySelectorAll("[data-in]"), { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.42, ease: "power2.out", stagger: 0.05, clearProps: "transform,opacity,visibility" });
      if (done && r && numRef.current) {
        const node = numRef.current, state = { n: 0 };
        gsap.to(state, { n: r.score, duration: 1.1, ease: "power3.out", onUpdate: () => { node.textContent = String(Math.round(state.n)); } });
      }
    }, el);
    return () => ctx.revert();
    // Only when the question or the view changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, done, example]);

  const showExample = () => {
    setAnswers([...EXAMPLE]);
    setIdx(QUESTIONS.length - 1);
    setExample(true);
    setDone(true);
    track("checkup_example");
  };
  const edit = () => { setDone(false); setExample(false); setIdx(0); };
  const restart = () => {
    setAnswers([]); setDone(false); setExample(false); setIdx(0); started.current = false;
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };
  const copy = async () => {
    track("checkup_copy");
    const fallback = () => { setCopyText(copyBody); setCopyMsg(`Copy the text below and text it to ${site.phone} with your website.`); };
    try { await navigator.clipboard.writeText(copyBody); setCopyText(""); setCopyMsg(`Copied. Paste it into a text to ${site.phone} and add your website.`); } catch { fallback(); }
  };
  const print = () => { track("checkup_print"); window.print(); };

  const q = QUESTIONS[idx];
  const tickClass = (i: number) => (!done && i === idx ? s.now : answers[i] ? s[answers[i] as string] : "");
  const smsHref = r ? `${site.smsHref}?&body=${encodeURIComponent(copyBody)}` : site.smsHref;

  return (
    <div className={s.root}>
      <p className={s.printHead}><b>Website Checkup Report</b><span>{today}</span></p>

      <header className={s.intro}>
        <p className={s.eyebrow}>Free website checkup · 10 questions · about 2 minutes</p>
        {sharer ? <p className={s.sharer}>Shared with you by {sharer}.</p> : null}
        <h1 className={s.h1}>Is your website turning visitors into customers?</h1>
        <p className={s.lede}>
          Pull up your site on your phone and answer honestly. Watch each part of the page get checked, then get your score, your biggest leaks, and a fix for each one.
        </p>
        <p className={s.free}>
          <span>Free. No email needed. Your report shows right here.</span>
          <button className={s.link} type="button" onClick={showExample}>See an example report<span aria-hidden="true"> →</span></button>
        </p>
      </header>

      <div className={s.bench} ref={bench} id="bench">
        <Phone answers={answers} idx={idx} done={done} rank={r?.rank ?? {}} />

        <div className={s.panel} ref={panel}>
          {!r ? (
            <>
              <div className={s.ticks} aria-hidden="true">{QUESTIONS.map((_q, i) => <i key={i} className={tickClass(i)} />)}</div>
              <div aria-live="polite" className={s.live}>
                <p className={s.count}><span><b>{idx + 1}</b> of {QUESTIONS.length}</span><span>Checking: {q.zone}</span></p>
                <h2 className={s.q} id="qtext" data-in>{q.q}</h2>
                {q.help ? <p className={s.help} data-in>{q.help}</p> : null}
              </div>
              <div className={s.answers} role="group" aria-labelledby="qtext">
                {OPTIONS.map((o) => (
                  <button key={o.v} className={s.ans} type="button" data-v={o.v} aria-pressed={answers[idx] === o.v} onClick={() => pick(o.v)} data-in>
                    <span className={s.key} aria-hidden="true">{o.k}</span>
                    <span className={s.t}><b>{o.t}</b><small>{o.s}</small></span>
                  </button>
                ))}
              </div>
              <div className={s.row}>
                <button className={s.btn} type="button" onClick={() => idx > 0 && setIdx(idx - 1)} disabled={idx === 0}>Back</button>
                <span className={s.note}>Tip: press Y, K, N or ? on a keyboard.</span>
              </div>
            </>
          ) : (
            <>
              <div className={s.scorehead} data-tone={r.band.tone} data-in>
                {example ? <span className={s.example}>Example answers, not your site</span> : null}
                <h2 className={s.big} ref={scoreRef} tabIndex={-1} aria-label={`Your score: ${r.score} out of 100. ${r.band.name}.`}>
                  <span className={s.num} ref={numRef} aria-hidden="true">{r.score}</span>
                  <span className={s.of} aria-hidden="true">out of 100</span>
                  <span className={s.pill} aria-hidden="true">{r.band.name}</span>
                </h2>
                <p>{r.band.message}</p>
              </div>

              {r.leaks.length ? (
                <section className={s.block} aria-labelledby="leaks-title" data-in>
                  <h3 className={s.sub} id="leaks-title">Your leaks, biggest first · numbered on the phone</h3>
                  <ol className={s.leaks}>
                    {r.leaks.map((x, n) => (
                      <li key={x.i} className={s.leak}>
                        <span className={`${s.n} ${x.a === "kind" ? s.nWarn : ""}`} aria-hidden="true">{n + 1}</span>
                        <h4>{x.q.leak}{x.a === "unsure" ? <span className={s.unsure}> (you weren&rsquo;t sure)</span> : null}</h4>
                        <p>{x.q.why}</p>
                        <p><strong>Fix:</strong> {x.q.fix}</p>
                      </li>
                    ))}
                  </ol>
                </section>
              ) : <p data-in>No leaks found. Nice work.</p>}

              {r.wins.length ? (
                <section className={s.block} aria-labelledby="wins-title" data-in>
                  <h3 className={s.sub} id="wins-title">Already working</h3>
                  <ul className={s.working}>{r.wins.map((w) => <li key={w.z}><span aria-hidden="true">✓ </span>{w.ok}</li>)}</ul>
                </section>
              ) : null}

              {e ? (
                <section className={s.est} aria-labelledby="est-title" data-in>
                  <h3 id="est-title" className={s.h3}>What fixing these could mean for you</h3>
                  <p className={s.estIntro}>A rough estimate from your score and public benchmarks. Change the three numbers to match your business. It&rsquo;s a planning tool, not a promise.</p>
                  <div className={s.inputs}>
                    <label htmlFor="vis">Website visits a month<span className={s.in}><input id="vis" type="number" inputMode="numeric" min={0} step={10} value={inputs.vis} onChange={(ev) => setInputs({ ...inputs, vis: ev.target.value })} /></span></label>
                    <label htmlFor="close">Inquiries that become customers<span className={s.in}><input id="close" type="number" inputMode="numeric" min={0} max={100} step={5} value={inputs.close} onChange={(ev) => setInputs({ ...inputs, close: ev.target.value })} /><span>%</span></span></label>
                    <label htmlFor="val">Average customer is worth<span className={s.in}><span>$</span><input id="val" type="number" inputMode="numeric" min={0} step={25} value={inputs.val} onChange={(ev) => setInputs({ ...inputs, val: ev.target.value })} /></span></label>
                  </div>
                  <p className={s.printOnly}>Your numbers: {n0(est.vis)} visits a month · {n0(est.close)}% of inquiries become customers · {money(est.val)} per customer.</p>
                  <div className={s.bars}>
                    <div className={s.brow}>
                      <span className={s.lab}>Now</span>
                      <div className={s.track} role="img" aria-label={`About ${n0(e.now)} inquiries a month now`}>
                        <div className={`${s.fill} ${s.fillNow}`} style={{ width: `${(e.now / Math.max(e.hi, 1)) * 100}%` }} />
                        <b>~{n0(e.now)} inquiries / month</b>
                      </div>
                    </div>
                    <div className={s.brow}>
                      <span className={s.lab}>After fixes</span>
                      <div className={s.track} role="img" aria-label={`About ${n0(e.lo)} to ${n0(e.hi)} inquiries a month after fixes`}>
                        <div className={`${s.fill} ${s.fillHi}`} style={{ width: `${(e.hi / Math.max(e.hi, 1)) * 100}%` }} />
                        <div className={`${s.fill} ${s.fillLo}`} style={{ width: `${(e.lo / Math.max(e.hi, 1)) * 100}%` }} />
                        <b>~{n0(e.lo)}–{n0(e.hi)} inquiries / month</b>
                      </div>
                    </div>
                  </div>
                  <div className={s.outs}>
                    <div className={s.out}><small>Extra inquiries</small><b>{range(e.extraLo, e.extraHi, n0)}</b><span>a month</span></div>
                    <div className={s.out}><small>Extra customers</small><b>{range(e.custLo, e.custHi, one)}</b><span>a month</span></div>
                    <div className={s.out}><small>Extra revenue</small><b>{range(e.revLo, e.revHi, money)}</b><span>a month · {range(e.revLo * 12, e.revHi * 12, money)} a year</span></div>
                  </div>
                  <p className={s.payback}>
                    {e.payback
                      ? <>At the low end of this estimate, a {money(WEBSITE_PRICE)} website would pay for itself in about <b>{e.payback} month{e.payback === 1 ? "" : "s"}</b>.</>
                      : r.score >= 85 ? "Your site is already strong, so a rebuild may not pay off. Small fixes or Website Care might be the better fit." : "Add your numbers above to see an estimate."}
                  </p>
                  <details className={s.how} ref={howRef}>
                    <summary>How this is calculated</summary>
                    <ul>{HOW_CALCULATED.map((h) => <li key={h}>{h}</li>)}</ul>
                  </details>
                </section>
              ) : null}

              <section className={s.expect} aria-labelledby="exp-title" data-in>
                <h3 id="exp-title" className={s.h3}>What to expect if we fix it together</h3>
                <div className={s.cols}>
                  <div className={`${s.col} ${s.promise}`}><h4>What I promise</h4><ul>{EXPECT.promise.map((x) => <li key={x}>{x}</li>)}</ul></div>
                  <div className={`${s.col} ${s.see}`}><h4>What you should see</h4><ul>{EXPECT.see.map((x) => <li key={x}>{x}</li>)}</ul></div>
                  <div className={`${s.col} ${s.cant}`}><h4>What nobody can promise</h4><ul>{EXPECT.cant.map((x) => <li key={x}>{x}</li>)}</ul></div>
                </div>
                <ol className={s.timeline}>{TIMELINE.map((t) => <li key={t.when}><b>{t.when}</b><span>{t.what}</span></li>)}</ol>
              </section>

              <section className={s.cta} id="check-for-me" aria-labelledby="cta-title" data-in>
                <h3 id="cta-title" className={s.ctaTitle}>Want me to check it for you?</h3>
                <p>Text me your website and this score. I&rsquo;ll look at it myself and send back your top three fixes, free. If a new site makes sense, every quote comes with a free demo of your homepage.</p>
                <p className={s.phoneNo}>{site.phone}</p>
                <div className={s.ctaRow}>
                  <a className="btn" href={smsHref} onClick={() => track("checkup_cta_text", { score: String(r.score) })}>Text me your score</a>
                  <a className={`btn btn-secondary ${s.onInkBtn}`} href={`/?checkup=${encodeURIComponent(summaryText)}${refCode ? `&ref=${encodeURIComponent(refCode)}` : ""}${srcQuery ? `&${srcQuery}` : ""}#quote`} onClick={() => track("checkup_cta_quote", { score: String(r.score) })}>Get a quote + free demo</a>
                </div>
                <div className={s.ctaRow}>
                  <button className={s.ghost} type="button" onClick={copy}>Copy my report</button>
                  <button className={s.ghost} type="button" onClick={print}>Download my report (PDF)</button>
                </div>
                {copyMsg ? <p className={s.msg} role="status">{copyMsg}</p> : null}
                {copyText ? <textarea className={s.copybox} readOnly value={copyText} aria-label="Your report to copy" onFocus={(ev) => ev.currentTarget.select()} autoFocus /> : null}
                <LeadForm summaryText={summaryText} refCode={refCode} />
              </section>

              <div className={s.row}>
                <button className={s.btn} type="button" onClick={edit}>Change my answers</button>
                <button className={s.btn} type="button" onClick={restart}>Start over</button>
              </div>
            </>
          )}
        </div>
      </div>

      <p className={s.footnote}>{FOOTNOTE} Made by {site.person}, {site.name}.</p>
      <p className={s.printFoot}>Prepared by {site.person} · {site.name} · {site.phone} · stringhamwebdesign.com</p>
    </div>
  );
}
