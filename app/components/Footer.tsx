import { cta, nav } from "../data/nav";
import { locationLine, site, studioLine } from "../data/site";
import styles from "./Footer.module.css";
import Wordmark from "./Wordmark";

export default function Footer() {
  return (
    <footer className={`${styles.footer} ink`}>
      <div className="container">
        <Wordmark />
        <p className={styles.studio}>{studioLine}</p>

        <div className={styles.grid}>
          <div className={styles.col}>
            <p className={styles.head}>Pages</p>
            <ul>
              <li><a className="u" href="/">Home</a></li>
              {nav.map((item) => (
                <li key={item.href}><a className="u" href={item.href}>{item.label}</a></li>
              ))}
              <li><a className="u" href="/family-resource-hub">Family Resource Hub</a></li>
              <li><a className="u" href={cta.href}>{cta.label}</a></li>
            </ul>
          </div>
          <div className={styles.col}>
            <p className={styles.head}>Contact</p>
            <ul>
              <li><a className="u" href={`mailto:${site.email}`}>{site.email}</a></li>
              <li><a className="u" href={site.phoneHref}>{site.phone}</a></li>
              <li><a className="u" href="/terms">Service Terms</a></li>
              <li><a className="u" href="/privacy">Privacy Policy</a></li>
            </ul>
          </div>
          <div className={`${styles.col} ${styles.about}`}>
            <p className={styles.head}>Where</p>
            <p className={styles.line}>{locationLine}</p>
          </div>
        </div>

        <p className={styles.legal}>© {site.year} {site.legalName} · {site.city}, {site.regionLong}</p>
      </div>
    </footer>
  );
}
