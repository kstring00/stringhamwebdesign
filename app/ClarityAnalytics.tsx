"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Microsoft Clarity — usage analytics and session replay on the public site.
 *
 * Four gates, all of which must open before the tag is ever requested:
 *
 *   1. Production only. Dev and preview builds send nothing.
 *   2. NEXT_PUBLIC_CLARITY_ID must be set. Missing is not an error: the site
 *      simply runs without analytics, which is what every local run does.
 *   3. Never on the client portal. Anything under /portal — the sign-in page
 *      included, since that is /portal itself — is excluded outright, so no
 *      client dashboard, timesheet or invoice is ever recorded.
 *   4. Not until the window has loaded, so the tag never competes with the
 *      page itself.
 *
 * Form inputs keep Clarity's default masking; nothing here relaxes it.
 */

const PORTAL_PREFIX = "/portal";

export default function ClarityAnalytics() {
  const pathname = usePathname();
  const started = useRef(false);

  // In the portal, and only there, this is true for the whole visit.
  const excluded = pathname === PORTAL_PREFIX || pathname.startsWith(`${PORTAL_PREFIX}/`);

  useEffect(() => {
    const projectId = process.env.NEXT_PUBLIC_CLARITY_ID;

    if (excluded) {
      // Entering the portal through a client-side navigation cannot happen
      // today — the header's portal link is a plain anchor, so the browser
      // reloads and this component mounts fresh on an excluded path. This is
      // the belt to that braces: if one ever becomes a client transition, the
      // tag that is already running is told to stop rather than following the
      // visitor into their dashboard.
      if (started.current) {
        try {
          (window as unknown as { clarity?: (command: string) => void }).clarity?.("stop");
        } catch {
          // Nothing to do: the command is advisory and the next full page
          // load lands on an excluded path with no tag at all.
        }
      }
      return;
    }

    if (process.env.NODE_ENV !== "production") return;
    if (!projectId) return;
    if (started.current) return;

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

    return () => {
      cancelled = true;
      window.removeEventListener("load", boot);
    };
  }, [excluded]);

  return null;
}
