import { footerLinks, partnerLinks } from "../data/nav";
import { referral } from "../data/referral";
import { site } from "../data/site";
import Logo from "./Logo";
import styles from "./Footer.module.css";

/**
 * The footer: the logo, the referral line (a plain number, no counter),
 * the partner side of the site, contact, pages and the legal line.
 */
export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.about}>
            <a className={styles.logoLink} href="/"><Logo className={styles.logo} /></a>
            <p className={styles.where}>{site.legalName} · {site.city}, {site.regionLong}</p>
            <p className={styles.referral}>
              <b>Know a business that needs a website?</b> I pay you {referral.percent} when they hire me.
            </p>
            <ul className={styles.partnerLinks}>
              {partnerLinks.map((l) => <li key={l.href}><a className="u" href={l.href}>{l.label}</a></li>)}
            </ul>
          </div>
          <div className={styles.col}>
            <p className={styles.head}>Contact</p>
            <ul>
              <li><a className="u" href={site.phoneHref}>Call {site.phone}</a></li>
              <li><a className="u" href={site.smsHref}>Text {site.phone}</a></li>
              <li><a className="u" href={`mailto:${site.email}`} data-track="email">{site.email}</a></li>
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
