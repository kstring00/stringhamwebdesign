import {
  businessName,
  contactEmail,
  discipline,
  locality,
  personName,
  portalLink,
  quoteLink,
  siteNav,
} from "./data/nav";
import styles from "./SiteFooter.module.css";

/**
 * The site footer.
 *
 * Nav items come from data/nav.ts, the same source the masthead reads, so the
 * two cannot drift. The year is computed — this renders on the server, so it
 * is the server's year and changes on its own.
 *
 * There is no privacy policy link because there is no privacy policy page;
 * a link to a 404 is worse than no link. Add the route, then add the link.
 * Likewise no social row: no account is referenced anywhere in the codebase.
 */
export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.columns}>
          <div className={styles.identity}>
            <a className={styles.brand} href="/">
              <span className={styles.monogramShell} aria-hidden="true">
                <span className={styles.doveMark} />
                <span className={styles.monogram}>KS</span>
              </span>
              <span className={styles.brandCopy}>
                <span className={styles.name}>{personName}</span>
                <span className={styles.role}>{discipline}</span>
              </span>
            </a>

            <p className={styles.blurb}>
              Custom websites for small businesses in League City and the Houston area.
            </p>
            <p className={styles.locality}>{locality}</p>
          </div>

          <nav className={styles.column} aria-labelledby="footer-site">
            <h2 className={styles.columnHead} id="footer-site">Site</h2>
            <ul>
              {siteNav.map((item) => (
                <li key={item.href}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
              <li>
                <a href={quoteLink.href}>{quoteLink.label}</a>
              </li>
            </ul>
          </nav>

          <nav className={styles.column} aria-labelledby="footer-clients">
            <h2 className={styles.columnHead} id="footer-clients">Clients</h2>
            <ul>
              <li>
                <a href={portalLink.href}>{portalLink.label}</a>
              </li>
              <li>
                <a href="/quote">Quote request</a>
              </li>
            </ul>
          </nav>

          <div className={styles.column}>
            <h2 className={styles.columnHead}>Contact</h2>
            <p className={styles.contactLine}>
              Tell me what you&apos;re building and I&apos;ll tell you straight
              whether I&apos;m the right fit.
            </p>
            <a className={styles.email} href={`mailto:${contactEmail}`}>
              {contactEmail}
            </a>
          </div>
        </div>

        <div className={styles.bottom}>
          <span>
            © {new Date().getFullYear()} {businessName}
          </span>
        </div>
      </div>
    </footer>
  );
}
