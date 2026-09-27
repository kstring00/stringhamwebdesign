import type { Metadata } from "next";

import { services } from "../data/services";
import ClosingCta from "../home/ClosingCta";
import styles from "../pages.module.css";

export const metadata: Metadata = {
  title: "Web Design Services in League City, TX",
  description: "Custom websites, redesigns, care plans, and a Family Resource Hub for ABA and pediatric clinics. Web design and development from League City, Texas, quoted fixed-price in writing.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <div className={`container ${styles.page}`}>
        <header className={styles.head}>
          <p className={`label ${styles.headLabel}`}><b>01</b> Services</p>
          <h1 className="display-l">Four ways I can help.</h1>
          <p className={`lede ${styles.lede}`}>Every one is scoped after a free 30-minute call and quoted as a fixed price in writing.</p>
        </header>
        <section className={styles.section} aria-label="The services">
          <ol className={styles.list} data-reveal-group>
            {services.map((s, i) => (
              <li className={styles.item} id={s.slug} key={s.slug} data-reveal>
                <span className={styles.itemIndex}>{String(i + 1).padStart(2, "0")}</span>
                <h2 className={styles.itemName}>{s.name}{s.slug === "family-resource-hub" ? <small>For ABA and pediatric clinics</small> : null}</h2>
                <p className={styles.itemBody}>
                  {s.body}
                  {s.href ? <><br /><a className="u" href={s.href}>{s.cta} →</a></> : null}
                </p>
              </li>
            ))}
          </ol>
        </section>
      </div>
      <ClosingCta />
    </>
  );
}
