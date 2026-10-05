"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { track } from "../lib/track";

/**
 * Sends the site's custom events to Clarity: cta_click (with the button's
 * data-location), email_click on any mailto link, and terms_view when the
 * terms page opens. free_check_submit is sent by the form itself.
 */
export default function Tracking() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/terms") track("terms_view");
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.<HTMLElement>("a, button");
      if (!a) return;
      if (a.dataset.track === "cta") track("cta_click", { cta_location: a.dataset.location || "unknown" });
      else if (a.dataset.track === "email" || (a.getAttribute("href") || "").startsWith("mailto:")) track("email_click");
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
