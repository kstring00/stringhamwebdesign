import type { Metadata } from "next";

import { pageMeta } from "../data/meta";
import { site } from "../data/site";
import ClosingCta from "../home/ClosingCta";
import { Pieces } from "../motifs/Motifs";
import Magnetic from "../motion/Magnetic";
import styles from "../niche.module.css";
import PiecesStory from "./PiecesStory";

export const metadata: Metadata = pageMeta({
  absolute: "Websites for ABA & Autism Therapy Clinics | Stringham Web Design, Texas",
  description: "Websites and parent support for independent ABA and pediatric therapy clinics in Texas, built by a Registered Behavior Technician: a Family Resource Hub, clear first steps for parents, and careers pages that recruit.",
  path: "/autism-clinics",
  image: "/og/autism-clinics.png",
});

function Arrow() {
  return <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true"><path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.4" /></svg>;
}

export default function AutismClinicsPage() {
  const book = site.bookingUrl || "/contact?about=clinic";
  const bookExternal = Boolean(site.bookingUrl);
  return (
    <div className="world-clinic">
      <section className={`${styles.hero} tinted`} aria-labelledby="clinic-h1">
        <div className={`container ${styles.heroGrid}`}>
          <div className={styles.heroText}>
            <p className="label"><b>01</b> For autism clinics</p>
            <h1 id="clinic-h1" className={`display-l ${styles.h1}`}>Families stay where they feel cared for.</h1>
            <p className={`lede ${styles.lede}`}>Websites and parent support for independent ABA and pediatric therapy clinics, built by an RBT.</p>
            <div className={styles.actions}>
              <Magnetic><a className={`btn ${styles.btnWorld}`} href={book} {...(bookExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}>Book a free call <Arrow /></a></Magnetic>
              <Magnetic><a className={`btn btn-secondary ${styles.btnWorldLine}`} href={site.demoUrl} target="_blank" rel="noopener noreferrer">See the live demo<span className="sr-only"> (opens in a new tab)</span></a></Magnetic>
            </div>
          </div>
          <div className={styles.heroArt} aria-hidden="true">
            <Pieces mode="load" className={styles.heroPieces} />
          </div>
        </div>
      </section>

      <PiecesStory />

      <section className={`${styles.section} tinted`} aria-labelledby="offers-title">
        <div className="container">
          <div className={styles.sectionHead}>
            <p className="label"><b>03</b> Two ways I help clinics</p>
            <h2 id="offers-title" className="display-m">Support for families, and a front door for your clinic.</h2>
          </div>
          <div className={styles.offers}>
            <article className={styles.offer} data-reveal>
              <h3 className={styles.offerTitle}>Family Resource Hub</h3>
              <p className={styles.offerBody}>A parent support hub on your site, free to every family you serve.</p>
              <div className={styles.offerLinks}>
                <a className={`btn ${styles.btnWorld}`} href="/family-resource-hub">About the hub <Arrow /></a>
                <a className={`u ${styles.textLink}`} href={site.demoUrl} target="_blank" rel="noopener noreferrer">See the live demo<span className="sr-only"> (opens in a new tab)</span></a>
              </div>
            </article>
            <article className={styles.offer} data-reveal>
              <h3 className={styles.offerTitle}>Clinic websites</h3>
              <p className={styles.offerBody}>A clear first step for worried parents, insurance and getting-started info, and a careers page that recruits RBTs and BCBAs.</p>
              <div className={styles.offerLinks}>
                <a className={`btn ${styles.btnWorld}`} href="/contact?about=clinic">Start a project <Arrow /></a>
              </div>
            </article>
          </div>
          <p className={styles.trust}>
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 1.5l5.5 2.5v4c0 3.2-2.3 5.6-5.5 6.5C4.8 13.6 2.5 11.2 2.5 8V4L8 1.5z" /><path d="M5.5 8l1.8 1.8L10.5 6.5" /></svg>
            Educational only. The hub collects no child or health information.
          </p>
        </div>
      </section>

      <section className={styles.section} aria-label="Next steps">
        <div className={`container ${styles.actions}`}>
          <Magnetic><a className={`btn ${styles.btnWorld}`} href={book} {...(bookExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}>Book a free call <Arrow /></a></Magnetic>
          <a className={`u ${styles.textLink}`} href="/family-resource-hub">Read about the Family Resource Hub</a>
        </div>
      </section>

      <ClosingCta />
    </div>
  );
}
