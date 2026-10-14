"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { refFromUrl, storeRef } from "../lib/ref";
import { track } from "../lib/track";

/**
 * On any page opened with ?ref=CODE: ask the server whether the code
 * belongs to an active partner, and if it does, remember it for 90 days
 * (lib/ref.ts; first link wins) and send ref_visit to Clarity. A mistyped
 * or made-up code is never saved, so it can't block a real one. Only the
 * code is ever read from the URL.
 */
export default function RefTracker() {
  const pathname = usePathname();
  useEffect(() => {
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
