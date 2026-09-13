import { startingLine } from "./data/pricing";
import HeroTileGrid from "./HeroTileGrid";
import styles from "./HeroShowcase.module.css";

function Arrow() {
  return (
    <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
      <path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

const highlights = [
  ["Custom, not templated", "Built for your actual workflow"],
  ["Direct with me", "No agency, no handoffs"],
  ["Built to last", "Yours to keep and change"],
] as const;

export default function HeroShowcase() {
  return (
    <section className={styles.hero} id="top">
      <div className={styles.inner}>
        <div className={styles.heroMain}>
          <div className={styles.copy}>
            <p className={styles.entrySignal} data-hero>01 / ENTRY SIGNAL</p>
            <p className={styles.eyebrow} data-hero>
              Websites for storage, ABA, and small business
            </p>

            <h1 data-hero>
              Websites built
              <br />
              around <em>your business.</em>
            </h1>

            <p className={styles.lede} data-hero>
              I design and build custom websites for storage facilities, ABA and
              counseling practices, course creators, and other small businesses —
              built around how your business actually works, not a template with
              the name swapped out.
            </p>

            {/* The one price on the homepage: under the paragraph where the
                "can I afford this?" doubt forms, and nowhere else. */}
            <p className={styles.anchor} data-hero>
              {startingLine}{" "}
              <a href="/pricing">
                See the range <span aria-hidden="true">→</span>
              </a>
            </p>

            <span className={styles.goldRule} aria-hidden="true" data-hero data-rule />

            {/* One dominant action. The quote is the thing the page exists to
                start; the work is there for the visitor who needs convincing
                first, and reads as the quieter of the two. */}
            <div className={styles.actions} data-hero>
              <a className={styles.primary} href="/quote">
                Start a project <Arrow />
              </a>
              <a className={styles.secondary} href="/work">
                See the work
              </a>
            </div>
          </div>

          <div className={styles.gridVisual} data-hero="media">
            <HeroTileGrid />
            <p className={styles.gridCaption}>SIGNAL / SYSTEM / INTERFACE</p>
          </div>
        </div>

        <div className={styles.highlights} aria-label="What you can expect" data-reveal-group>
          {highlights.map(([title, text]) => (
            <div className={styles.highlight} key={title}>
              <strong>{title}</strong>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
