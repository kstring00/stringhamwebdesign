import { cta, nav } from "../data/nav";
import { locationLine, site, studioLine } from "../data/site";
import { PiecesMark, SteamMark } from "../motifs/Motifs";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={`${styles.footer} ink`}>
      <div className="container">
        <div className={styles.wordRow} aria-hidden="true">
          <SteamMark className={styles.steam} />
          <p className={styles.wordmark}>Stringham</p>
          <PiecesMark className={styles.pieces} />
        </div>
        <p className={styles.studio}>{studioLine}</p>

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
          </div>
        </div>

        <p className={styles.legal}>© {site.year} {site.legalName} · {site.city}, {site.regionLong}</p>
      </div>
    </footer>
  );
}
