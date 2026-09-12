import type { Metadata } from "next";
import Link from "next/link";

import Header from "../Header";
import SiteFooter from "../SiteFooter";
import { getResources, signal } from "./lib";
import styles from "./resources.module.css";

export const metadata: Metadata = {
  title: "Resources — Stringham Web Design, League City",
  description:
    "Five plain-English guides to working with Kyle Stringham on a website: what happens step by step, who owns what, what it costs to keep running, what to send, and the words you will hear.",
};

function Arrow() {
  return (
    <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
      <path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export default function ResourcesPage() {
  const resources = getResources();

  return (
    <>
      <Header />
      <main className={styles.page}>
        <section className={styles.hero} aria-labelledby="resources-title">
          <div className={styles.inner}>
            <p className={styles.signal} data-hero>Resources</p>
            <h1 id="resources-title" data-hero>
              Everything I&rsquo;d tell you <em>before</em> we start.
            </h1>
            <p className={styles.lede} data-hero>
              Five short reads on how a project with me actually works, written so
              you can check any of it later. None of it is a sales page.
            </p>
            <hr className={styles.rule} data-rule />
          </div>
        </section>

        <section className={styles.index} aria-label="The five resources">
          <div className={styles.inner}>
            <ol className={styles.cards} data-reveal-group>
              {resources.map((r) => (
                <li className={styles.card} key={r.slug} data-reveal>
                  <Link className={styles.cardLink} href={`/resources/${r.slug}`}>
                    <span className={styles.cardSignal}>{signal(r.number)}</span>
                    <span className={styles.cardBody}>
                      <span className={styles.cardTitle}>{r.title}</span>
                      <span className={styles.cardSummary}>{r.summary}</span>
                      <span className={styles.cardMeta}>
                        <span className={styles.cardRead}>
                          Read <Arrow />
                        </span>
                        <span className={styles.cardTime}>{r.minutes} min</span>
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
