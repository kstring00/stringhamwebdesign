import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/**
 * The admin sign-in: one password (ADMIN_PASSWORD, set in Vercel), and a
 * signed, http-only cookie that keeps Kyle signed in for 30 days. The
 * signature is keyed on the password, so changing the password signs
 * every session out. Server only.
 */

export const ADMIN_COOKIE = "swd_admin";
export const ADMIN_DAYS = 30;

const key = () => createHash("sha256").update(`swd-admin:${process.env.ADMIN_PASSWORD || ""}`).digest();
const sign = (payload: string) => createHmac("sha256", key()).update(payload).digest("base64url");
const same = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export const adminConfigured = () => (process.env.ADMIN_PASSWORD || "").length >= 8;

export function passwordMatches(input: string) {
  if (!adminConfigured()) return false;
  const h = (v: string) => createHash("sha256").update(v).digest("base64url");
  return same(h(input), h(process.env.ADMIN_PASSWORD || ""));
}

export function newSession() {
  const exp = String(Date.now() + ADMIN_DAYS * 24 * 60 * 60 * 1000);
  return `${exp}.${sign(exp)}`;
}

export function validSession(token: string | undefined) {
  if (!token || !adminConfigured()) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || !/^\d+$/.test(exp) || Number(exp) < Date.now()) return false;
  return same(sig, sign(exp));
}
