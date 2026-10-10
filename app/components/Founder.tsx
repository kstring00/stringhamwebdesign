import { site } from "../data/site";
import styles from "./Founder.module.css";

/**
 * Who Kyle is, plainly, and what it means for the client. Every fact here is
 * something Kyle has stated himself; nothing is added. The portrait is Kyle's own photo
 * (public/kyle-founder.webp, with a JPEG fallback), cropped to 4:5.
 */
export default function Founder({ headingId = "founder-title", label = "Who you'd work with" }: { headingId?: string; label?: string }) {
  return (
    <div className={styles.founder}>
      <div className={styles.portrait}>
        <picture>
          <source type="image/webp" srcSet="/kyle-founder.webp" />
          <img src="/kyle-founder.jpg" alt="Kyle Stringham" width={496} height={618} loading="lazy" decoding="async" />
        </picture>
      </div>
      <div className={styles.text}>
        <p className={styles.label}>{label}</p>
        <h2 id={headingId} className={styles.name}>Kyle Stringham</h2>
        <p className={styles.role}>Founder, {site.legalName} · {site.city}, {site.regionLong}</p>
        <p>I have a degree in psychology, and I study why customers choose one business over another. That shapes every page I build: what people need to see, in what order, before they call.</p>
        <p>Years of customer-facing work, and my work as a Registered Behavior Technician with autistic kids and their families, mean patient, clear communication. You&rsquo;ll always know what&rsquo;s happening and what comes next.</p>
        <p>I use AI-assisted tools so you get custom work faster. I review, test and stand behind every line that ships.</p>
        <p>What I care about: clear communication, honest scope, and owners keeping control of their own domain and accounts.</p>
        <p className={styles.links}>
          <a className="u" href={`mailto:${site.email}`} data-track="email">{site.email}</a>
          <a className="u" href={site.phoneHref}>Call or text {site.phone}</a>
        </p>
      </div>
    </div>
  );
}
