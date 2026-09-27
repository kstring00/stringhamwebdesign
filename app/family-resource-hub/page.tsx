import type { Metadata } from "next";

import { hub } from "../data/hub";
import { site } from "../data/site";
import Magnetic from "../motion/Magnetic";
import styles from "../pages.module.css";

export const metadata: Metadata = {
  title: { absolute: "Family Resource Hub for ABA Clinics | Stringham Web Design" },
  description: "A parent support hub on your clinic's website, under your name and colors, free to every family you serve. Built by an RBT in League City, Texas for ABA and pediatric therapy clinics.",
  alternates: { canonical: "/family-resource-hub" },
};

function Arrow() {
  return <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true"><path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.4" /></svg>;
}

export default function HubPage() {
  return (
    <>
      <div className={`container ${styles.page}`}>
        <header className={styles.head}>
          <p className={`label ${styles.headLabel}`}><b>01</b> Family Resource Hub</p>
          <h1 className="display-l">{hub.h1}</h1>
          <p className={`lede ${styles.lede}`}>{hub.sub}</p>
        </header>

        <section className={styles.section} aria-labelledby="problem-title">
          <div className={styles.two}>
            <div className={styles.sectionHead} style={{ marginBottom: 0 }}>
              <p className="label"><b>02</b> The problem</p>
              <h2 id="problem-title" className="display-m">{hub.problem.title}</h2>
            </div>
            <p className={styles.prose} data-reveal>{hub.problem.body}</p>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="paths-title" style={{ paddingTop: 0 }}>
          <div className={styles.sectionHead}>
            <p className="label"><b>03</b> What parents see</p>
            <h2 id="paths-title" className="display-m">The hub opens with one question: “What do you need today?”</h2>
            <p className={styles.prose}>Then it walks each parent to one next step.</p>
          </div>
          <ul className={styles.tiles} data-reveal-group>
            {hub.paths.map((p) => <li className={styles.tile} key={p} data-reveal>{p}</li>)}
          </ul>
        </section>
      </div>

      <section className={`${styles.section} ink`} aria-labelledby="gets-title">
        <div className="container">
          <div className={styles.sectionHead}>
            <p className="label"><b>04</b> What your clinic gets</p>
            <h2 id="gets-title" className="display-m">Families who stay.</h2>
          </div>
          <ul className={styles.points} data-reveal-group>
            {hub.gets.map((g, i) => (
              <li className={styles.point} key={g.title} data-reveal>
                <span className={styles.pointN} aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <h3>{g.title}</h3>
                <p>{g.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="container">
        <section className={styles.section} aria-labelledby="launch-title">
          <div className={styles.sectionHead}>
            <p className="label"><b>05</b> How it launches</p>
            <h2 id="launch-title" className="display-m">Live in about three weeks.</h2>
          </div>
          <ol className={styles.points} data-reveal-group>
            {hub.launch.map((l, i) => (
              <li className={styles.point} key={l.title} data-reveal>
                <span className={styles.pointN} aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <h3>{l.title}</h3>
                <p>{l.body}</p>
              </li>
            ))}
          </ol>
          <div className={styles.actions} style={{ marginTop: "2.5rem" }} data-reveal>
            <span className={styles.trust}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 1.5l5.5 2.5v4c0 3.2-2.3 5.6-5.5 6.5C4.8 13.6 2.5 11.2 2.5 8V4L8 1.5z" /><path d="M5.5 8l1.8 1.8L10.5 6.5" /></svg>
              {hub.trust}
            </span>
            <span className={styles.trust}>{hub.offer}</span>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="rbt-title" style={{ paddingTop: 0 }}>
          <div className={styles.two}>
            <div className={styles.sectionHead} style={{ marginBottom: 0 }}>
              <p className="label"><b>06</b> Built by an RBT</p>
              <h2 id="rbt-title" className="display-m">I've been in the room.</h2>
            </div>
            <blockquote className={styles.quote} data-reveal>
              “{hub.rbt}”
              <footer>{site.person}, RBT</footer>
            </blockquote>
          </div>
        </section>

        <section className={styles.section} aria-label="Next steps" style={{ paddingTop: 0 }}>
          <div className={styles.actions} data-reveal>
            <Magnetic><a className="btn btn-ember" href={site.demoUrl} target="_blank" rel="noopener noreferrer">See a live demo <Arrow /></a></Magnetic>
            <Magnetic><a className="btn btn-secondary" href="/contact?about=hub">Book a free call</a></Magnetic>
          </div>
        </section>
      </div>
    </>
  );
}
