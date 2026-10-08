"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

import { cta, partnerCta, partnersLink } from "../data/nav";
import styles from "./Header.module.css";

function subscribeScroll(cb: () => void) {
  window.addEventListener("scroll", cb, { passive: true });
  return () => window.removeEventListener("scroll", cb);
}

/**
 * The logo, one quiet link for partners, and one button. On /partners the
 * button becomes the partnership action and the link points back to the
 * business owners' page.
 */
export default function Header() {
  const scrolled = useSyncExternalStore(subscribeScroll, () => window.scrollY > 24, () => false);
  const onPartners = usePathname() === "/partners";
  const action = onPartners ? partnerCta : cta;
  return (
    <header className={styles.header} data-scrolled={scrolled || undefined}>
      <div className={styles.bar}>
        <a className={styles.brand} href="/">
          <span className={styles.wordmark}>Stringham</span>
          <span className={styles.brandSub}>Web Design</span>
        </a>
        <nav className={styles.nav} aria-label="Primary">
          {onPartners
            ? <a className={`u ${styles.link}`} href="/">For business owners</a>
            : <a className={`u ${styles.link}`} href={partnersLink.href}>{partnersLink.label}</a>}
          <a className={`btn ${styles.cta}`} href={action.href} data-track="cta" data-location="header">{action.label}</a>
        </nav>
      </div>
    </header>
  );
}
