"use client";

import { useEffect, useRef } from "react";

/**
 * Microsoft Clarity. Production only, only with NEXT_PUBLIC_CLARITY_ID set,
 * and not until the window has loaded so the tag never competes with the
 * page. Form inputs keep Clarity's default masking.
 */
export default function ClarityAnalytics() {
  const started = useRef(false);

  useEffect(() => {
    const projectId = process.env.NEXT_PUBLIC_CLARITY_ID;
    if (process.env.NODE_ENV !== "production" || !projectId || started.current) return;
    let cancelled = false;
    const boot = async () => {
      if (cancelled) return;
      try {
        const { default: Clarity } = await import("@microsoft/clarity");
        if (cancelled) return;
        Clarity.init(projectId);
        started.current = true;
      } catch {
        // Analytics must never take the page down with it.
      }
    };
    if (document.readyState === "complete") boot();
    else window.addEventListener("load", boot, { once: true });
    return () => { cancelled = true; window.removeEventListener("load", boot); };
  }, []);

  return null;
}
