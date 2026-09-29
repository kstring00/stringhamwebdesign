import type { Metadata } from "next";

import { pageMeta } from "../data/meta";
import { hub } from "../data/hub";
import { site } from "../data/site";
import Magnetic from "../motion/Magnetic";
import styles from "../pages.module.css";

export const metadata: Metadata = pageMeta({ absolute: "Family Resource Hub for ABA Clinics | Stringham Web Design", description: "A parent support hub on your clinic's website, under your name and colors, free to every family you serve. Built by an RBT in League City, Texas for ABA and pediatric therapy clinics.", path: "/family-resource-hub" });

function Arrow() {
  return <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true"><path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.4" /></svg>;
}

export default function HubPage() {
  // Optional blocks render only once Kyle fills them in, so section numbers
  // after "How it launches" (05) are counted rather than hard-coded.
  const answered = hub.clinicQuestions.filter((item) => item.a.trim());
  let next = 5;
  const n = () => String(++next).padStart(2, "0");
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
            <p className={styles.prose} data-reveal>
              {hub.problem.before} (<a className={styles.cite} href={hub.problem.citation.href} target="_blank" rel="noopener noreferrer" title={hub.problem.citation.full}>{hub.problem.citation.short}<span className="sr-only">: {hub.problem.citation.full} Opens in a new tab.</span></a>). {hub.problem.after}
            </p>
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
            <p className="label"><b>04</b> For your clinic</p>
            <h2 id="gets-title" className="display-m">What your clinic gets.</h2>
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

        {answered.length ? (
          <section className={styles.section} aria-labelledby="clinic-qa-title" style={{ paddingTop: 0 }}>
            <div className={styles.two}>
              <div className={styles.sectionHead} style={{ marginBottom: 0 }}>
                <p className="label"><b>{n()}</b> Questions</p>
                <h2 id="clinic-qa-title" className="display-m">Questions clinics ask.</h2>
              </div>
              <dl className={styles.qa} data-reveal-group>
                {answered.map((item) => (
                  <div className={styles.qaItem} key={item.q} data-reveal>
                    <dt>{item.q}</dt>
                    <dd>{item.a}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        ) : null}

        {hub.parentQuote.text.trim() ? (
          <section className={styles.section} aria-label="From a parent" style={{ paddingTop: 0 }}>
            <blockquote className={styles.quote} data-reveal>
              “{hub.parentQuote.text.trim()}”
              {hub.parentQuote.attribution.trim() ? <footer>{hub.parentQuote.attribution.trim()}</footer> : null}
            </blockquote>
          </section>
        ) : null}

        <section className={styles.section} aria-labelledby="rbt-title" style={{ paddingTop: 0 }}>
          <div className={styles.two}>
            <div className={styles.sectionHead} style={{ marginBottom: 0 }}>
              <p className="label"><b>{n()}</b> Built by an RBT</p>
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
            {site.bookingUrl ? (
              <>
                <Magnetic><a className="btn btn-secondary" href={site.bookingUrl} target="_blank" rel="noopener noreferrer">Book a free call</a></Magnetic>
                <a className={`u ${styles.textLink}`} href="/contact?about=hub">Or send a message</a>
              </>
            ) : (
              <Magnetic><a className="btn btn-secondary" href="/contact?about=hub">Book a free call</a></Magnetic>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
