import type { Metadata } from "next";

import { cta, nav } from "./data/nav";
import { roughRect } from "./motifs/sketch";
import sk from "./motifs/sketch.module.css";
import styles from "./pages.module.css";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: true } };

export default function NotFound() {
  return (
    <div className={`container ${styles.page}`} style={{ paddingBottom: "var(--section)", minHeight: "70svh" }}>
      <header className={styles.head} style={{ position: "relative" }}>
        <svg viewBox="0 0 1000 300" preserveAspectRatio="none" aria-hidden="true" focusable="false" style={{ position: "absolute", inset: "-1rem -2rem", width: "calc(100% + 4rem)", height: "calc(100% + 2rem)", pointerEvents: "none" }}>
          <path className={sk.pencil} d={roughRect(8, 8, 984, 284, 404, 2.4)} />
        </svg>
        <p className={`label ${styles.headLabel}`}><b>404</b> Not here</p>
        <h1 className="display-l">This page is still a sketch.</h1>
        <p className={`lede ${styles.lede}`}>The link may be old, or the address has a typo. Here&rsquo;s the way back.</p>
      </header>
      <section className={styles.section} aria-label="Where to go">
        <div className={styles.actions}>
          <a className="btn" href="/">Back to the homepage</a>
          {nav.map((n) => <a className={`u ${styles.textLink}`} key={n.href} href={n.href}>{n.label}</a>)}
          <a className={`u ${styles.textLink}`} href={cta.href}>{cta.label}</a>
        </div>
      </section>
    </div>
  );
}
