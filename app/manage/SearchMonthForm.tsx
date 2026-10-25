"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import s from "./manage.module.css";

/**
 * One month of Search Console, typed in by hand: total impressions and
 * clicks from the Performance report, and a note (the top queries). Saving
 * the same month again replaces it.
 */
export default function SearchMonthForm({ defaultMonth }: { defaultMonth: string }) {
  const router = useRouter();
  const [state, setState] = useState<"" | "saving" | "saved" | "error">("");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    setState("saving");
    setError("");
    try {
      const res = await fetch("/api/manage/search", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error || "Couldn't save.");
      setState("saved");
      router.refresh();
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Couldn't save.");
    }
  }

  return (
    <form className={s.log} onSubmit={onSubmit}>
      <label>Month<input name="month" type="month" defaultValue={defaultMonth} required /></label>
      <label>Impressions<input name="impressions" type="number" inputMode="numeric" min={0} step={1} defaultValue={0} required /></label>
      <label>Clicks<input name="clicks" type="number" inputMode="numeric" min={0} step={1} defaultValue={0} required /></label>
      <label className={s.logNotes}>Top queries (optional)<input name="note" maxLength={500} autoComplete="off" placeholder="web design league city, self storage website…" /></label>
      <div className={s.saveRow}>
        <button type="submit" className={s.save} disabled={state === "saving"}>{state === "saving" ? "Saving…" : "Save month"}</button>
        <span role="status" className={s.savedMsg}>{state === "saved" ? "Saved" : state === "error" ? error : ""}</span>
      </div>
    </form>
  );
}
