import type { Metadata } from "next";

import ClosingCta from "../home/ClosingCta";
import styles from "../pages.module.css";

export const metadata: Metadata = {
  title: "About Kyle Stringham, Web Designer in League City, TX",
  description: "Kyle Stringham runs Stringham Web Design LLC in League City, Texas. A Registered Behavior Technician with a psychology degree, building custom websites you own outright.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <div className={`container ${styles.page}`}>
        <header className={styles.head}>
          <p className={`label ${styles.headLabel}`}><b>01</b> About</p>
          <h1 className="display-l">Attention is the whole job.</h1>
        </header>
        <section className={styles.section} aria-label="Kyle Stringham">
          <div className={styles.two}>
            <div className={`frame ${styles.portrait}`} data-reveal>
              <img src="/about/portrait.webp" alt="Kyle Stringham, photographed head-on against a plain wall, looking at the camera with a slight smile" width="760" height="950" loading="eager" fetchPriority="high" decoding="async" />
            </div>
            <div className={styles.prose} data-reveal-group>
              <p data-reveal>I'm Kyle Stringham. I run Stringham Web Design LLC out of League City, Texas. By day I'm a Registered Behavior Technician working with autistic kids and their families, and I have a degree in psychology.</p>
              <p data-reveal>That work taught me to pay attention to people, and it's how I build websites. I believe in an equal exchange: fair prices, honest timelines, and work you own outright.</p>
              <p data-reveal>My faith shapes how I work, and I want everything I build to serve people well.</p>
            </div>
          </div>
        </section>
      </div>
      <ClosingCta />
    </>
  );
}
