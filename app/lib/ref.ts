import { REF_COOKIE, REF_DAYS, isValidCode } from "./refCode";

/**
 * The referral code a visitor arrived with, kept for 90 days in a
 * first-party cookie and in localStorage (either can be blocked, so both
 * are tried, each in its own try/catch). First touch wins: a later link
 * from someone else doesn't replace a code that's still in date.
 */

const KEY = "swd_ref";
const MS = REF_DAYS * 24 * 60 * 60 * 1000;

export function readRef(): string {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "null") as { code?: string; at?: number } | null;
    if (saved?.code && saved.at && Date.now() - saved.at < MS && isValidCode(saved.code)) return saved.code;
  } catch { /* no storage */ }
  try {
    const m = document.cookie.match(new RegExp(`(?:^|; )${REF_COOKIE}=([^;]+)`));
    const code = m ? decodeURIComponent(m[1]) : "";
    if (isValidCode(code)) return code;
  } catch { /* no cookies */ }
  return "";
}

/** Saves a code unless an in-date one is already there. Returns the code now in force. */
export function storeRef(code: string): string {
  const current = readRef();
  if (current) return current;
  try { localStorage.setItem(KEY, JSON.stringify({ code, at: Date.now() })); } catch { /* fine */ }
  try {
    const secure = location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${REF_COOKIE}=${encodeURIComponent(code)}; Max-Age=${Math.round(MS / 1000)}; Path=/; SameSite=Lax${secure}`;
  } catch { /* fine */ }
  return code;
}

/** A well-formed ?ref= on the current URL, or "". */
export function refFromUrl(): string {
  try {
    const code = (new URLSearchParams(window.location.search).get("ref") || "").trim().toLowerCase();
    return isValidCode(code) ? code : "";
  } catch { return ""; }
}

/**
 * The code to send with a form: the saved one, or (on the very first page
 * of a visit, before RefTracker has confirmed it) the one in the URL. The
 * server checks it against the partners either way.
 */
export function currentRef(): string {
  return readRef() || refFromUrl();
}
