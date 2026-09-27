import type { Metadata } from "next";

import { projects } from "../data/projects";
import ClosingCta from "../home/ClosingCta";
import styles from "../pages.module.css";

export const metadata: Metadata = {
  title: "Web Design Work for Clinics, Shops and Apps | League City, TX",
  description: "Real websites built by Stringham Web Design in League City, Texas: a parent navigation hub for autism families, an exam-prep storefront, and a local-first journaling app.",
  alternates: { canonical: "/work" },
};

export default function WorkPage() {
  return (
    <>
      <div className={`container ${styles.page}`}>
        <header className={styles.head}>
          <p className={`label ${styles.headLabel}`}><b>01</b> Work</p>
          <h1 className="display-l">Built for real businesses.</h1>
          <p className={`lede ${styles.lede}`}>Every one of these is live. Every screenshot is the real site.</p>
        </header>
        <section className={styles.section} aria-label="Projects">
          <div className={styles.cards} data-reveal-group>
            {projects.map((p) => (
              <a className={styles.card} href={p.href} target="_blank" rel="noopener noreferrer" key={p.slug} data-reveal data-cursor="view">
                <div className={`frame ${styles.cardFrame}`}>
                  <img src={p.image.src} alt={p.image.alt} width={p.image.width} height={p.image.height} loading="lazy" decoding="async" />
                </div>
                <div className={styles.cardMeta}>
                  <span className={styles.cardName}>{p.name}</span>
                  <span className={styles.cardCat}>{p.category}</span>
                  <span className={styles.cardLine}>{p.line}</span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>
      <ClosingCta line="Yours next." />
    </>
  );
}
