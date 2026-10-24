"use client";

import { useEffect } from "react";

export const SOURCE_KEYS = ["utm_source", "utm_medium", "utm_campaign"] as const;
/** Every hidden field a form carries about the visit: the utm tags, the outside referrer and the first page seen. */
export const VISIT_KEYS = [...SOURCE_KEYS, "referrer", "landing"] as const;
const STORE = "swd-source";

/**
 * Where the visitor came from (utm tags, an outside referrer, and the first
 * page of the visit), kept for the whole visit in sessionStorage. Captured
 * on every page load (by RefTracker), so a visitor who lands from the
 * business card or outreach and reads for a while is still attributed,
 * whichever form they use. The server keeps only the referrer's host and
 * the landing path. Storage can be unavailable; forms work without it.
 */
export function captureSource(): Record<string, string> {
  try {
    const params = new URLSearchParams(window.location.search);
    const saved = JSON.parse(sessionStorage.getItem(STORE) || "{}") as Record<string, string>;
    const next: Record<string, string> = { ...saved };
    for (const k of SOURCE_KEYS) { const v = params.get(k); if (v) next[k] = v.slice(0, 120); }
    if (!next.referrer && document.referrer && !document.referrer.startsWith(window.location.origin)) next.referrer = document.referrer.slice(0, 300);
    if (!next.landing) next.landing = window.location.pathname.slice(0, 200);
    sessionStorage.setItem(STORE, JSON.stringify(next));
    return next;
  } catch {
    return {};
  }
}

/** The visit's utm tags as a query string ("utm_source=card&…"), for links that carry them along. */
export function sourceQuery() {
  const s = captureSource();
  return SOURCE_KEYS.filter((k) => s[k]).map((k) => `${k}=${encodeURIComponent(s[k])}`).join("&");
}

/** Writes the visit's source into a form's hidden fields. */
export function useSourceFields(formId: string) {
  useEffect(() => {
    const source = captureSource();
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (form) for (const [k, v] of Object.entries(source)) { const input = form.elements.namedItem(k) as HTMLInputElement | null; if (input) input.value = v; }
  }, [formId]);
}
