"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { refFromUrl, storeRef } from "../lib/ref";
import { track } from "../lib/track";
import { captureSource } from "../lib/useSourceFields";

const CARD_FLAG = "swd-card-scan";

/**
 * On every page load:
 * - keep the visit's source (utm tags, referrer) for the forms;
 * - a business-card scan (utm_source=card, via /card) sends card_scan to
 *   Clarity once per visit and tags the session source=card;
 * - ?ref=CODE is checked against the active partners, and only a real
 *   partner's code is remembered for 90 days (lib/ref.ts; first link
 *   wins). "card" and other reserved or made-up codes are never saved and
 *   never touch a partner code already stored. Only the code is read from
 *   the URL.
 */
export default function RefTracker() {
  const pathname = usePathname();
  useEffect(() => {
    captureSource();

    let card = false;
    try { card = new URLSearchParams(window.location.search).get("utm_source") === "card"; } catch { /* fine */ }
    if (card) {
      let seen = false;
      try { seen = sessionStorage.getItem(CARD_FLAG) === "1"; sessionStorage.setItem(CARD_FLAG, "1"); } catch { /* fine */ }
      if (!seen) track("card_scan", { source: "card" });
    }

    const code = refFromUrl();
    if (!code) return;
    let live = true;
    fetch(`/api/ref?code=${encodeURIComponent(code)}`)
      .then((r) => r.json() as Promise<{ valid?: boolean }>)
      .then((j) => {
        if (!live || !j.valid) return;
        storeRef(code);
        track("ref_visit", { code });
      })
      .catch(() => {});
    return () => { live = false; };
  }, [pathname]);
  return null;
}
