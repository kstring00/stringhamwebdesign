import { faq } from "../data/faq";
import { site } from "../data/site";
import styles from "./home.module.css";

export default function Faq() {
  return (
    <section className={styles.faq} id="faq" aria-labelledby="faq-title">
      <div className="container">
        <div className={styles.faqGrid}>
          <div className={styles.sectionHead}>
            <p className="label"><b>07</b> Questions</p>
            <h2 id="faq-title" className="display-l">Straight answers.</h2>
          </div>
          <dl className={styles.faqList} data-reveal-group>
            {faq.map((item) => (
              <div className={styles.faqItem} key={item.q} data-reveal>
                <dt>{item.q}</dt>
                <dd>
                  {item.a}
                  {item.book && site.bookingUrl ? (
                    <span className={styles.faqBook}><a className="btn btn-secondary" href={site.bookingUrl} target="_blank" rel="noopener noreferrer">Book the free call</a></span>
                  ) : null}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
