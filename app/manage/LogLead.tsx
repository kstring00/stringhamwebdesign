"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import s from "./manage.module.css";

/**
 * "Log a call or text": a lead that came in by phone, written down by hand
 * so it counts like a form. A tap on the phone number is never a lead; a
 * conversation is.
 */
export default function LogLead() {
  const router = useRouter();
  const [state, setState] = useState<"" | "saving" | "saved" | "error">("");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setState("saving");
    setError("");
    try {
      const res = await fetch("/api/manage/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error || "Couldn't save.");
      form.reset();
      setState("saved");
      router.refresh();
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Couldn't save.");
    }
  }

  return (
    <form className={s.log} onSubmit={onSubmit}>
      <label>Kind
        <select name="kind" defaultValue="call">
          <option value="call">Call</option>
          <option value="text">Text</option>
        </select>
      </label>
      <label>Business<input name="business" maxLength={120} autoComplete="off" /></label>
      <label>Name<input name="contact_name" maxLength={100} autoComplete="off" /></label>
      <label>Phone or email<input name="contact" maxLength={180} autoComplete="off" /></label>
      <label>How they heard<input name="heard" maxLength={160} autoComplete="off" placeholder="Google, a friend, the card…" /></label>
      <label className={s.logNotes}>Notes<input name="notes" maxLength={1000} autoComplete="off" /></label>
      <div className={s.saveRow}>
        <button type="submit" className={s.save} disabled={state === "saving"}>{state === "saving" ? "Saving…" : "Log it"}</button>
        <span role="status" className={s.savedMsg}>{state === "saved" ? "Logged" : state === "error" ? error : ""}</span>
      </div>
    </form>
  );
}
