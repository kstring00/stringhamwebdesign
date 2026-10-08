import { site } from "../data/site";
import styles from "./Founder.module.css";

/**
 * Who Kyle is, plainly. Every line here is something Kyle has stated
 * himself; nothing is added. The portrait slot shows his initials until he
 * supplies an approved photo (never a generated one).
 */
export default function Founder({ headingId = "founder-title", label = "Who you'd work with" }: { headingId?: string; label?: string }) {
  return (
    <div className={styles.founder}>
      <div className={styles.portrait} aria-hidden="true">
        <span>KS</span>
      </div>
      <div className={styles.text}>
        <p className={styles.label}>{label}</p>
        <h2 id={headingId} className={styles.name}>Kyle Stringham</h2>
        <p className={styles.role}>Founder, {site.legalName} · {site.city}, {site.regionLong}</p>
        <p>My background is in psychology and client-facing work. I have a degree in psychology, I&rsquo;ve worked a busy coffee counter, and I work with autistic kids and their families as a Registered Behavior Technician. All of it taught me to listen first and explain things plainly.</p>
        <p>I plan, design, build and launch websites myself, using modern AI-assisted development tools. I direct the work, review and test what the tools produce, and I&rsquo;m accountable for every line that ships.</p>
        <p>What I care about: clear communication, honest scope, and owners keeping control of their own domain and accounts.</p>
        <p className={styles.links}>
          <a className="u" href={`mailto:${site.email}`} data-track="email">{site.email}</a>
          <a className="u" href={site.phoneHref}>Call or text {site.phone}</a>
        </p>
      </div>
    </div>
  );
}
