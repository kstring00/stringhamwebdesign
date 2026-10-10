"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

import { cta, partnerCta } from "../data/nav";
import styles from "./Header.module.css";

function subscribeScroll(cb: () => void) {
  window.addEventListener("scroll", cb, { passive: true });
  return () => window.removeEventListener("scroll", cb);
}

/** The two sides of the site. Everything except /partners is the business view. */
const VIEWS = [
  { key: "business", label: "For businesses", href: "/" },
  { key: "partners", label: "For partners", href: "/partners" },
] as const;

const VIEW_KEY = "swd-view";

/**
 * A liquid-glass capsule (logo and the one action) and a two-way switch,
 * For businesses / For partners, so a visitor always knows which side of
 * the site they're on. Each view has its own accent (green for businesses,
 * violet for partners) on the switch, the rim of the glass and the button.
 *
 * The switch's glass indicator slides between the views. Browsers with
 * cross-document view transitions morph it between pages (globals.css);
 * elsewhere it replays the slide on arrival from where it was. A soft
 * highlight follows the pointer across the glass. On phones the switch docks
 * at the bottom of the screen, within thumb reach, and steps aside while a
 * form field is being typed in. Reduced motion: no slide, no highlight.
 */
export default function Header() {
  const scrolled = useSyncExternalStore(subscribeScroll, () => window.scrollY > 24, () => false);
  const pathname = usePathname();
  const view = pathname.startsWith("/partners") ? "partners" : "business";
  const action = view === "partners" ? partnerCta : cta;
  const header = useRef<HTMLElement>(null);
  const glass = useRef<HTMLDivElement>(null);

  // Arriving from the other view: start the indicator where it was, then let it slide.
  useEffect(() => {
    const el = header.current;
    if (!el) return;
    let from: string | null = null;
    try { from = sessionStorage.getItem(VIEW_KEY); sessionStorage.setItem(VIEW_KEY, view); } catch { /* no storage: no replay */ }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const morphs = "onpagereveal" in window; // cross-document view transitions already animate it
    if (!from || from === view || reduced || morphs) return;
    el.dataset.from = from;
    let raf = requestAnimationFrame(() => { raf = requestAnimationFrame(() => { delete el.dataset.from; el.dataset.travel = "1"; }); });
    const done = window.setTimeout(() => { delete el.dataset.travel; }, 900);
    return () => { cancelAnimationFrame(raf); window.clearTimeout(done); };
  }, [view]);

  // The highlight follows the pointer across the glass.
  useEffect(() => {
    const el = glass.current;
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

  // Phones: the docked switch steps aside while someone is typing in a form.
  useEffect(() => {
    const el = header.current;
    if (!el) return;
    const isField = (t: EventTarget | null) => t instanceof HTMLElement && t.matches("input, textarea, select");
    const onIn = (e: FocusEvent) => { if (isField(e.target)) el.dataset.typing = "1"; };
    const onOut = (e: FocusEvent) => { if (isField(e.target)) delete el.dataset.typing; };
    document.addEventListener("focusin", onIn);
    document.addEventListener("focusout", onOut);
    return () => { document.removeEventListener("focusin", onIn); document.removeEventListener("focusout", onOut); };
  }, []);

  return (
    <header ref={header} className={styles.header} data-view={view} data-scrolled={scrolled || undefined}>
      <div ref={glass} className={styles.glass}>
        <a className={styles.brand} href="/">
          <span className={styles.wordmark}>Stringham</span>
          <span className={styles.brandSub}>Web Design</span>
        </a>
        <a className={`btn ${styles.cta}`} href={action.href} data-track="cta" data-location="header">
          {action.label}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
        </a>
      </div>
      <nav className={styles.switch} aria-label="Primary">
        <span className={styles.indicator} aria-hidden="true"><span className={styles.blob} /></span>
        {VIEWS.map((v) => (
          <a key={v.key} className={styles.seg} href={v.href} data-active={v.key === view || undefined} aria-current={v.key === view ? (pathname === v.href ? "page" : "true") : undefined}>
            <span className={styles.dot} aria-hidden="true" />
            {v.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
