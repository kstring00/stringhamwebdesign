import type { Metadata } from "next";

import { pageMeta } from "../data/meta";
import styles from "../pages.module.css";
import local from "./privacy.module.css";
import { LAST_UPDATED, getPrivacyDoc, lastUpdatedLabel } from "./lib";

export const metadata: Metadata = {
  ...pageMeta({ absolute: "Privacy Policy | Stringham Web Design, League City, TX", description: "What Stringham Web Design, a web design studio in League City, Texas, collects through this site, why, who else handles it, and how to have it deleted.", path: "/privacy" }),
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  const doc = getPrivacyDoc();
  return (
    <div className={`container ${styles.page}`} style={{ paddingBottom: "var(--section)" }}>
      <header className={styles.head}>
        <p className={`label ${styles.headLabel}`}><b>01</b> Legal</p>
        <h1 className="display-l">{doc.title}</h1>
        <p className={`lede ${styles.lede}`}>Last updated <time dateTime={LAST_UPDATED}>{lastUpdatedLabel()}</time></p>
      </header>
      <div className={local.prose} dangerouslySetInnerHTML={{ __html: doc.html }} />
    </div>
  );
}
