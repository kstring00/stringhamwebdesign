import type { Metadata } from "next";

import { cta } from "./data/nav";
import styles from "./pages.module.css";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: true } };

export default function NotFound() {
  return (
    <div className={`container ${styles.page}`} style={{ paddingBottom: "var(--section)", minHeight: "60svh" }}>
      <header className={styles.head}>
        <p className={`label ${styles.headLabel}`}>404</p>
        <h1 className="display-l">That page isn&rsquo;t here.</h1>
        <p className={`lede ${styles.lede}`}>The link may be old or have a typo. The home page has everything, including the free check.</p>
      </header>
      <section className={styles.section} aria-label="Where to go">
        <div className={styles.actions}>
          <a className="btn" href="/">Back to the home page</a>
          <a className={`u ${styles.textLink}`} href={cta.href}>{cta.label}</a>
        </div>
      </section>
    </div>
  );
}
