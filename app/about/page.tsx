import type { Metadata } from "next";

import Header from "../Header";
import headerStyles from "../Header.module.css";
import SiteFooter from "../SiteFooter";
import ParticleHeadshot from "./ParticleHeadshot";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "About Kyle Stringham — Web Design & Development",
  description:
    "About Kyle Stringham, a web designer and developer in League City, Texas, building thoughtful custom websites for small businesses.",
};

function Arrow() {
  return (
    <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
      <path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

const TRUST = [
  { label: "Strategic thinking", icon: <path d="M2 5.5h8v8H2zM6 2h8v8" /> },
  { label: "Clean development", icon: <path d="M5 3L1 8l4 5M11 3l4 5-4 5M9.5 2l-3 12" /> },
  { label: "Real results", icon: <path d="M2 14V9M6 14V5M10 14V7M14 14V2" /> },
];

/* Line icons in the site's one style: a 16-unit box, one stroke weight. */
const FACTS = [
  {
    label: "League City, Texas",
    detail: "serving Houston-area businesses",
    icon: <><path d="M8 14.5s-4.5-4.2-4.5-7.5a4.5 4.5 0 0 1 9 0c0 3.3-4.5 7.5-4.5 7.5z" /><circle cx="8" cy="7" r="1.6" /></>,
  },
  {
    label: "RBT, Texas ABA Centers",
    detail: "where Common Ground started",
    icon: <><rect x="2" y="5" width="12" height="8.5" rx="1.5" /><path d="M5.5 5V3.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V5M2 8.5h12" /></>,
  },
  {
    label: "Projects from $900",
    detail: "fixed price, in writing",
    icon: <><path d="M2 8.5V3a1 1 0 0 1 1-1h5.5l5.5 5.5-6 6L2 8.5z" /><circle cx="5.5" cy="5.5" r="1" /></>,
  },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className={styles.page}>
        <section className={styles.hero} aria-labelledby="about-title">
          {/* Sunrise over a sea of cloud. Bright across the top, so the scrim
              below does more work than a deepening pass — the copy sits on
              the photograph and the gradient keeps it readable. Eager and
              high priority: LCP element. */}
          <img
            className={styles.heroImage}
            src="/about/hero-mountains.webp"
            srcSet="/about/hero-mountains-900.webp 900w, /about/hero-mountains-1280.webp 1280w, /about/hero-mountains.webp 2000w"
            sizes="100vw"
            alt=""
            width="2000"
            height="1333"
            fetchPriority="high"
            decoding="async"
          />
          <span className={styles.heroScrim} aria-hidden="true" />

          <div className={`${styles.heroInner} ${styles.heroGrid}`}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow} data-hero>
                02 / The person <span className={styles.eyebrowRule} aria-hidden="true" data-rule />
              </p>
              <h1 id="about-title" data-hero>
                I build websites for people who are busy doing <em>the real work.</em>
              </h1>
              <p className={styles.lede} data-hero>
                Clean systems. Thoughtful design. Real functionality. Built with purpose,
                not just profit.
              </p>

              <div className={styles.heroActions} data-hero>
                <a className={headerStyles.getStarted} href="/quote">
                  <span>Start a project</span>
                  <span className={headerStyles.arrowShell} aria-hidden="true"><Arrow /></span>
                </a>
                <a className={styles.heroSecondary} href="#how">
                  My approach
                </a>
              </div>

              <ul className={styles.heroTrust} data-hero aria-label="How I work">
                {TRUST.map((item) => (
                  <li key={item.label}>
                    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      {item.icon}
                    </svg>
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* The headshot. A plain image for everyone; on desktop with a mouse,
                after load, the particle version fades in over it. */}
            <div className={styles.heroMedia} data-hero="media">
              <ParticleHeadshot />
            </div>
          </div>
        </section>

        {/* The body: a 12-column grid. Labels sit in columns 1–2 and stick
            beside their section; copy runs in 3–8; the portrait, facts and a
            text link stick in 10–12. Below 1024px it is one column, photo
            first, and nothing sticks. */}
        <article className={styles.body}>
          <aside className={styles.sidebar} aria-label="At a glance" data-reveal-group>
            <figure className={styles.portrait} data-reveal>
              <img
                src="/about/portrait.webp"
                alt="Kyle Stringham, photographed head-on against a plain wall, looking at the camera with a slight smile"
                width="760"
                height="950"
                loading="lazy"
                decoding="async"
              />
              <figcaption>Kyle Stringham — Web Design &amp; Development · League City, Texas</figcaption>
            </figure>

            <hr className={styles.sideRule} data-rule />

            <ul className={styles.facts} data-reveal>
              {FACTS.map((fact) => (
                <li key={fact.label}>
                  <span className={styles.factIcon}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      {fact.icon}
                    </svg>
                  </span>
                  <span>
                    <strong>{fact.label}</strong>
                    <small>{fact.detail}</small>
                  </span>
                </li>
              ))}
            </ul>

            <a className={styles.sideLink} href="/quote" data-reveal>
              Start a project <Arrow />
            </a>
          </aside>

          <section className={styles.sec} aria-label="How it started">
            <p className={styles.label}><span>How it started</span></p>
            <div className={styles.secBody}>
              <div className={styles.prose} data-reveal-group>
                <p data-reveal>
                  I&apos;m a Registered Behavior Technician at Texas ABA Centers. I work with
                  kids on the autism spectrum, and I work with their parents.
                </p>
                <p data-reveal>
                  Early on I noticed something the job description didn&apos;t cover: the
                  parents were carrying loads nobody had prepared them for. Paperwork,
                  waitlists, insurance, school meetings, and a hundred questions with no clear
                  place to ask them. So I built one. Common Ground is a resource site for
                  those families, and it grew from a side project into something clinical
                  leadership is now helping develop.
                </p>
                <h2 className={styles.pull} data-reveal>
                  Nine months ago I didn&apos;t know how to do any of this.
                </h2>
                <p data-reveal>
                  I had no coding experience when I started it. What I had was a problem I
                  could see clearly and the stubbornness to keep going until it worked.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.sec} aria-label="Why I do this">
            <p className={styles.label}><span>Why I do this</span></p>
            <div className={styles.secBody}>
              <div className={styles.prose} data-reveal-group>
                <p data-reveal>
                  There&apos;s a moment I&apos;ve never gotten tired of. Someone tells me what
                  they wish they had, they assume it&apos;s out of reach, and then I show it to
                  them, working, on their phone. The look on their face is the whole reason.
                </p>
                <p data-reveal>
                  Most of my portfolio is that moment, repeated. A resource site for parents.
                  A prep site for a behavior analyst. A site for a life coach. People inside my
                  own circle who needed something and didn&apos;t know where to start.
                  That&apos;s where I want to spend my career, and I&apos;d like to spend some of
                  it on your project.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.sec} id="how" aria-label="How I work">
            <p className={styles.label}><span>How I work</span></p>
            <div className={styles.secBody}>
              <div className={styles.prose} data-reveal-group>
                <h2 className={`${styles.pull} ${styles.pillar}`} data-reveal>
                  Equal exchange. That&apos;s the pillar.
                </h2>

                <h3 className={styles.sub} data-reveal>How I price</h3>
                <p data-reveal>
                  I don&apos;t believe in charging what the market will bear. I believe in an
                  even exchange.
                </p>
                <p data-reveal>
                  That means I build something that adds real value to your business, and
                  the number on the quote reflects that value, fairly, for both of us. No
                  inflated agency rates. No cutting corners to hit a lowball. If the site
                  isn&apos;t worth what I&apos;m asking, I haven&apos;t scoped it right.
                </p>
                <p data-reveal>
                  Every project gets a fixed price in writing before I start. Projects start
                  at $900, and the <a href="/pricing">pricing page</a> explains exactly what
                  that covers.
                </p>

                <h3 className={styles.sub} data-reveal>How I build</h3>
                <p data-reveal>
                  Plainly: I build with AI tools. I&apos;m not going to pretend otherwise,
                  because the rest of this site promises you straight answers and this is
                  one.
                </p>
                <p data-reveal>
                  What the tools don&apos;t do is the part you&apos;re paying for. Understanding
                  what your business actually needs. Deciding what to build and what to leave
                  out. Writing copy that sounds like you. Testing on a real phone, checking
                  every link, getting the search setup right, and putting every account in
                  your name so the site is yours. That&apos;s judgment, and it&apos;s mine.
                </p>
                <p data-reveal>
                  The result is custom code you own outright, built faster and priced fairer
                  than it could have been a few years ago.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.sec} aria-label="What it's rooted in">
            <p className={styles.label}><span>What it&apos;s rooted in</span></p>
            <div className={styles.secBody}>
              <div className={styles.prose} data-reveal-group>
                <p data-reveal>
                  I&apos;m a Christian. My deepest hope is that my work honors the God who
                  saved me, and the freedom He bought me with His blood.
                </p>
                <p data-reveal>
                  Practically, that shapes how I treat you. It&apos;s why the pricing is
                  honest, why the scope is written down, why you own everything, and why
                  I&apos;ll tell you when I&apos;m not the right fit. You don&apos;t have to
                  share my faith to work with me. But you should know the work is built on
                  it.
                </p>
                <p className={styles.motto} lang="la" data-reveal>
                  Soli Deo Gloria.
                </p>
              </div>
            </div>
          </section>

          <div className={styles.closing} data-reveal-group>
            <a className={headerStyles.getStarted} href="/quote" data-reveal>
              <span>Start a project</span>
              <span className={headerStyles.arrowShell} aria-hidden="true"><Arrow /></span>
            </a>
            <p className={styles.closingSub} data-reveal>
              Tell me what you&apos;re building. I&apos;ll tell you straight whether I&apos;m
              the right fit.
            </p>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
