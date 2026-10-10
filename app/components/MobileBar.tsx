"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import { cta, partnerCta } from "../data/nav";
import { site } from "../data/site";
import styles from "./MobileBar.module.css";

/**
 * Phones and tablets: a sticky bottom bar with Call, Text and the one
 * action, within thumb reach on every page. It steps out of the way while
 * the quote form is on screen (the form has its own button) and while a
 * form field is being typed in. Desktop never shows it (CSS).
 */
export default function MobileBar() {
  const pathname = usePathname();
  const action = pathname.startsWith("/partners") ? partnerCta : cta;
  const bar = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    delete el.dataset.hidden;
    let overForm = false, typing = false;
    const apply = () => { if (overForm || typing) el.dataset.hidden = "1"; else delete el.dataset.hidden; };
    // The form section with the page's own submit button: #quote on home, the form on /google-check and /partners.
    const target = document.querySelector("#quote, #free-check, #partner-form");
    const io = target ? new IntersectionObserver(([e]) => { overForm = e.isIntersecting; apply(); }, { threshold: 0.15 }) : null;
    if (target && io) io.observe(target);
    const isField = (t: EventTarget | null) => t instanceof HTMLElement && t.matches("input, textarea, select");
    const onIn = (e: FocusEvent) => { if (isField(e.target)) { typing = true; apply(); } };
    const onOut = (e: FocusEvent) => { if (isField(e.target)) { typing = false; apply(); } };
    document.addEventListener("focusin", onIn);
    document.addEventListener("focusout", onOut);
    return () => { io?.disconnect(); document.removeEventListener("focusin", onIn); document.removeEventListener("focusout", onOut); };
  }, [pathname]);

  return (
    <nav ref={bar} className={styles.bar} aria-label="Quick actions">
      <a className={styles.item} href={site.phoneHref}>
        <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 1.5 6 4.6 4.7 6a8 8 0 0 0 5.3 5.3l1.4-1.3 3.1 1.5-.6 2.6a1.5 1.5 0 0 1-1.6 1.1A13 13 0 0 1 .8 3.7 1.5 1.5 0 0 1 1.9 2.1z" fill="currentColor" /></svg>
        Call
      </a>
      <a className={styles.item} href={site.smsHref}>
        <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 2.5h12a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H6l-3.5 3v-3H2a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
        Text
      </a>
      <a className={`${styles.item} ${styles.primary}`} href={action.href} data-track="cta" data-location="mobile-bar" aria-label={action.label}>
        {action.short}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
      </a>
    </nav>
  );
}
