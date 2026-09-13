import type { Metadata } from "next";
import Link from "next/link";

import Header from "./Header";
import headerStyles from "./Header.module.css";
import SiteFooter from "./SiteFooter";
import { siteNav } from "./data/nav";
import styles from "./NotFound.module.css";

export const metadata: Metadata = {
  title: "Page not found — Stringham Web Design",
  robots: { index: false, follow: true },
};

function Arrow() {
  return (
    <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
      <path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

/**
 * The 404. Same masthead and footer as every other page, the site's own type
 * and colour, one line that says what happened, and the five places a person
 * was most likely trying to reach. Nothing here pretends to be an error
 * console or a joke; it just gets them back on the site.
 */
export default function NotFound() {
  return (
    <>
      <Header />
      <main className={styles.page}>
        <div className={styles.inner}>
          <p className={styles.signal}>404 &middot; No page here</p>
          <h1>That page isn&apos;t here.</h1>
          <p className={styles.lede}>
            The link may be old, or the address may have a typo in it. Nothing
            you sent is lost. Here&apos;s where you were probably headed.
          </p>

          <nav className={styles.routes} aria-label="Main pages">
            <ul>
              {siteNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.actions}>
            <Link className={headerStyles.getStarted} href="/quote">
              <span>Start a project</span>
              <span className={headerStyles.arrowShell} aria-hidden="true"><Arrow /></span>
            </Link>
            <Link className={styles.secondary} href="/">
              Back to the homepage
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
