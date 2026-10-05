"use client";

import { useSyncExternalStore } from "react";

import { cta } from "../data/nav";
import styles from "./Header.module.css";

function subscribeScroll(cb: () => void) {
  window.addEventListener("scroll", cb, { passive: true });
  return () => window.removeEventListener("scroll", cb);
}

/** The logo and one button. Nothing else to decide. */
export default function Header() {
  const scrolled = useSyncExternalStore(subscribeScroll, () => window.scrollY > 24, () => false);
  return (
    <header className={styles.header} data-scrolled={scrolled || undefined}>
      <div className={styles.bar}>
        <a className={styles.brand} href="/">
          <span className={styles.wordmark}>Stringham</span>
          <span className={styles.brandSub}>Web Design LLC</span>
        </a>
        <nav className={styles.nav} aria-label="Primary">
          <a className={`btn ${styles.cta}`} href={cta.href} data-track="cta" data-location="header">{cta.label}</a>
        </nav>
      </div>
    </header>
  );
}
