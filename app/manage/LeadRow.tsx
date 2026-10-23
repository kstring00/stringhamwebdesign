"use client";

import { useState } from "react";

import s from "./manage.module.css";

type Status = "new" | "quoted" | "hired" | "paid" | "partner_paid";
const STATUSES: { v: Status; label: string }[] = [
  { v: "new", label: "New" },
  { v: "quoted", label: "Quoted" },
  { v: "hired", label: "Hired" },
  { v: "paid", label: "Client paid" },
  { v: "partner_paid", label: "Partner paid" },
];
const money = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;

export type LeadView = { id: string; created_at: string; kind: "quote" | "checkup"; business: string | null; contact_name: string | null; contact: string | null; website: string | null; checkup: string | null; utm_source?: string | null; status: Status; build_price: number | null; notes: string | null };

/**
 * One referral lead in the admin: who it is, and the three things Kyle
 * updates by hand (status, build price, notes). The partner's 20% shows
 * once the status is "Client paid" or "Partner paid".
 */
export default function LeadRow({ lead, rate }: { lead: LeadView; rate: number }) {
  const [status, setStatus] = useState<Status>(lead.status);
  const [price, setPrice] = useState(lead.build_price != null ? String(lead.build_price) : "");
  const [notes, setNotes] = useState(lead.notes ?? "");
  const [saved, setSaved] = useState<"" | "saving" | "saved" | "error">("");
  const [error, setError] = useState("");

  const p = parseFloat(price);
  const paid = status === "paid" || status === "partner_paid";
  const cut = paid && p > 0 ? Math.round(p * rate * 100) / 100 : 0;

  async function save() {
    setSaved("saving");
    setError("");
    try {
      const res = await fetch("/api/manage/lead", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: lead.id, status, build_price: price, notes }) });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error || "Couldn't save.");
      setSaved("saved");
    } catch (e) {
      setSaved("error");
      setError(e instanceof Error ? e.message : "Couldn't save.");
    }
  }

  const when = new Date(lead.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return (
    <li className={s.lead} data-status={status}>
      <div className={s.leadWho}>
        <p className={s.leadName}>{lead.business || lead.website || lead.contact || "Lead"}{lead.contact_name ? <span> · {lead.contact_name}</span> : null}</p>
        <p className={s.leadMeta}>
          <span className={s.kind}>{lead.kind === "checkup" ? "Checkup review" : "Quote request"}</span>
          <time dateTime={lead.created_at}>{when}</time>
          <span className={s.utm}>Source: {lead.utm_source || "direct"}</span>
          {lead.contact ? <span>{lead.contact}</span> : null}
          {lead.website ? <span>{lead.website}</span> : null}
        </p>
        {lead.checkup ? <p className={s.leadCheckup}>{lead.checkup}</p> : null}
      </div>
      <div className={s.leadEdit}>
        <label>Status
          <select value={status} onChange={(e) => { setStatus(e.target.value as Status); setSaved(""); }}>
            {STATUSES.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}
          </select>
        </label>
        <label>Build price
          <span className={s.money}><span>$</span><input type="number" inputMode="decimal" min={0} step={50} value={price} placeholder="1500" onChange={(e) => { setPrice(e.target.value); setSaved(""); }} /></span>
        </label>
        <label className={s.notes}>Notes
          <input value={notes} maxLength={1000} onChange={(e) => { setNotes(e.target.value); setSaved(""); }} />
        </label>
        <div className={s.owed}>
          {paid
            ? cut ? <><b>{money(cut)}</b><span>{status === "partner_paid" ? "paid to partner" : "owed to partner"}</span></> : <span>Add the build price to see the {Math.round(rate * 100)}%</span>
            : <span>{Math.round(rate * 100)}% shows once the client has paid</span>}
        </div>
        <div className={s.saveRow}>
          <button type="button" className={s.save} onClick={save} disabled={saved === "saving"}>{saved === "saving" ? "Saving…" : "Save"}</button>
          <span role="status" className={s.savedMsg}>{saved === "saved" ? "Saved" : saved === "error" ? error : ""}</span>
        </div>
      </div>
    </li>
  );
}
