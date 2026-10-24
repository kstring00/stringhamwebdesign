"use client";

import { useState } from "react";

import s from "./manage.module.css";

type Result = { ok?: boolean; reason?: string; text?: string; usage?: { input: number; output: number }; model?: string; cached?: boolean; error?: string };

/**
 * The "Explain my leads" button: one request, on a click, never on load.
 * Shows the model's reading, what it cost in tokens, and whether it was
 * served from the cache (the same numbers are never sent twice a day).
 */
export default function ExplainLeads({ configured }: { configured: boolean }) {
  const [state, setState] = useState<"" | "loading" | "done" | "error">("");
  const [result, setResult] = useState<Result>({});

  async function explain() {
    setState("loading");
    try {
      const res = await fetch("/api/manage/explain", { method: "POST" });
      const json = (await res.json().catch(() => ({}))) as Result;
      if (!res.ok || json.error) throw new Error(json.error || "Couldn't get an explanation.");
      setResult(json);
      setState("done");
    } catch (e) {
      setResult({ error: e instanceof Error ? e.message : "Couldn't get an explanation." });
      setState("error");
    }
  }

  if (!configured) {
    return <p className={s.panelHow}>To turn this on, add <code>ANTHROPIC_API_KEY</code> in Vercel (Production) and redeploy. The numbers above are the full picture either way; this only adds a plain-English reading of them.</p>;
  }

  return (
    <div className={s.explain}>
      <div className={s.saveRow} style={{ justifyContent: "start" }}>
        <button type="button" className={s.save} onClick={explain} disabled={state === "loading"}>{state === "loading" ? "Reading the numbers…" : state === "done" ? "Explain again" : "Explain my leads"}</button>
        <span className={s.savedMsg}>Sends only the counts above (no names, contacts or notes). One short request; the same numbers aren&rsquo;t sent twice in a day.</span>
      </div>
      {state === "error" ? <p className={s.err} role="alert">{result.error}</p> : null}
      {state === "done" && result.ok === false && result.reason === "no_key" ? <p className={s.panelHow}>No API key is set on the server, so there&rsquo;s no reading; the numbers above stand on their own.</p> : null}
      {state === "done" && result.text ? (
        <div className={s.explainOut}>
          <p className={s.explainText}>{result.text}</p>
          <p className={s.explainMeta}>{result.model} · {result.usage ? `${result.usage.input.toLocaleString("en-US")} in / ${result.usage.output.toLocaleString("en-US")} out tokens` : ""}{result.cached ? " · from the cache (same numbers as before)" : ""}. A reading of the counts, not a measurement; the counts are the facts.</p>
        </div>
      ) : null}
    </div>
  );
}
