import type { Metadata } from "next";

import Header from "../Header";
import headerStyles from "../Header.module.css";
import heroStyles from "../HeroShowcase.module.css";
import SiteFooter from "../SiteFooter";
import {
  faq,
  formatAmount,
  heroTrust,
  launchNote,
  notIncluded,
  phases,
  startingLine,
  startingPrice,
  tiers,
  trust,
} from "../data/pricing";
import { depositTerms } from "../data/process";
import PricingFaq from "./PricingFaq";
import PricingMotion from "./PricingMotion";
import styles from "./pricing.module.css";

// The price in the title and description is read from data/pricing.ts, so it
// cannot drift from the tiers on the page.
export const metadata: Metadata = {
  title: `Web Design Pricing — Custom Sites from ${formatAmount(startingPrice)} · Kyle Stringham, League City TX`,
  description: `What a custom website costs. Three tiers from ${formatAmount(startingPrice)}, each scoped after we talk. Custom web design and development for small businesses in League City and the Houston area.`,
};

function Arrow() {
  return (
    <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
      <path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

/* Line icons, all one stroke weight, all decorative. */
const ICON: Record<string, React.ReactNode> = {
  check: <path d="M3 8.5l3.2 3L13 4.5" />,
  leaf: <path d="M3 13c0-6 4-9 10-9 0 6-3 10-9 10M4 13l6-6" />,
  diamond: <path d="M4 2h8l3 4-7 8-7-8 3-4zM1 6h14M6 2l2 4 2-4" />,
  crown: <path d="M2 12h12M2 12L1 4l4 3 3-5 3 5 4-3-1 8" />,
  design: <><circle cx="8" cy="8" r="2.5" /><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.5 1.5M11.5 11.5L13 13M13 3l-1.5 1.5M4.5 11.5L3 13" /></>,
  code: <path d="M5 3L1 8l4 5M11 3l4 5-4 5M9.5 2l-3 12" />,
  performance: <path d="M2 14V9M6 14V5M10 14V7M14 14V2" />,
  support: <path d="M8 14S1.5 9.5 1.5 5.5A3.2 3.2 0 0 1 8 4a3.2 3.2 0 0 1 6.5 1.5C14.5 9.5 8 14 8 14z" />,
  fixed: <path d="M9 1L3 9h5l-1 6 6-8H8l1-6z" />,
  process: <><circle cx="8" cy="8" r="6.5" /><path d="M8 4v4l2.5 2" /></>,
};

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

const TIER_ICON = { starter: "leaf", standard: "diamond", premium: "crown" } as const;

export default function PricingPage() {
  return (
    <>
      <Header />
      <PricingMotion />

      <main className={styles.page} data-pricing>
        {/* ---------- hero ---------- */}
        <section className={styles.hero} aria-labelledby="pricing-title">
          <div className={`${styles.inner} ${styles.heroGrid}`}>
            <div className={styles.heroCopy}>
              <p className={styles.signal} data-hero="signal">01 / PRICE SIGNAL</p>
              <p className={styles.eyebrow} data-hero="eyebrow">Pricing</p>
              <h1 id="pricing-title" data-hero="title">
                What a site <em>really</em> costs.
              </h1>
              <p className={styles.lede} data-hero="lede">
                Every project is scoped after we talk, because the right build depends on
                what your business actually needs. But nobody should have to guess at the
                range before they get in touch. <strong>{startingLine}</strong>
              </p>

              <div className={styles.heroActions} data-hero="actions">
                <a className={heroStyles.primary} href="/quote">
                  Start a project <Arrow />
                </a>
                <a className={styles.heroSecondary} href="#questions">
                  Questions? Let&apos;s talk
                </a>
              </div>

              <ul className={styles.heroTrust} data-hero="trust" aria-label="What you can expect">
                {heroTrust.map((item) => (
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

            {/* Image slot. Solid until a photograph exists — see ASSETS_NEEDED.md. */}
            <div className={styles.heroMedia} data-hero="media" aria-hidden="true">
              <span className={styles.mediaDisc} />
              <span className={styles.mediaCard}>
                <span>Ideas</span>
                <span>Brands</span>
                <span>Websites</span>
                <span>that last</span>
              </span>
            </div>
          </div>
        </section>

        {/* ---------- tiers ---------- */}
        <section className={`${styles.inner} ${styles.section}`} aria-labelledby="tiers-title">
          <div className={styles.sectionHead} data-reveal-group>
            <p className={styles.signal} data-reveal>02 / PACKAGES</p>
            <h2 id="tiers-title" data-reveal>Three ways in.</h2>
            <p className={styles.sectionIntro} data-reveal>
              Each package is a floor. We can tailor the scope after our call.
            </p>
          </div>

          <div className={styles.tiers} data-tiers data-reveal-group>
            {tiers.map((tier) => (
              <article
                className={`${styles.card} ${tier.common ? styles.cardFeatured : ""}`}
                key={tier.id}
                aria-labelledby={`tier-${tier.id}`}
                {...(tier.common ? { "data-featured": "" } : { "data-reveal": "" })}
              >
                {tier.common ? <p className={styles.cardBadge}>Most popular</p> : null}
                <span className={styles.cardIcon}><Icon name={TIER_ICON[tier.id as keyof typeof TIER_ICON]} size={22} /></span>
                <h3 id={`tier-${tier.id}`}>{tier.name}</h3>
                <p className={styles.cardFit}>{tier.fit}</p>

                <p className={styles.price}>
                  <small>From</small>{" "}
                  <b data-count={tier.from}>{formatAmount(tier.from)}</b>
                </p>

                {tier.plus ? <p className={styles.plus}>{tier.plus}</p> : null}
                <ul className={styles.includes}>
                  {tier.includes.map((line) => (
                    <li key={line}>
                      <span className={styles.tick}><Icon name="check" size={10} /></span>
                      {line}
                    </li>
                  ))}
                </ul>

                <dl className={styles.timeline}>
                  <dt>Timeline</dt>
                  <dd>{tier.timeline}</dd>
                </dl>

                <div className={styles.cardAction}>
                  {tier.common ? (
                    <a className={headerStyles.getStarted} href="/quote">
                      <span>Get started</span>
                      <span className={headerStyles.arrowShell} aria-hidden="true"><Arrow /></span>
                    </a>
                  ) : (
                    <a className={heroStyles.secondary} href="/quote">
                      Get started <Arrow />
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>

          <p className={styles.launchNote} data-reveal-group>
            <span data-reveal>{launchNote}</span>
          </p>

          <ul className={styles.trustStrip} data-reveal-group aria-label="Included in every build">
            {trust.map((item) => (
              <li key={item.label} data-reveal>
                <span className={styles.trustIcon}><Icon name={item.icon} size={18} /></span>
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.detail}</small>
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- not included ---------- */}
        <section className={`${styles.inner} ${styles.section}`} aria-labelledby="excluded-title">
          <div className={styles.sectionHead} data-reveal-group>
            <p className={styles.signal} data-reveal>03 / NOT INCLUDED</p>
            <h2 id="excluded-title" data-reveal>What&apos;s not included.</h2>
            <p className={styles.sectionIntro} data-reveal>
              Said up front, so the number you agree to is the number you pay.
            </p>
          </div>

          <dl className={styles.facts} data-reveal-group>
            {notIncluded.map((item) => (
              <div key={item.term} data-reveal>
                <dt>{item.term}</dt>
                <dd>{item.detail}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ---------- process ---------- */}
        <section className={`${styles.band} ${styles.bandCream}`} aria-labelledby="process-title">
          <div className={`${styles.inner} ${styles.processGrid}`}>
            <div className={styles.processCopy} data-reveal-group>
              <p className={styles.signal} data-reveal>04 / THE PROCESS</p>
              <h2 id="process-title" data-reveal>
                A clear process.
                <br />
                A defined finish.
              </h2>
              <p className={styles.sectionIntro} data-reveal>
                Your project moves through four phases. Each one closes when you approve it.
                Every ten hours of work you get my actual timesheet — date, task, what I did
                in plain language, hours logged. Your price is fixed at the quote; the log is
                there so you can see exactly where the time went.
              </p>
              <p className={styles.deposit} data-reveal>
                <span className={styles.depositLabel}>Payment</span>
                {depositTerms}
              </p>
              <div className={styles.processAction} data-reveal>
                <a className={heroStyles.primary} href="/quote">
                  Start a project <Arrow />
                </a>
              </div>
            </div>

            <ol className={styles.phases} data-phases data-reveal-group>
              {phases.map((phase) => (
                <li className={styles.phase} key={phase.number} data-reveal>
                  <span className={styles.phaseNum} data-phase-num aria-hidden="true">{phase.number}</span>
                  <div>
                    <h3>{phase.name}</h3>
                    <p>{phase.line}</p>
                    <small>{phase.covers} of the seven</small>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------- faq ---------- */}
        <section className={`${styles.band} ${styles.faqBand}`} id="questions" aria-labelledby="faq-title">
          <div className={`${styles.inner} ${styles.faqGrid}`}>
            {/* Typographic, not photographic. The best sentence on the site,
                set where it gets read, on a field a shade lighter than the band
                so it reads as intentional. The dove ghosts behind it at 4% —
                the same device as the KS in the hero grid, so the page feels
                like one system rather than a stack of sections. */}
            <figure className={styles.faqQuote} data-reveal-group>
              <span className={styles.faqQuoteMark} aria-hidden="true" />
              <blockquote data-reveal>
                <p>
                  You don&apos;t need to know what you want built. You just need to
                  know what&apos;s not working now.
                </p>
              </blockquote>
              <span className={styles.faqQuoteRule} data-reveal data-rule />
              <figcaption data-reveal>Kyle Stringham — League City, Texas</figcaption>
            </figure>

            <div className={styles.faqCopy}>
              <div className={styles.sectionHead} data-reveal-group>
                <p className={styles.signal} data-reveal>05 / FAQ</p>
                <h2 id="faq-title" data-reveal>
                  The questions
                  <br />
                  I get.
                </h2>
                <p className={styles.sectionIntro} data-reveal>
                  Straight answers. If yours isn&apos;t here, it&apos;s the first thing
                  we&apos;ll cover on the call.
                </p>
              </div>
              <PricingFaq items={faq} />
            </div>
          </div>
        </section>

        {/* ---------- close ---------- */}
        <section className={styles.close} aria-labelledby="close-title">
          {/* The valley, full bleed. Scrimmed heavily on the left so the copy
              sits on near-navy; the river and fog come through on the right. */}
          <div className={styles.closeScene} aria-hidden="true">
            <img
              className={styles.closeImage}
              src="/pricing/close-forest.webp"
              srcSet="/pricing/close-forest-1200.webp 1200w, /pricing/close-forest.webp 2000w"
              sizes="100vw"
              alt=""
              width="2000"
              height="1333"
              loading="lazy"
              decoding="async"
              data-parallax="-14"
              data-close-image
            />
            <span className={styles.closeScrim} />
            <span className={`${styles.fog} ${styles.fogA}`} data-fog />
            <span className={`${styles.fog} ${styles.fogB}`} data-fog />
            <span className={`${styles.fog} ${styles.fogC}`} data-fog />
            <span className={styles.closeGrid} />
          </div>

          <div className={`${styles.inner} ${styles.closeLayout}`}>
            <div className={styles.closeCopy} data-reveal-group>
              <p className={`${styles.signal} ${styles.signalLight}`} data-reveal>06 / LET&apos;S BUILD</p>
              <h2 id="close-title">
                <span className={styles.closeLine} data-reveal>Seven questions.</span>
                <span className={styles.closeLine} data-reveal>About five minutes.</span>
              </h2>
              <p className={styles.closeBody} data-reveal>
                Send the brief and I&apos;ll reply within one business day with a straight
                answer on fit and a link to book a call. No sales. Just next steps.
              </p>
              <div className={styles.closeAction} data-reveal>
                <a className={headerStyles.getStarted} href="/quote">
                  <span>Start a project</span>
                  <span className={headerStyles.arrowShell} aria-hidden="true"><Arrow /></span>
                </a>
              </div>
            </div>

            {/* Not aria-hidden: the mark it replaced was decorative, this is a
                statement, and it belongs in the accessibility tree. */}
            <p className={styles.closeMark} data-reveal-group>
              <span className={styles.closeMarkRule} aria-hidden="true" data-rule />
              <span lang="la" data-reveal>Soli Deo gloria</span>
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
