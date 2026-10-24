import { CUSTOMER_KINDS, HEARD_LABEL, HEARD_OPTIONS, KIND_LABEL, STAGE, type HeardOption, type Lead, type LeadKind, type SearchMonth } from "./referrals";

/**
 * The numbers behind /manage, from the ledger alone. Pure: no fetching, so
 * every function here is checked by scripts/leads-check.js against fixed
 * lists of leads.
 *
 * Definitions:
 * - An inquiry is a prospective website customer (quote, checkup review,
 *   Google check, or a logged call or text) that isn't spam. Partner
 *   inquiries are counted on their own. "Lost" inquiries were real and
 *   stay in every denominator.
 * - Consultations, quotes and signed clients are counted on the month the
 *   lead came in (a cohort): of the people who asked that month, how many
 *   ended up where. Stages are cumulative: a quoted lead passed the
 *   consultation stage.
 * - "Signed this month" is the calendar count, by `signed_at`: how many
 *   projects were actually signed in the month, whenever the lead arrived.
 */

/** "2026-10", in UTC. */
export const monthKey = (iso: string) => iso.slice(0, 7);

/** Whether a lead is a prospective website customer and not spam. */
export const isInquiry = (l: Pick<Lead, "kind" | "status">) => CUSTOMER_KINDS.includes(l.kind) && l.status !== "spam";

/* ---------- where a lead came from, and how sure we are ---------- */

export type Evidence = "partner" | "campaign" | "referrer" | "self-reported" | "unknown";

export const EVIDENCE_NOTE: Record<Evidence, string> = {
  partner: "Tagged link: a referral partner's code was on the visit. Strong.",
  campaign: "Tagged link: utm tags on the visit (the business card, or a link you tagged). Strong.",
  referrer: "Browser-reported: the previous page's site. Usually right, but browsers and apps often strip it.",
  "self-reported": "What the person said when asked how they heard. As reliable as their memory.",
  unknown: "No tag, no referrer and nothing said. Could be typed, a bookmark, a private browser, an app that hides where it came from, or a search engine that stripped it. Not proof of a direct visit.",
};

const SEARCH_HOSTS = /(^|\.)(google\.[a-z.]+|bing\.com|duckduckgo\.com|yahoo\.com|search\.brave\.com|ecosia\.org)$/;
const SOCIAL_HOSTS = /(^|\.)(facebook\.com|instagram\.com|fb\.com|l\.instagram\.com|lm\.facebook\.com|t\.co|x\.com|twitter\.com|linkedin\.com|tiktok\.com|nextdoor\.com|youtube\.com)$/;

/** A referrer host as a plain group. The host itself is kept out of anything that leaves the admin. */
export function hostGroup(host: string): "Search" | "Social" | "Another website" {
  if (SEARCH_HOSTS.test(host)) return "Search";
  if (SOCIAL_HOSTS.test(host)) return "Social";
  return "Another website";
}

/** "How did you hear about me?" as one of a few buckets, so free text never leaves the admin. */
export function heardBucket(heard: string | null): HeardOption | null {
  if (!heard) return null;
  const h = heard.trim().toLowerCase();
  if ((HEARD_OPTIONS as readonly string[]).includes(h)) return h as HeardOption;
  if (/google|search|bing|looked (you|it) up|online/.test(h)) return "google";
  if (/friend|referr|recommend|told me|word of mouth|neighbo|family|brother|sister|cousin|coworker|client|customer/.test(h)) return "friend";
  if (/card|qr/.test(h)) return "card";
  if (/facebook|instagram|insta|tiktok|social|nextdoor|linkedin|youtube/.test(h)) return "social";
  if (/partner|agency|photograph|designer/.test(h)) return "partner";
  return "other";
}

export type SourceRead = {
  /** The short label on the dashboard ("Business card", "Search", "Partner link (maria)", "Unknown"). */
  label: string;
  /** The label with the partner's code and the referrer host taken out, for anything aggregated or sent off. */
  group: string;
  evidence: Evidence;
  /** What the person said, when they said something, as a bucket. */
  said: HeardOption | null;
};

/**
 * Where a lead's visit came from, by the strongest evidence available:
 * partner link > utm tags > referrer host > what they said > unknown. For a
 * call or text, only what they said is available.
 */
export function sourceRead(l: Pick<Lead, "partner_code" | "utm_source" | "utm_medium" | "referrer_host" | "heard" | "kind">): SourceRead {
  const said = heardBucket(l.heard);
  if (l.partner_code) return { label: `Partner link (${l.partner_code})`, group: "Partner link", evidence: "partner", said };
  if (l.utm_source) {
    const tag = l.utm_source === "card" ? "Business card" : `${l.utm_source}${l.utm_medium ? ` / ${l.utm_medium}` : ""}`;
    return { label: tag, group: tag, evidence: "campaign", said };
  }
  if (l.referrer_host) {
    const g = hostGroup(l.referrer_host);
    return { label: g === "Another website" ? l.referrer_host : g, group: g, evidence: "referrer", said };
  }
  if (said && said !== "unknown") {
    const lbl = `Said: ${HEARD_LABEL[said].toLowerCase()}`;
    return { label: lbl, group: lbl, evidence: "self-reported", said };
  }
  return { label: "Unknown", group: "Unknown", evidence: "unknown", said };
}

export const sourceLabel = (l: Parameters<typeof sourceRead>[0]) => sourceRead(l).label;

/* ---------- by month ---------- */

export type MonthRow = {
  month: string;
  /** Prospective customers who asked this month (not spam; lost included). */
  inquiries: number;
  byKind: Partial<Record<LeadKind, number>>;
  bySource: Record<string, number>;
  /** Cohort stages, cumulative. */
  consulted: number;
  quoted: number;
  signed: number;
  paid: number;
  lost: number;
  spam: number;
  partnerInquiries: number;
  /** Projects signed in this calendar month, by signed_at, whenever the lead arrived. */
  signedThisMonth: number;
  search: { impressions: number; clicks: number; note: string | null } | null;
};

const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : null);

export function rates(r: Pick<MonthRow, "inquiries" | "consulted" | "quoted" | "signed">) {
  return { consult: pct(r.consulted, r.inquiries), quote: pct(r.quoted, r.inquiries), sign: pct(r.signed, r.inquiries), quoteToSign: pct(r.signed, r.quoted) };
}

/** The last `count` months ending this month, newest first. */
export function monthRows(leads: Lead[], search: SearchMonth[], now = new Date(), count = 6): MonthRow[] {
  const keys: string[] = [];
  for (let i = 0; i < count; i++) keys.push(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1)).toISOString().slice(0, 7));
  const searchBy = new Map(search.map((s) => [monthKey(s.month), s]));
  return keys.map((month) => {
    const arrived = leads.filter((l) => monthKey(l.created_at) === month);
    const row: MonthRow = { month, inquiries: 0, byKind: {}, bySource: {}, consulted: 0, quoted: 0, signed: 0, paid: 0, lost: 0, spam: 0, partnerInquiries: 0, signedThisMonth: 0, search: null };
    for (const l of arrived) {
      if (l.status === "spam") { row.spam++; continue; }
      if (l.kind === "partner") { row.partnerInquiries++; continue; }
      row.inquiries++;
      row.byKind[l.kind] = (row.byKind[l.kind] ?? 0) + 1;
      const src = sourceLabel(l);
      row.bySource[src] = (row.bySource[src] ?? 0) + 1;
      if (l.status === "lost") { row.lost++; continue; }
      const st = STAGE[l.status];
      if (st >= 1) row.consulted++;
      if (st >= 2) row.quoted++;
      if (st >= 3) row.signed++;
      if (st >= 4) row.paid++;
    }
    row.signedThisMonth = leads.filter((l) => isInquiry(l) && l.signed_at && monthKey(l.signed_at) === month).length;
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

/* ---------- by source, all time ---------- */

export type SourceRow = { label: string; group: string; evidence: Evidence; inquiries: number; quoted: number; signed: number; lost: number; signRate: number | null };

/** Every source seen, with how many inquiries it brought and how many signed. Deterministic; nothing inferred. */
export function sourceRows(leads: Lead[]): SourceRow[] {
  const by = new Map<string, SourceRow>();
  for (const l of leads) {
    if (!isInquiry(l)) continue;
    const r = sourceRead(l);
    const row = by.get(r.label) ?? { label: r.label, group: r.group, evidence: r.evidence, inquiries: 0, quoted: 0, signed: 0, lost: 0, signRate: null };
    row.inquiries++;
    if (l.status === "lost") row.lost++;
    else { if (STAGE[l.status] >= 2) row.quoted++; if (STAGE[l.status] >= 3) row.signed++; }
    by.set(r.label, row);
  }
  return [...by.values()].map((r) => ({ ...r, signRate: pct(r.signed, r.inquiries) })).sort((a, b) => b.inquiries - a.inquiries || a.label.localeCompare(b.label));
}

/* ---------- what the AI gets to see ---------- */

/**
 * The aggregate, de-identified picture for "Explain my leads": counts only.
 * No names, contacts, businesses, websites, notes, checkup text, partner
 * codes or referrer hosts; "how they heard" only as buckets. Everything the
 * model is told is in this object, so it can be read and checked here.
 */
export type AiAggregate = {
  as_of: string;
  definitions: string[];
  months: { month: string; inquiries: number; consulted: number; quoted: number; signed_from_this_cohort: number; lost: number; spam: number; partner_inquiries: number; signed_this_calendar_month: number; search_impressions: number | null; search_clicks: number | null }[];
  sources: { source: string; evidence: Evidence; inquiries: number; quoted: number; signed: number; lost: number }[];
  how_they_heard: Record<string, number>;
  kinds: Record<string, number>;
  landing_pages: Record<string, number>;
  unknown_source_share: number | null;
  totals: { inquiries: number; signed: number; target_per_month: number };
};

export function aiAggregate(leads: Lead[], search: SearchMonth[], now = new Date()): AiAggregate {
  const months = monthRows(leads, search, now, 6);
  const srcByGroup = new Map<string, AiAggregate["sources"][number]>();
  const heard: Record<string, number> = {};
  const kinds: Record<string, number> = {};
  const landing: Record<string, number> = {};
  let inquiries = 0, signed = 0, unknown = 0;
  for (const l of leads) {
    if (!isInquiry(l)) continue;
    inquiries++;
    const r = sourceRead(l);
    const row = srcByGroup.get(r.group) ?? { source: r.group, evidence: r.evidence, inquiries: 0, quoted: 0, signed: 0, lost: 0 };
    row.inquiries++;
    if (l.status === "lost") row.lost++;
    else { if (STAGE[l.status] >= 2) row.quoted++; if (STAGE[l.status] >= 3) { row.signed++; signed++; } }
    srcByGroup.set(r.group, row);
    if (r.evidence === "unknown") unknown++;
    if (r.said) heard[HEARD_LABEL[r.said]] = (heard[HEARD_LABEL[r.said]] ?? 0) + 1;
    kinds[KIND_LABEL[l.kind]] = (kinds[KIND_LABEL[l.kind]] ?? 0) + 1;
    if (l.landing_page) landing[l.landing_page] = (landing[l.landing_page] ?? 0) + 1;
  }
  return {
    as_of: now.toISOString().slice(0, 10),
    definitions: [
      "An inquiry is a validated website form or a logged call/text from a prospective website customer, excluding spam. Partner inquiries are counted separately.",
      "Lost = a real inquiry that didn't become a project; it stays in the denominators.",
      "Month rows are cohorts by the month the inquiry arrived; signed_this_calendar_month counts by signing date instead.",
      "Source evidence: partner and campaign are tagged links (strong); referrer is browser-reported (often stripped); self-reported is what the person said; unknown means no tag, no referrer, nothing said, and is NOT a direct visit.",
      "Search impressions/clicks are Search Console totals typed in by hand; null means not entered yet.",
    ],
    months: months.map((m) => ({ month: m.month, inquiries: m.inquiries, consulted: m.consulted, quoted: m.quoted, signed_from_this_cohort: m.signed, lost: m.lost, spam: m.spam, partner_inquiries: m.partnerInquiries, signed_this_calendar_month: m.signedThisMonth, search_impressions: m.search?.impressions ?? null, search_clicks: m.search?.clicks ?? null })),
    sources: [...srcByGroup.values()].sort((a, b) => b.inquiries - a.inquiries || a.source.localeCompare(b.source)),
    how_they_heard: heard,
    kinds,
    landing_pages: landing,
    unknown_source_share: pct(unknown, inquiries),
    totals: { inquiries, signed, target_per_month: 1 },
  };
}
