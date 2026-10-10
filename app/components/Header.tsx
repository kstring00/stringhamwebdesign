"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

import { cta, navLinks, partnerCta } from "../data/nav";
import { site } from "../data/site";
import Logo from "./Logo";
import styles from "./Header.module.css";

function subscribeScroll(cb: () => void) {
  window.addEventListener("scroll", cb, { passive: true });
  return () => window.removeEventListener("scroll", cb);
}

/**
 * The header: one liquid-glass bar with the logo, the links (Work, Pricing,
 * Blog, About, FAQ, and "For partners" set apart as a pill), the phone
 * number and the one action, "Get a quote + free demo". The partner page
 * keeps its own action and violet accent.
 *
 * On phones the bar is the logo and a Menu button that drops the same
 * links down; the actions move to the bottom bar (MobileBar), within thumb
 * reach. A soft highlight follows the pointer across the glass. Reduced
 * motion: no highlight.
 */
export default function Header() {
  const scrolled = useSyncExternalStore(subscribeScroll, () => window.scrollY > 24, () => false);
  const pathname = usePathname();
  const view = pathname.startsWith("/partners") ? "partners" : "business";
  const action = view === "partners" ? partnerCta : cta;
  const bar = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  // The phone menu closes on navigation and on Escape.
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    const onClick = (e: MouseEvent) => { if (bar.current && !bar.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("click", onClick); };
  }, [open]);

  // The highlight follows the pointer across the glass.
  useEffect(() => {
    const el = bar.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce), (hover: none)").matches) return;
    let raf = 0, x = 0, y = 0;
    const paint = () => { raf = 0; el.style.setProperty("--mx", `${x}px`); el.style.setProperty("--my", `${y}px`); };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      x = e.clientX - r.left; y = e.clientY - r.top;
      if (!raf) raf = requestAnimationFrame(paint);
    };
    el.addEventListener("pointermove", onMove, { passive: true });
    return () => { el.removeEventListener("pointermove", onMove); cancelAnimationFrame(raf); };
  }, []);

  return (
    <header className={styles.header} data-view={view} data-scrolled={scrolled || undefined} data-menu={open || undefined}>
      <div ref={bar} className={styles.bar}>
        <span className={styles.glass} aria-hidden="true" />
        <a className={styles.brand} href="/" aria-label="Stringham Web Design, home">
          <Logo className={styles.logo} eager />
        </a>
        <button type="button" className={styles.menuBtn} aria-expanded={open} aria-controls="primary-nav" onClick={() => setOpen((o) => !o)}>
          <span className={styles.burger} aria-hidden="true"><i /><i /><i /></span>
          {open ? "Close" : "Menu"}
        </button>
        <nav id="primary-nav" className={styles.nav} aria-label="Primary">
          {navLinks.map((l) => (
            <a key={l.href} className={`${styles.link} ${"featured" in l && l.featured ? styles.featured : ""}`} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
          ))}
        </nav>
        <div className={styles.actions}>
          <a className={styles.phone} href={site.phoneHref}>
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 1.5 6 4.6 4.7 6a8 8 0 0 0 5.3 5.3l1.4-1.3 3.1 1.5-.6 2.6a1.5 1.5 0 0 1-1.6 1.1A13 13 0 0 1 .8 3.7 1.5 1.5 0 0 1 1.9 2.1z" fill="currentColor" /></svg>
            <span>{site.phone}</span>
          </a>
          <a className={`btn ${styles.cta}`} href={action.href} data-track="cta" data-location="header" data-magnetic>
            {action.label}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
          </a>
        </div>
      </div>
    </header>
  );
}
