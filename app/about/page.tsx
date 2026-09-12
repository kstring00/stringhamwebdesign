import type { Metadata } from "next";

import Header from "../Header";
import headerStyles from "../Header.module.css";
import SiteFooter from "../SiteFooter";
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

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className={styles.page}>
        <section className={styles.hero} aria-labelledby="about-title">
          {/* Sunrise over a sea of cloud. Unlike the image it replaced, this one
              is bright across the top, so the scrim below does more work than a
              deepening pass — the copy sits on the photograph and the gradient
              is what keeps it readable. Eager and high priority: LCP element. */}
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

          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow} data-hero>
                About <span className={styles.eyebrowRule} aria-hidden="true" data-rule />
              </p>
              <h1 id="about-title" data-hero>
                I build the things I wish more <em>small businesses had.</em>
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
          </div>
        </section>

        <article className={styles.story}>
          <div className={styles.storyLead}>
            <figure className={styles.portrait} data-reveal>
              <img
                src="/about/portrait.webp"
                alt="Portrait of Kyle Stringham"
                width="263"
                height="278"
                loading="lazy"
                decoding="async"
              />
              <figcaption>Kyle Stringham — Web Design &amp; Development · League City, Texas</figcaption>
            </figure>

            <div className={styles.prose} data-reveal-group>
              <p>
                I work in ABA. I spend my days around behavior analysts, therapists, and the
                families they serve — which is how this started.
              </p>

              <p>
                Parents of autistic kids were suffering quietly. Scattered resources, no clear
                next step, a lot of energy spent searching instead of being present with their
                own children. I pitched a site that would close that gap, and I built it.
                That&apos;s Common Ground.
              </p>

              <p className={styles.pivot}>Nine months ago I didn&apos;t know how to do any of this.</p>

              <p>
                I taught myself. Budgeting apps, personal systems, a journaling app built
                around faith called <a href="/work/with-little">With Little</a>. I learned by
                building things that were broken and then fixing them, which is still mostly
                how I work.
              </p>
            </div>
          </div>

          <section className={styles.section} aria-labelledby="why-title" data-reveal-group>
            <h2 id="why-title">Why I do this</h2>
            <div className={styles.prose}>
              <p>
                I&apos;m an introvert. This work suits me — long stretches of solving something
                carefully, then handing someone a thing that makes their life easier. AI is a
                large part of how I build, and I&apos;m grateful for it. It&apos;s a tool that lets one
                person serve more people than one person used to be able to.
              </p>

              <p>
                The businesses I build for are ones where the owner is the brand — coaches,
                clinicians, family businesses. My dad owns a storage facility. My friend
                coaches. I work in ABA. These aren&apos;t abstract markets to me.
              </p>
            </div>
          </section>

          <section className={styles.section} id="how" aria-labelledby="how-title" data-reveal-group>
            <h2 id="how-title">How I work</h2>
            <div className={styles.prose}>
              <p className={styles.pillar}>
                <strong>Equal exchange. That&apos;s the pillar.</strong>
              </p>

              <p>
                You know what you&apos;re paying and what you&apos;re getting before I start. You see
                the hours as they&apos;re logged. The price doesn&apos;t move unless the scope does, and
                the scope doesn&apos;t move without both of us agreeing. When it&apos;s finished, it&apos;s
                yours — the code, the repo, the domain. No hostage situations.
              </p>

              <p>
                I work hard to make things right. Not &quot;good enough for the price,&quot; but right.
              </p>
            </div>
          </section>

          <footer className={styles.closing} data-reveal-group>
            <p>
              God&apos;s the reason I do this. The care I try to put into the work comes from
              there.
            </p>
            <a href="/quote">Start a project <span aria-hidden="true">→</span></a>
          </footer>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
