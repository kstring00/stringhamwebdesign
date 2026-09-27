import { faq } from "../data/faq";
import styles from "./home.module.css";

export default function Faq() {
  return (
    <section className={styles.faq} id="faq" aria-labelledby="faq-title">
      <div className="container">
        <div className={styles.faqGrid}>
          <div className={styles.sectionHead}>
            <p className="label"><b>04</b> Questions</p>
            <h2 id="faq-title" className="display-l">Straight answers.</h2>
          </div>
          <dl className={styles.faqList} data-reveal-group>
            {faq.map((item) => (
              <div className={styles.faqItem} key={item.q} data-reveal>
                <dt>{item.q}</dt>
                <dd>{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
