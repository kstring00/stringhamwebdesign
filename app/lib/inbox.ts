import { site } from "@/app/data/site";

/**
 * Shared plumbing for the site's two forms (the free check and the partner
 * inquiry): input cleaning, a per-IP rate limit, and one email to Kyle via
 * Resend. With RESEND_API_KEY unset, `deliver` reports `sent: false` and
 * the route decides what that means (a lead needs at least one durable
 * destination: a sent email or a saved ledger row). Nothing a prospect
 * typed is ever written to the server log. The key is server-only.
 */

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 5;
const rateStore = new Map<string, { count: number; resetAt: number }>();

/** Trim, collapse spaces, strip control characters, cap the length. Non-strings become "". */
export function clean(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, " ").replace(/[ \t]{2,}/g, " ").trim().slice(0, max);
}

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/** True when this key has sent RATE_LIMIT messages in the window. Keys are namespaced per form. */
export function rateLimited(key: string) {
  const now = Date.now();
  const cur = rateStore.get(key);
  if (!cur || cur.resetAt <= now) { rateStore.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS }); return false; }
  if (cur.count >= RATE_LIMIT) return true;
  cur.count += 1;
  return false;
}

export function clientIp(headers: Headers) {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

/** Send one plain-text email to Kyle. Returns `{ ok, sent }`; `ok: false` only when Resend rejects it. */
export async function deliver({ subject, text, replyTo, label }: { subject: string; text: string; replyTo?: string; label: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL || site.email;
  const from = process.env.CONTACT_FROM_EMAIL || "Stringham Web Design <onboarding@resend.dev>";

  if (!apiKey) {
    console.warn(`RESEND_API_KEY is not set; ${label} was not emailed.`);
    return { ok: true, sent: false };
  }

  // The local test points this at a stand-in; production always uses Resend.
  const base = (process.env.RESEND_API_BASE || "https://api.resend.com").replace(/\/+$/, "");
  const res = await fetch(`${base}/emails`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject, text, ...(replyTo ? { reply_to: replyTo } : {}) }),
  });
  if (!res.ok) {
    console.error(`${label} email failed`, res.status);
    return { ok: false, sent: false };
  }
  return { ok: true, sent: true };
}
