import { audiences } from "./data/audiences";
import styles from "./WhoThisIsFor.module.css";

export default function WhoThisIsFor() {
  return (
    <section className={styles.section} aria-labelledby="who-heading">
      <div className={styles.inner}>
        <div className={styles.head}>
          <p className={styles.eyebrow}>Who this is for</p>
          <h2 id="who-heading">Businesses where the owner is the brand.</h2>
        </div>

        <dl className={styles.list} data-reveal-group>
          {audiences.map((item) => (
            <div className={styles.item} key={item.label} data-reveal>
              <dt>{item.label}</dt>
              <dd>{item.line}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
