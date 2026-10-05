import { footerLinks } from "../data/nav";
import { site } from "../data/site";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          <div>
            <p className={styles.name}>{site.legalName}</p>
            <p className={styles.where}>{site.city}, {site.regionLong}</p>
          </div>
          <div className={styles.col}>
            <p className={styles.head}>Contact</p>
            <ul>
              <li><a className="u" href={`mailto:${site.email}`} data-track="email">{site.email}</a></li>
              <li><a className="u" href={site.phoneHref} aria-label={`Call or text Kyle at ${site.phone}`}>Call or text {site.phone}</a></li>
            </ul>
          </div>
          <div className={styles.col}>
            <p className={styles.head}>Pages</p>
            <ul>
              {footerLinks.map((l) => <li key={l.href}><a className="u" href={l.href}>{l.label}</a></li>)}
            </ul>
          </div>
        </div>
        <p className={styles.legal}>© {new Date().getFullYear()} {site.legalName} · {site.city}, {site.regionLong}</p>
      </div>
    </footer>
  );
}
