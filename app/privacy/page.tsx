import type { Metadata } from "next";

import Header from "../Header";
import headerStyles from "../Header.module.css";
import SiteFooter from "../SiteFooter";
import { contactEmail } from "../data/nav";
import styles from "../resources/resources.module.css";
import "../resources/prose.css";
import { LAST_UPDATED, getPrivacyDoc, lastUpdatedLabel } from "./lib";

/**
 * /privacy. Wears the /resources document layout and prose styles, because it
 * is the same kind of thing: a plain-English document you read start to
 * finish. The copy lives in content/privacy.md.
 */

export const metadata: Metadata = {
  title: "Privacy policy — Stringham Web Design, League City",
  description:
    "What Kyle Stringham collects through this site and why, who else handles it, how long it is kept, and how to have it deleted. Plain English, no legalese.",
};

function Arrow() {
  return (
    <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
      <path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export default function PrivacyPage() {
  const doc = getPrivacyDoc();

  return (
    <>
      <Header />
      <main className={styles.page}>
        <article className={styles.doc}>
          <header className={styles.docHead}>
            <div className={styles.inner}>
              <p className={styles.signal} data-hero>
                Legal &middot; Privacy
              </p>
              <h1 data-hero>{doc.title}</h1>
              <p className={styles.docMeta} data-hero>
                Last updated{" "}
                <time dateTime={LAST_UPDATED}>{lastUpdatedLabel()}</time>
              </p>
              <hr className={styles.rule} data-rule />
            </div>
          </header>

          {/* content/privacy.md, rendered as written. See lib.ts for the only
              structural edits made to it. */}
          <div className={styles.inner}>
            <div
              className={`${styles.prose} resourceProse`}
              dangerouslySetInnerHTML={{ __html: doc.html }}
            />
          </div>

          <footer className={styles.docFoot}>
            <div className={styles.inner}>
              <hr className={styles.rule} data-rule />
              <div className={styles.cta} data-reveal-group>
                <p className={styles.ctaLine} data-reveal>
                  Question about any of this? Just ask.
                </p>
                <a
                  className={headerStyles.getStarted}
                  href={`mailto:${contactEmail}`}
                  data-reveal
                >
                  <span>Email me</span>
                  <Arrow />
                </a>
              </div>
            </div>
          </footer>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
