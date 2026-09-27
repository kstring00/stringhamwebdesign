import { previewServices } from "../data/services";
import styles from "./home.module.css";

export default function ServicesPreview() {
  return (
    <section className={styles.services} aria-labelledby="services-title">
      <div className="container">
        <div className={styles.sectionHead}>
          <p className="label"><b>02</b> Services</p>
          <h2 id="services-title" className="display-l">Three ways in.</h2>
        </div>
        <ul className={styles.serviceList} data-reveal-group>
          {previewServices.map((s, i) => (
            <li key={s.slug} data-reveal>
              <a className={styles.service} href={s.href ?? `/services#${s.slug}`}>
                <span className={styles.serviceIndex}>{String(i + 1).padStart(2, "0")}</span>
                <span className={styles.serviceName}>{s.name}{s.slug === "family-resource-hub" ? <em> for clinics</em> : null}</span>
                <span className={styles.serviceLine}>{s.line}</span>
                <span className={styles.serviceArrow} aria-hidden="true">→</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
