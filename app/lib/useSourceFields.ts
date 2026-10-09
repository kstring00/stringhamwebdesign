"use client";

import { useEffect } from "react";

export const SOURCE_KEYS = ["utm_source", "utm_medium", "utm_campaign"] as const;

/**
 * Where the visitor came from (utm tags and an outside referrer), kept for
 * the whole visit in sessionStorage and written into the form's hidden
 * fields, so a visitor who lands from outreach and reads for a while is
 * still attributed. Storage can be unavailable; the form works without it.
 */
export function useSourceFields(formId: string) {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const saved = JSON.parse(sessionStorage.getItem("swd-source") || "{}") as Record<string, string>;
      const next: Record<string, string> = { ...saved };
      for (const k of SOURCE_KEYS) { const v = params.get(k); if (v) next[k] = v.slice(0, 120); }
      if (!next.referrer && document.referrer && !document.referrer.startsWith(window.location.origin)) next.referrer = document.referrer.slice(0, 300);
      sessionStorage.setItem("swd-source", JSON.stringify(next));
      const form = document.getElementById(formId) as HTMLFormElement | null;
      if (form) for (const [k, v] of Object.entries(next)) { const input = form.elements.namedItem(k) as HTMLInputElement | null; if (input) input.value = v; }
    } catch {
      // No storage: the form still works, just without a source.
    }
  }, [formId]);
}
