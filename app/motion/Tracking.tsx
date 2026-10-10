"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { track } from "../lib/track";

/**
 * Sends the site's custom events to Clarity: cta_click (with the button's
 * data-location), demo_link_click on a project's demo link (data-project
 * names it), call_tap on any tel: link, text_tap on any sms: link,
 * email_click on any mailto link, and terms_view when the terms page opens.
 * The forms send quote_submit, google_check_submit and partner_submit; the
 * work carousel sends carousel_interaction.
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
      const href = a.getAttribute("href") || "";
      const page = window.location.pathname;
      if (a.dataset.track === "cta") track("cta_click", { cta_location: a.dataset.location || "unknown", page });
      else if (a.dataset.track === "demo") track("demo_link_click", { project: a.dataset.project || "unknown", page });
      else if (a.dataset.track === "email" || href.startsWith("mailto:")) track("email_click", { page });
      else if (href.startsWith("tel:")) track("call_tap", { page });
      else if (href.startsWith("sms:")) track("text_tap", { page });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
