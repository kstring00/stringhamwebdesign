import { cta, nav } from "../data/nav";
import { locationLine, site } from "../data/site";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={`${styles.footer} ink`}>
      <div className="container">
        <p className={styles.wordmark} aria-hidden="true">Stringham</p>

        <div className={styles.grid}>
          <div className={styles.col}>
            <p className={styles.head}>Pages</p>
            <ul>
              {nav.map((item) => (
                <li key={item.href}><a className="u" href={item.href}>{item.label}</a></li>
              ))}
              <li><a className="u" href={cta.href}>{cta.label}</a></li>
            </ul>
          </div>
          <div className={styles.col}>
            <p className={styles.head}>Contact</p>
            <ul>
              <li><a className="u" href={`mailto:${site.email}`}>{site.email}</a></li>
              <li><a className="u" href={site.phoneHref}>{site.phone}</a></li>
              <li><a className="u" href="/privacy">Privacy Policy</a></li>
            </ul>
          </div>
          <div className={`${styles.col} ${styles.about}`}>
            <p className={styles.head}>Where</p>
            <p className={styles.line}>{locationLine}</p>
            <p className={styles.line}>{site.person}, {site.credential}.</p>
          </div>
        </div>

        <p className={styles.legal}>© {site.year} {site.legalName} · {site.city}, {site.regionLong}</p>
      </div>
    </footer>
  );
}
