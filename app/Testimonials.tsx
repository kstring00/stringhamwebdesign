import { testimonials } from "./data/testimonials";
import styles from "./Testimonials.module.css";

/**
 * Renders nothing at all until there is a quote to show.
 *
 * Not an empty frame, not placeholder text — the section does not exist in the
 * markup while data/testimonials.ts is empty, so there is nothing to hide with
 * CSS and nothing for a screen reader to announce. Adding the first entry to
 * that file is the only step needed to make it appear.
 */
export default function Testimonials() {
  if (testimonials.length === 0) return null;

  const [first] = testimonials;

  return (
    <section className={styles.section} aria-labelledby="testimonial-heading">
      <div className={styles.inner}>
        <h2 className={styles.srOnly} id="testimonial-heading">
          What clients say
        </h2>

        <figure className={styles.quote} data-reveal-group>
          <blockquote data-reveal>
            <p>{first.quote}</p>
          </blockquote>
          <span className={styles.rule} data-reveal data-rule />
          <figcaption data-reveal>
            <span className={styles.name}>{first.name}</span>
            <span className={styles.business}>{first.business}</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
