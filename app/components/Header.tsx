"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

import { cta, nav } from "../data/nav";
import { site } from "../data/site";
import Magnetic from "../motion/Magnetic";
import styles from "./Header.module.css";

function Arrow() {
  return (
    <svg width="16" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
      <path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function subscribeScroll(cb: () => void) {
  window.addEventListener("scroll", cb, { passive: true });
  return () => window.removeEventListener("scroll", cb);
}

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const scrolled = useSyncExternalStore(subscribeScroll, () => window.scrollY > 24, () => false);

  // Close the sheet on navigation (state adjusted during render, not in an effect).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) { setLastPath(pathname); setOpen(false); }
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => { document.documentElement.style.overflow = ""; };
  }, [open]);

  return (
    <header className={styles.header} data-scrolled={scrolled || undefined} data-open={open || undefined}>
      <div className={styles.bar}>
        <a className={styles.brand} href="/">
          <span className={styles.wordmark}>Stringham</span>
          <span className={styles.brandSub}>Web Design</span>
        </a>

        <nav className={styles.nav} aria-label="Primary">
          <ul>
            {nav.map((item) => (
              <li key={item.href}>
                <a className={`u ${styles.link}`} href={item.href} aria-current={pathname === item.href || pathname.startsWith(item.href + "/") ? "page" : undefined}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <a className={styles.phone} href={site.phoneHref} aria-label={`Call Kyle at ${site.phone}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6.2 6.2l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>
          </a>
          <Magnetic strength={0.25}>
            <a className={`btn ${styles.cta}`} href={cta.href}>{cta.label} <Arrow /></a>
          </Magnetic>
          <button className={styles.burger} type="button" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((o) => !o)}>
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <i /><i />
          </button>
        </div>
      </div>

      <div className={styles.sheet} id="mobile-menu" hidden={!open}>
        <nav aria-label="Mobile">
          <ul>
            {nav.map((item, i) => (
              <li key={item.href} style={{ transitionDelay: `${60 + i * 50}ms` }}>
                <a href={item.href} aria-current={pathname === item.href ? "page" : undefined}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.sheetFoot}>
          <a className="btn" href={cta.href}>{cta.label} <Arrow /></a>
          {site.bookingUrl ? <a className={styles.sheetPhone} href={site.bookingUrl} target="_blank" rel="noopener noreferrer">Book a free 30-minute call</a> : null}
          <a className={styles.sheetPhone} href={site.phoneHref} aria-label={`Call Kyle at ${site.phone}`}>{site.phone}</a>
          <a className={styles.sheetPhone} href={`mailto:${site.email}`}>{site.email}</a>
        </div>
      </div>
    </header>
  );
}
