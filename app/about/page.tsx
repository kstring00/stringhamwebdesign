import type { Metadata } from "next";
import Image from "next/image";

import { PersonJsonLd } from "../components/JsonLd";
import { pageMeta } from "../data/meta";
import ClosingCta from "../home/ClosingCta";
import styles from "../pages.module.css";

export const metadata: Metadata = pageMeta({ title: "About Kyle Stringham, Web Designer in League City, TX", description: "Kyle Stringham runs Stringham Web Design LLC in League City, Texas. A former Starbucks barista and a Registered Behavior Technician who helps people turn ideas into businesses that work: the website, the ordering, the payments, and everything in between.", path: "/about" });

export default function AboutPage() {
  return (
    <>
      <div className={`container ${styles.page}`}>
        <header className={styles.head}>
          <p className={`label ${styles.headLabel}`}><b>01</b> About</p>
          <h1 className="display-l">Listen first. Build for real people.</h1>
        </header>
        <section className={styles.section} aria-label="Kyle Stringham">
          <div className={styles.two}>
            <div className={`frame ${styles.portrait}`} data-reveal>
              <Image src="/about/portrait.webp" alt="Kyle Stringham, photographed head-on against a plain wall, looking at the camera with a slight smile" width={760} height={950} sizes="(max-width: 64rem) 100vw, 45vw" priority />
            </div>
            <div className={styles.prose} data-reveal-group>
              <p data-reveal>I&rsquo;m Kyle Stringham. I run Stringham Web Design LLC out of League City, Texas. I&rsquo;ve worked behind a Starbucks counter, and today I work with autistic kids and their families as a Registered Behavior Technician. I have a degree in psychology. Both taught me to listen first and build for real people.</p>
              <p data-reveal>I help people turn ideas into businesses that work: the website, the ordering, the payments, and everything in between.</p>
              <p data-reveal>I believe in an equal exchange: fair prices, honest timelines, and work you own outright. My faith shapes how I work, and I want everything I build to serve people well.</p>
            </div>
          </div>
        </section>
      </div>
      <ClosingCta />
      <PersonJsonLd />
    </>
  );
}
