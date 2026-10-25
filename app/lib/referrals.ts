import { createHash } from "node:crypto";

import { REFERRAL_RATE } from "../data/referral";
import { isValidCode } from "./refCode";
import { supabase, SupabaseError } from "./supabase";

/**
 * Partners, the lead ledger and the monthly Search Console entries, in
 * Supabase (see supabase/migrations/20261024000000_leads.sql). Server only.
 *
 * The ledger is the `referral_leads` table, widened in place: every
 * validated inquiry from the site's forms is written there, referred or
 * not; calls and texts are logged by hand at /manage. Writes never throw:
 * a lead that can't be saved is still emailed, and the email says so.
 */

export const TERMS_VERSION = "2026-10-14";
const TABLE = "referral_leads";

export type Partner = {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string | null;
  how_they_know: string | null;
  active: boolean;
  created_at: string;
};

export const LEAD_KINDS = ["quote", "checkup", "google_check", "partner", "call", "text"] as const;
export type LeadKind = (typeof LEAD_KINDS)[number];
export const KIND_LABEL: Record<LeadKind, string> = {
  quote: "Quote request",
  checkup: "Checkup review",
  google_check: "Google check",
  partner: "Partner inquiry",
  call: "Call",
  text: "Text",
};

/** Kinds that are a prospective website customer. Partner inquiries are reported on their own. */
export const CUSTOMER_KINDS: readonly LeadKind[] = ["quote", "checkup", "google_check", "call", "text"];

export const LEAD_STATUSES = ["new", "consulted", "quoted", "hired", "paid", "partner_paid", "lost", "spam"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];
export const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "New",
  consulted: "Consultation held",
  quoted: "Quoted",
  hired: "Hired",
  paid: "Client paid",
  partner_paid: "Partner paid",
  lost: "Lost (real inquiry, no project)",
  spam: "Spam / not a real inquiry",
};

/** How far along the pipeline a status is. lost stays in the denominators (0); spam is off it (-1). */
export const STAGE: Record<LeadStatus, number> = { new: 0, consulted: 1, quoted: 2, hired: 3, paid: 4, partner_paid: 4, lost: 0, spam: -1 };
export const SIGNED_STATUSES: readonly LeadStatus[] = ["hired", "paid", "partner_paid"];

/** The options for "how they heard" on a call or text logged by hand. Validated on the server. */
export const HEARD_OPTIONS = ["google", "friend", "card", "social", "partner", "other", "unknown"] as const;
export type HeardOption = (typeof HEARD_OPTIONS)[number];
export const HEARD_LABEL: Record<HeardOption, string> = {
  google: "Google / search",
  friend: "A person recommended me",
  card: "Business card",
  social: "Facebook / Instagram",
  partner: "A referral partner",
  other: "Something else",
  unknown: "Didn't say / don't know",
};

export type Lead = {
  id: string;
  partner_code: string | null;
  kind: LeadKind;
  business: string | null;
  contact_name: string | null;
  contact: string | null;
  website: string | null;
  checkup: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  referrer_host: string | null;
  landing_page: string | null;
  heard: string | null;
  detail: string | null;
  status: LeadStatus;
  build_price: number | null;
  notes: string | null;
  signed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SearchMonth = { month: string; impressions: number; clicks: number; note: string | null; updated_at: string };

/**
 * What the partner is owed on a lead: 20% of the build price, once the
 * client has paid in full. Only a referred lead (one with a partner code)
 * can owe anything; a direct client never creates a referral liability.
 */
export function owed(lead: Pick<Lead, "status" | "build_price" | "partner_code">) {
  if (!lead.partner_code) return 0;
  if ((lead.status !== "paid" && lead.status !== "partner_paid") || !lead.build_price) return 0;
  return Math.round(Number(lead.build_price) * REFERRAL_RATE * 100) / 100;
}

const enc = encodeURIComponent;

/* ---------- partners ---------- */

export async function findPartner(code: string): Promise<Partner | null> {
  if (!isValidCode(code)) return null;
  const rows = await supabase<Partner[]>(`partners?code=eq.${enc(code)}&active=is.true&select=*&limit=1`);
  return rows?.[0] ?? null;
}

export async function codeTaken(code: string) {
  const rows = await supabase<{ code: string }[]>(`partners?code=eq.${enc(code)}&select=code&limit=1`);
  return Boolean(rows?.length);
}

/** Creates the partner. Returns null when the code was taken in the meantime. */
export async function createPartner(p: { code: string; name: string; email: string; phone: string; how_they_know: string }) {
  try {
    const rows = await supabase<Partner[]>("partners", {
      method: "POST",
      returnRows: true,
      body: JSON.stringify({ ...p, phone: p.phone || null, how_they_know: p.how_they_know || null, terms_version: TERMS_VERSION, agreed_terms_at: new Date().toISOString() }),
    });
    return rows[0];
  } catch (e) {
    if (e instanceof SupabaseError && e.status === 409) return null;
    throw e;
  }
}

export async function listPartners() {
  return supabase<Partner[]>("partners?select=*&order=created_at.desc");
}

/* ---------- the ledger ---------- */

export type LeadInput = {
  kind: LeadKind;
  business?: string;
  contact_name?: string;
  /** A phone number or an email; the dedupe key is built from it. */
  contact?: string;
  website?: string;
  checkup?: string;
  heard?: string;
  detail?: string;
  source?: { utm_source?: string; utm_medium?: string; utm_campaign?: string; referrer?: string; landing?: string };
};

export type RecordResult = {
  /** The active partner the lead was credited to, if a valid code came with it. */
  partner: Partner | null;
  /** True when a new row was written. */
  saved: boolean;
  /** True when the same contact sent the same kind of form earlier today (the earlier row stands). */
  duplicate: boolean;
  /** Why it wasn't saved, in words safe for an email ("Supabase isn't set up", "couldn't reach Supabase"). */
  reason: string;
};

/** Lowercased email, or the digits of a phone number. */
export const normalizeContact = (c: string) => (c.includes("@") ? c.trim().toLowerCase() : c.replace(/\D/g, ""));

/** Only the host of an outside referrer, never its path or query. */
export function referrerHost(referrer: string | undefined) {
  if (!referrer) return null;
  try { return new URL(referrer).hostname.replace(/^www\./, "").toLowerCase().slice(0, 120) || null; } catch { return null; }
}

/** The first page of the visit, as a path on this site; anything else is dropped. */
export function landingPath(landing: string | undefined) {
  if (!landing || !landing.startsWith("/") || landing.startsWith("//")) return null;
  return landing.split(/[?#]/)[0].slice(0, 200);
}

/** A utm value: letters, digits, space and .-_ only, so nothing odd gets stored or shown. */
export function utmValue(v: string | undefined) {
  const s = (v || "").replace(/[^\w .-]/g, "").trim().slice(0, 120);
  return s || null;
}

/** kind + contact + day, hashed: the same person, same form, same day is one lead. */
export function dedupeKey(kind: LeadKind, contact: string | undefined, at = new Date()) {
  const who = normalizeContact(contact || "");
  if (!who) return null;
  return createHash("sha256").update(`${kind}|${who}|${at.toISOString().slice(0, 10)}`).digest("hex").slice(0, 40);
}

const nul = (v: string | undefined | null) => (v ? v : null);

/**
 * Writes one lead. A valid, active partner code credits the lead to that
 * partner; an unknown code is ignored (the email still shows it). Never
 * throws, never blocks the email, and never logs what the visitor typed.
 */
export async function recordLead(input: LeadInput, partnerCode = ""): Promise<RecordResult> {
  const out: RecordResult = { partner: null, saved: false, duplicate: false, reason: "" };
  try {
    if (partnerCode && isValidCode(partnerCode)) out.partner = await findPartner(partnerCode);
    const s = input.source ?? {};
    const row = {
      partner_code: out.partner?.code ?? null,
      kind: input.kind,
      business: nul(input.business),
      contact_name: nul(input.contact_name),
      contact: nul(input.contact),
      website: nul(input.website),
      checkup: nul(input.checkup),
      heard: nul(input.heard),
      detail: nul(input.detail),
      utm_source: utmValue(s.utm_source),
      utm_medium: utmValue(s.utm_medium),
      utm_campaign: utmValue(s.utm_campaign),
      referrer_host: referrerHost(s.referrer),
      landing_page: landingPath(s.landing),
      dedupe_key: dedupeKey(input.kind, input.contact),
    };
    await supabase(TABLE, { method: "POST", body: JSON.stringify(row) });
    out.saved = true;
  } catch (e) {
    if (e instanceof SupabaseError && e.status === 409) {
      out.duplicate = true;
      out.reason = "already recorded today";
    } else {
      out.reason = e instanceof SupabaseError && e.status === 503 ? "Supabase isn't set up" : "couldn't reach Supabase";
      console.error("Lead not recorded:", input.kind, e instanceof SupabaseError ? `status ${e.status}` : "error");
    }
  }
  return out;
}

/** A call or text Kyle logs by hand. Throws on failure; the admin shows the error. */
export async function createManualLead(input: { kind: "call" | "text"; business: string; contact_name: string; contact: string; heard: HeardOption; notes: string }) {
  const rows = await supabase<Lead[]>(TABLE, {
    method: "POST",
    returnRows: true,
    body: JSON.stringify({ kind: input.kind, business: nul(input.business), contact_name: nul(input.contact_name), contact: nul(input.contact), heard: input.heard, notes: nul(input.notes) }),
  });
  return rows[0];
}

export async function listLeads() {
  return supabase<Lead[]>(`${TABLE}?select=*&order=created_at.desc`);
}

export async function getLead(id: string) {
  const rows = await supabase<Lead[]>(`${TABLE}?id=eq.${enc(id)}&select=*&limit=1`);
  return rows?.[0] ?? null;
}

/**
 * The admin's edit: status, build price, notes. `signed_at` follows the
 * status: set the first time a lead reaches "hired" (or beyond), cleared if
 * it's moved back below it, kept otherwise.
 */
export async function updateLead(id: string, patch: { status: LeadStatus; build_price?: number | null; notes?: string | null }) {
  const current = await getLead(id);
  if (!current) return null;
  const signed = SIGNED_STATUSES.includes(patch.status);
  const signed_at = signed ? (current.signed_at ?? new Date().toISOString()) : null;
  const rows = await supabase<Lead[]>(`${TABLE}?id=eq.${enc(id)}`, { method: "PATCH", returnRows: true, body: JSON.stringify({ ...patch, signed_at, updated_at: new Date().toISOString() }) });
  return rows?.[0] ?? null;
}

/* ---------- Search Console, by month ---------- */

export async function listSearchMonths() {
  return supabase<SearchMonth[]>("search_months?select=*&order=month.desc&limit=24");
}

/** Insert or replace one month. `month` is YYYY-MM-01. */
export async function upsertSearchMonth(m: { month: string; impressions: number; clicks: number; note: string | null }) {
  const rows = await supabase<SearchMonth[]>("search_months?on_conflict=month", {
    method: "POST",
    returnRows: true,
    headers: { Prefer: "return=representation,resolution=merge-duplicates" },
    body: JSON.stringify({ ...m, updated_at: new Date().toISOString() }),
  });
  return rows?.[0] ?? null;
}
