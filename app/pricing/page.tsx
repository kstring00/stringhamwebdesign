import type { Metadata } from "next";

import Header from "../Header";
import heroStyles from "../HeroShowcase.module.css";
import ProcessSteps from "../ProcessSteps";
import SiteFooter from "../SiteFooter";
import {
  faq,
  formatAmount,
  launchNote,
  notIncluded,
  startingLine,
  startingPrice,
  tiers,
} from "../data/pricing";
import PricingFaq from "./PricingFaq";
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

export default function PricingPage() {
  return (
    <>
      <Header />

      <main className={styles.page}>
        <section className={`${styles.inner} ${styles.hero}`} aria-labelledby="pricing-title">
          <p className={styles.signal}>01 / PRICE SIGNAL</p>
          <p className={styles.eyebrow}>Pricing</p>
          <h1 id="pricing-title">What a site costs.</h1>
          <p className={styles.lede}>
            Every project is scoped after we talk, because the right build depends on
            what your business actually needs. But nobody should have to guess at the
            range before they get in touch. <strong>{startingLine}</strong>
          </p>
        </section>

        <section className={`${styles.inner} ${styles.section}`} aria-labelledby="tiers-title">
          <p className={styles.signal}>02 / THREE TIERS</p>
          <h2 id="tiers-title">Three ways in.</h2>
          <p className={styles.sectionIntro}>
            Each price is a floor. The written scope after our call is the number.
          </p>

          <div className={styles.tiers}>
            {tiers.map((tier) => (
              <article
                className={`${styles.tier} ${tier.common ? styles.tierCommon : ""}`}
                key={tier.id}
                aria-labelledby={`tier-${tier.id}`}
              >
                {tier.common ? <p className={styles.commonLabel}>Most projects</p> : null}
                <h3 id={`tier-${tier.id}`}>{tier.name}</h3>
                <p className={styles.price}>
                  <small>from</small> {formatAmount(tier.from)}
                </p>
                <p className={styles.fit}>{tier.fit}</p>

                {tier.plus ? <p className={styles.plus}>{tier.plus}</p> : null}
                <ul className={styles.includes}>
                  {tier.includes.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>

                <dl className={styles.timeline}>
                  <dt>Timeline</dt>
                  <dd>{tier.timeline}</dd>
                </dl>
              </article>
            ))}
          </div>

          <p className={styles.launchNote}>{launchNote}</p>
        </section>

        <section className={`${styles.inner} ${styles.section}`} aria-labelledby="excluded-title">
          <p className={styles.signal}>03 / NOT INCLUDED</p>
          <h2 id="excluded-title">What&apos;s not included.</h2>
          <p className={styles.sectionIntro}>
            Said up front, so the number you agree to is the number you pay.
          </p>

          <dl className={styles.facts}>
            {notIncluded.map((item) => (
              <div key={item.term}>
                <dt>{item.term}</dt>
                <dd>{item.detail}</dd>
              </div>
            ))}
          </dl>
        </section>

        <ProcessSteps heading="How this goes." id="process" initialOpen={2} />

        <section className={`${styles.inner} ${styles.section}`} aria-labelledby="faq-title">
          <p className={styles.signal}>04 / QUESTIONS</p>
          <h2 id="faq-title">The questions I get.</h2>

          <PricingFaq items={faq} />
        </section>

        <section className={`${styles.inner} ${styles.close}`} aria-labelledby="close-title">
          <p className={styles.signal}>05 / NEXT STEP</p>
          <h2 className={styles.closeStatement} id="close-title">
            Seven questions. About five minutes.
          </h2>
          <p className={styles.closeBody}>
            Send the brief and I&apos;ll reply within one business day with a straight
            answer on fit and a link to book a call. No obligation either way.
          </p>
          <div className={styles.closeAction}>
            <a className={heroStyles.primary} href="/quote">
              Start a project <Arrow />
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
