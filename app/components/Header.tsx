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
 * at the bottom of the screen, within thumb reach: it slides away while you
 * scroll down or type in a form, and comes back when you scroll up. Also on
 * phones, the header's button waits until the hero's own button has scrolled
 * away, so the first screen has one action. Reduced motion: no slide, no
 * highlight.
 *
 * DOM order is logo, switch, action, the same as what you see on desktop,
 * so the tab order follows it. The glass is a separate backdrop layer, so
 * nothing above the switch has a filter and it can still dock on phones.
 */
export default function Header() {
  const scrolled = useSyncExternalStore(subscribeScroll, () => window.scrollY > 24, () => false);
  const pathname = usePathname();
  const view = pathname.startsWith("/partners") ? "partners" : "business";
  const action = view === "partners" ? partnerCta : cta;
  const header = useRef<HTMLElement>(null);
  const bar = useRef<HTMLDivElement>(null);

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

  // Phones: the dock slides away while scrolling down and returns on the way
  // up, near the top, and at the very bottom (so the footer stays reachable).
  useEffect(() => {
    const el = header.current;
    if (!el) return;
    let last = window.scrollY, raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const atEnd = y + window.innerHeight >= document.documentElement.scrollHeight - 80;
      if (y < 120 || atEnd || y < last - 6) delete el.dataset.dockHidden;
      else if (y > last + 6) el.dataset.dockHidden = "1";
      if (Math.abs(y - last) > 6) last = y;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);

  // Phones: the header's button shows once the hero's own button is out of view.
  useEffect(() => {
    const el = header.current;
    if (!el) return;
    delete el.dataset.heroPassed;
    const ctas = [...document.querySelectorAll("[data-hero-cta]")];
    if (!ctas.length) return;
    const seen = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) { if (e.isIntersecting) seen.add(e.target); else seen.delete(e.target); }
      if (seen.size) delete el.dataset.heroPassed; else el.dataset.heroPassed = "1";
    }, { rootMargin: "-64px 0px 0px 0px" });
    ctas.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [pathname]);

  return (
    <header ref={header} className={styles.header} data-view={view} data-scrolled={scrolled || undefined}>
      <div ref={bar} className={styles.bar}>
        <span className={styles.glass} aria-hidden="true" />
        <a className={styles.brand} href="/">
          <span className={styles.wordmark}>Stringham</span>
          <span className={styles.brandSub}>Web Design</span>
        </a>
        <nav className={styles.switch} aria-label="Primary">
          <span className={styles.indicator} aria-hidden="true"><span className={styles.blob} /></span>
          {VIEWS.map((v) => (
            <a key={v.key} className={styles.seg} href={v.href} data-active={v.key === view || undefined} aria-current={v.key === view ? (pathname === v.href ? "page" : "true") : undefined}>
              <span className={styles.dot} aria-hidden="true" />
              {v.label}
            </a>
          ))}
        </nav>
        <a className={`btn ${styles.cta}`} href={action.href} data-track="cta" data-location="header">
          {action.label}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
        </a>
      </div>
    </header>
  );
}
