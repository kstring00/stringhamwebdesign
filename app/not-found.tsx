import type { Metadata } from "next";

import { cta, nav } from "./data/nav";
import styles from "./pages.module.css";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: true } };

export default function NotFound() {
  return (
    <div className={`container ${styles.page}`} style={{ paddingBottom: "var(--section)", minHeight: "70svh" }}>
      <header className={styles.head}>
        <p className={`label ${styles.headLabel}`}><b>404</b> Not here</p>
        <h1 className="display-l">This page wandered off.</h1>
        <p className={`lede ${styles.lede}`}>The link may be old, or the address has a typo. Here's the way home.</p>
      </header>
      <section className={styles.section} aria-label="Where to go">
        <div className={styles.actions}>
          <a className="btn" href="/">Back to the homepage</a>
          {nav.map((n) => <a className="u" key={n.href} href={n.href} style={{ minHeight: 44, display: "inline-flex", alignItems: "center" }}>{n.label}</a>)}
          <a className="u" href={cta.href} style={{ minHeight: 44, display: "inline-flex", alignItems: "center" }}>{cta.label}</a>
        </div>
      </section>
    </div>
  );
}
