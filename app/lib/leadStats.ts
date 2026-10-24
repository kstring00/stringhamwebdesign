import { KIND_LABEL, STAGE, type Lead, type LeadKind, type SearchMonth } from "./referrals";

/**
 * The monthly numbers behind /manage, from the ledger alone. Pure: no
 * fetching, so it can be checked against a fixed list of leads.
 *
 * An inquiry counts when it's a real one: anything not marked "not a fit".
 * Consultations, quotes and clients are counted on the month the lead came
 * in (a cohort), so a lead from September that signed in October counts as
 * September's client. That keeps a month's conversion rate honest: it's
 * "of the people who asked that month, how many ended up where".
 */

/** "2026-10", in UTC. */
export const monthKey = (iso: string) => iso.slice(0, 7);

/** Where a lead's visit came from, in one plain label. */
export function sourceLabel(l: Pick<Lead, "partner_code" | "utm_source" | "utm_medium" | "referrer_host" | "kind">) {
  if (l.partner_code) return `Partner link (${l.partner_code})`;
  if (l.kind === "call" || l.kind === "text") return "Phone";
  if (l.utm_source) return l.utm_source === "card" ? "Business card" : `${l.utm_source}${l.utm_medium ? ` / ${l.utm_medium}` : ""}`;
  const h = l.referrer_host;
  if (!h) return "Direct / typed";
  if (/(^|\.)google\./.test(h) || /(^|\.)bing\.com$/.test(h) || /duckduckgo\.com$/.test(h) || /(^|\.)yahoo\./.test(h)) return "Search";
  if (/(facebook|instagram|fb)\.com$/.test(h) || /l\.instagram\.com$/.test(h)) return "Social";
  return h;
}

export type MonthRow = {
  month: string;
  inquiries: number;
  byKind: Partial<Record<LeadKind, number>>;
  bySource: Record<string, number>;
  consulted: number;
  quoted: number;
  signed: number;
  paid: number;
  notFit: number;
  search: { impressions: number; clicks: number; note: string | null } | null;
};

const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : null);

export function rates(r: Pick<MonthRow, "inquiries" | "consulted" | "quoted" | "signed">) {
  return { consult: pct(r.consulted, r.inquiries), quote: pct(r.quoted, r.inquiries), sign: pct(r.signed, r.inquiries), quoteToSign: pct(r.signed, r.quoted) };
}

/** The last `count` months ending this month, newest first, each from the leads that came in that month. */
export function monthRows(leads: Lead[], search: SearchMonth[], now = new Date(), count = 6): MonthRow[] {
  const keys: string[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    keys.push(d.toISOString().slice(0, 7));
  }
  const searchBy = new Map(search.map((s) => [monthKey(s.month), s]));
  return keys.map((month) => {
    const mine = leads.filter((l) => monthKey(l.created_at) === month);
    const real = mine.filter((l) => l.status !== "not_fit");
    const row: MonthRow = { month, inquiries: real.length, byKind: {}, bySource: {}, consulted: 0, quoted: 0, signed: 0, paid: 0, notFit: mine.length - real.length, search: null };
    for (const l of real) {
      row.byKind[l.kind] = (row.byKind[l.kind] ?? 0) + 1;
      const src = sourceLabel(l);
      row.bySource[src] = (row.bySource[src] ?? 0) + 1;
      const st = STAGE[l.status];
      if (st >= 1) row.consulted++;
      if (st >= 2) row.quoted++;
      if (st >= 3) row.signed++;
      if (st >= 4) row.paid++;
    }
    const s = searchBy.get(month);
    if (s) row.search = { impressions: s.impressions, clicks: s.clicks, note: s.note };
    return row;
  });
}

/** "Oct 2026" from "2026-10". */
export const monthLabel = (key: string) => new Date(`${key}-01T00:00:00Z`).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });

/** "3 quote requests, 1 Google check", for a month's kinds. */
export function kindSummary(byKind: MonthRow["byKind"]) {
  return (Object.entries(byKind) as [LeadKind, number][]).map(([k, n]) => `${n} ${KIND_LABEL[k].toLowerCase()}${n === 1 ? "" : "s"}`).join(", ");
}
