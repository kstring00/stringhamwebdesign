import type { Metadata } from "next";

import { pageMeta } from "../data/meta";
import styles from "../pages.module.css";
import local from "../privacy/privacy.module.css";
import { getTermsDoc } from "./lib";

export const metadata: Metadata = {
  ...pageMeta({ absolute: "Service Terms | Stringham Web Design, League City, TX", description: "The terms for a Listing Fix, a website, or a Monthly Plan from Stringham Web Design LLC, League City, Texas: what's included, timelines, your part, refunds, and what we can't promise.", path: "/terms" }),
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  const doc = getTermsDoc();
  return (
    <div className={`container ${styles.page}`} style={{ paddingBottom: "var(--section)" }}>
      <header className={styles.head}>
        <p className={`label ${styles.headLabel}`}><b>01</b> Legal</p>
        <h1 className="display-l">{doc.title}</h1>
      </header>
      <div className={local.prose} dangerouslySetInnerHTML={{ __html: doc.html }} />
    </div>
  );
}
