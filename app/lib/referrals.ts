import { REFERRAL_RATE } from "../data/referral";
import { isValidCode } from "./refCode";
import { supabase, SupabaseError } from "./supabase";

/**
 * Partners and the leads attributed to them, in Supabase (see
 * supabase/migrations/20261014000000_referrals.sql). Server only.
 */

export const TERMS_VERSION = "2026-10-14";

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

export const LEAD_STATUSES = ["new", "quoted", "hired", "paid", "partner_paid"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];
export const STATUS_LABEL: Record<LeadStatus, string> = { new: "New", quoted: "Quoted", hired: "Hired", paid: "Client paid", partner_paid: "Partner paid" };

export type Lead = {
  id: string;
  partner_code: string;
  kind: "quote" | "checkup";
  business: string | null;
  contact_name: string | null;
  contact: string | null;
  website: string | null;
  checkup: string | null;
  /** utm_source of the visit ("card" for the business card), if any. Needs the 2026-10-15 column. */
  utm_source?: string | null;
  status: LeadStatus;
  build_price: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

/** What the partner is owed on a lead: 20% of the build price, once the client has paid in full. */
export function owed(lead: Pick<Lead, "status" | "build_price">) {
  if ((lead.status !== "paid" && lead.status !== "partner_paid") || !lead.build_price) return 0;
  return Math.round(Number(lead.build_price) * REFERRAL_RATE * 100) / 100;
}

const enc = encodeURIComponent;

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

/** Records a lead against a partner code, if that partner exists and is active. Never throws. */
export async function recordLead(code: string, lead: Pick<Lead, "kind"> & Partial<Pick<Lead, "business" | "contact_name" | "contact" | "website" | "checkup" | "utm_source">>) {
  try {
    const partner = await findPartner(code);
    if (!partner) return null;
    const post = (row: object) => supabase("referral_leads", { method: "POST", body: JSON.stringify({ partner_code: partner.code, ...row }) });
    try {
      await post(lead);
    } catch (e) {
      // The utm_source column comes from a later migration; if it isn't there yet, save the lead without it.
      if (!(e instanceof SupabaseError && e.status === 400 && /utm_source/.test(e.detail) && "utm_source" in lead)) throw e;
      const { utm_source: _drop, ...rest } = lead;
      await post(rest);
    }
    return partner;
  } catch (e) {
    console.error("Referral lead not recorded", code, e instanceof Error ? e.message : e);
    return null;
  }
}

export async function listPartners() {
  return supabase<Partner[]>("partners?select=*&order=created_at.desc");
}

export async function listLeads() {
  return supabase<Lead[]>("referral_leads?select=*&order=created_at.desc");
}

export async function updateLead(id: string, patch: { status?: LeadStatus; build_price?: number | null; notes?: string | null }) {
  const rows = await supabase<Lead[]>(`referral_leads?id=eq.${enc(id)}`, { method: "PATCH", returnRows: true, body: JSON.stringify({ ...patch, updated_at: new Date().toISOString() }) });
  return rows?.[0] ?? null;
}
