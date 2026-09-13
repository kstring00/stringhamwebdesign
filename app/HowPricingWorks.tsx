import headerStyles from "./Header.module.css";
import { pricingApproach } from "./data/pricing";
import styles from "./HowPricingWorks.module.css";

function Arrow() {
  return (
    <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
      <path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

/**
 * How pricing works. The section that replaced the /pricing page: the range
 * most sites land in, what gets quoted separately, and how a quote happens.
 * It carries id="pricing" because /pricing now redirects to /#pricing, so
 * every old link and search result lands here.
 *
 * Everything it says comes from data/pricing.ts.
 */
export default function HowPricingWorks() {
  const { eyebrow, heading, lede, points, assurances } = pricingApproach;

  return (
    <section className={styles.section} id="pricing" aria-labelledby="pricing-heading">
      <div className={styles.inner}>
        <div className={styles.head}>
          <div>
            <p className={styles.eyebrow}>{eyebrow}</p>
            <h2 id="pricing-heading">{heading}</h2>
          </div>
          <p className={styles.lede}>{lede}</p>
        </div>

        <dl className={styles.points} data-reveal-group>
          {points.map((point, index) => (
            <div className={styles.point} key={point.label} data-reveal>
              <span className={styles.index} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <dt>{point.label}</dt>
              <dd>{point.line}</dd>
            </div>
          ))}
        </dl>

        <div className={styles.foot} data-reveal-group>
          <ul className={styles.assurances} aria-label="What every quote includes">
            {assurances.map((line) => (
              <li key={line} data-reveal>
                <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 8.5l3 3 7-7" />
                </svg>
                <span>{line}</span>
              </li>
            ))}
          </ul>

          <a className={headerStyles.getStarted} href="/quote" data-reveal>
            <span>Start with the brief</span>
            <span className={headerStyles.arrowShell} aria-hidden="true"><Arrow /></span>
          </a>
        </div>
      </div>
    </section>
  );
}
