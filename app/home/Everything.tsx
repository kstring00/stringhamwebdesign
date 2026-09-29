import { services } from "../data/services";
import styles from "./home.module.css";

/** The six things every idea needs, as a numbered editorial list. */
export default function Everything() {
  return (
    <section className={styles.every} id="everything" aria-labelledby="every-title">
      <div className="container">
        <div className={styles.everyHead}>
          <p className="label"><b>02</b> What you get</p>
          <h2 id="every-title" className="display-l">Everything you need to succeed.</h2>
          <a className={`u ${styles.everyLink}`} href="/services">The full list, in detail</a>
        </div>
        <ol className={styles.everyList} data-reveal-group>
          {services.map((s) => (
            <li className={styles.everyItem} key={s.slug} data-reveal>
              <span className={styles.everyN} aria-hidden="true">{s.n}</span>
              <h3 className={styles.everyTitle}><a href={`/services#${s.slug}`}>{s.title}</a></h3>
              <p className={styles.everyBody}>{s.short}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
