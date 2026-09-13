import type { Metadata } from "next";
import Link from "next/link";

import Header from "../Header";
import SiteFooter from "../SiteFooter";
import { phases } from "../data/process";
import { getResources, signal, type ResourceSlug } from "./lib";
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

/* Line icons in the site's one style: one 16-unit box, one stroke weight,
   all decorative. */
const ICON = {
  clock: <><circle cx="8" cy="8" r="6.5" /><path d="M8 4v4l2.5 2" /></>,
  user: <><circle cx="8" cy="5.5" r="3" /><path d="M2.5 14.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" /></>,
  unlock: <><rect x="3" y="7.5" width="10" height="7" rx="1.5" /><path d="M5.5 7.5V5a2.5 2.5 0 0 1 5 0" /></>,
  key: <><circle cx="5.5" cy="10.5" r="3" /><path d="M7.6 8.4L14 2M11.5 4.5l2 2M9.5 6.5l2 2" /></>,
  coins: <><ellipse cx="6" cy="4.5" rx="4.5" ry="2" /><path d="M1.5 4.5v3c0 1.1 2 2 4.5 2s4.5-.9 4.5-2v-3" /><path d="M6.5 11.5c.6 1 2 1.5 3.5 1.5 2.5 0 4.5-.9 4.5-2V8" /><path d="M10 6.2c2.6 0 4.5.9 4.5 2" /></>,
  checklist: <><path d="M2 4l1.5 1.5L6 3M2 9l1.5 1.5L6 8M2 14l1.5 1.5L6 13" /><path d="M8 4.5h6M8 9.5h6M8 14.5h6" /></>,
  book: <><path d="M2.5 2.5h4.5a2 2 0 0 1 2 2v9.5a1.5 1.5 0 0 0-1.5-1.5h-5v-10zM13.5 2.5H9a2 2 0 0 0-2 2" /><path d="M9 14a1.5 1.5 0 0 1 1.5-1.5h3v-10" /></>,
} as const;

function Icon({ name, size = 16 }: { name: keyof typeof ICON; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICON[name]}
    </svg>
  );
}

/* Under the hero: three small reassurances. */
const HERO_TRUST = [
  { icon: "clock", label: "About 20 minutes", detail: "all five, start to finish" },
  { icon: "user", label: "Written for owners", detail: "not for web people" },
  { icon: "unlock", label: "Free, no email", detail: "read it, share it, check it later" },
] as const;

const CARD_ICON: Record<Exclude<ResourceSlug, "what-happens-step-by-step">, keyof typeof ICON> = {
  "who-owns-what": "key",
  "what-it-costs-to-keep-running": "coins",
  "what-i-need-from-you": "checklist",
  "the-words-ill-use": "book",
};

/** The process strip, held still: Discovery done, Design under way. */
const STRIP_ACTIVE = 1;

export default function ResourcesPage() {
  const [featured, ...rest] = getResources();

  return (
    <>
      <Header />
      <main className={styles.page}>
        <section className={styles.hero} aria-labelledby="resources-title">
          <div className={`${styles.inner} ${styles.heroGrid}`}>
            <div className={styles.heroCopy}>
              <p className={styles.signal} data-hero>Resources</p>
              <h1 id="resources-title" data-hero>
                Everything I&rsquo;d tell you <em>before</em> we start.
              </h1>
              <p className={styles.lede} data-hero>
                Five short reads on how a project with me actually works, written so
                you can check any of it later. None of it is a sales page.
              </p>
            </div>

            <ul className={styles.heroTrust} data-hero="media" aria-label="What to expect">
              {HERO_TRUST.map((item) => (
                <li key={item.label}>
                  <span className={styles.trustIcon}><Icon name={item.icon} /></span>
                  <span>
                    <strong>{item.label}</strong>
                    <small>{item.detail}</small>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.inner}>
            <hr className={styles.rule} data-rule />
          </div>
        </section>

        <section className={styles.index} aria-label="The five resources">
          <div className={styles.inner}>
            <ol className={styles.cards} data-reveal-group>
              {/* 01, featured: the "Most popular" card treatment, with
                  the portal strip held still beside the copy. */}
              <li className={`${styles.card} ${styles.cardFeatured}`} data-reveal>
                <Link className={styles.cardLink} href={`/resources/${featured.slug}`}>
                  <span className={styles.cardBadge}>Start here</span>
                  <span className={styles.featuredGrid}>
                    <span className={styles.featuredCopy}>
                      <span className={styles.cardSignal}>{signal(featured.number)}</span>
                      <span className={styles.cardTitle}>{featured.title}</span>
                      <span className={styles.cardSummary}>{featured.summary}</span>
                      <span className={styles.cardMeta}>
                        <span className={styles.cardRead}>
                          Read <Arrow />
                        </span>
                        <span className={styles.cardTime}>{featured.minutes} min</span>
                      </span>
                    </span>

                    <span className={styles.strip} aria-hidden="true">
                      {phases.map((phase, i) => (
                        <span
                          className={styles.stripPhase}
                          key={phase.name}
                          data-state={i < STRIP_ACTIVE ? "done" : i === STRIP_ACTIVE ? "active" : "idle"}
                        >
                          <span className={styles.stripTrack}>
                            <span className={styles.stripFill} />
                          </span>
                          <span className={styles.stripName}>
                            {phase.name}
                            {i < STRIP_ACTIVE ? (
                              <svg className={styles.stripCheck} viewBox="0 0 12 12" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2 6.4l2.6 2.6L10 3.2" />
                              </svg>
                            ) : null}
                          </span>
                        </span>
                      ))}
                    </span>
                  </span>
                </Link>
              </li>

              {rest.map((r) => (
                <li className={styles.card} key={r.slug} data-reveal>
                  <Link className={styles.cardLink} href={`/resources/${r.slug}`}>
                    <span className={styles.cardTop}>
                      <span className={styles.cardIcon}>
                        <Icon name={CARD_ICON[r.slug as keyof typeof CARD_ICON]} size={20} />
                      </span>
                      <span className={styles.cardSignal}>{signal(r.number)}</span>
                    </span>
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
