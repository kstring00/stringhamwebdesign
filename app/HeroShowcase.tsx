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
            <p className={styles.entrySignal}>01 / ENTRY SIGNAL</p>
            <p className={styles.eyebrow}>
              Websites for storage, ABA, and small business
            </p>

            <h1>
              Websites built
              <br />
              around <em>your business.</em>
            </h1>

            <p className={styles.lede}>
              I design and build custom websites for storage facilities, ABA and
              counseling practices, course creators, and other small businesses —
              built around how your business actually works, not a template with
              the name swapped out.
            </p>

            {/* The one price on the homepage: under the paragraph where the
                "can I afford this?" doubt forms, and nowhere else. */}
            <p className={styles.anchor}>
              {startingLine}{" "}
              <a href="/pricing">
                See the range <span aria-hidden="true">→</span>
              </a>
            </p>

            <span className={styles.goldRule} aria-hidden="true" />

            <div className={styles.actions}>
              <a className={styles.primary} href="/work">
                See the work <Arrow />
              </a>
              <a className={styles.secondary} href="/quote">
                Start a project
              </a>
            </div>
          </div>

          <div className={styles.gridVisual}>
            <HeroTileGrid />
            <p className={styles.gridCaption}>SIGNAL / SYSTEM / INTERFACE</p>
          </div>
        </div>

        <div className={styles.highlights} aria-label="What you can expect">
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
