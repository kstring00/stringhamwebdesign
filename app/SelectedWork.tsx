import Link from "next/link";

import { projects } from "./data/projects";
import { StatusBadge } from "./work/ProjectUI";
import styles from "./SelectedWork.module.css";

/**
 * Three cards, not a binder.
 *
 * A homepage visitor has not decided they care yet, so asking them to open
 * tabs and explore costs more attention than they have spent. Three
 * screenshots let them read the range in a few seconds and leave.
 *
 * Everything shown comes from data/projects.ts — the same source /work reads —
 * so a title, description or status changed there changes in both places. The
 * pill is the portfolio page's own component rather than a copy of it.
 */
const FEATURED = ["common-ground", "bcba-prep", "with-little"] as const;

const featured = FEATURED.map((slug) => {
  const project = projects.find((item) => item.slug === slug);
  if (!project) throw new Error(`Homepage featured slug not in projects data: ${slug}`);
  return project;
});

export default function SelectedWork() {
  return (
    <section className={styles.section} id="selected-work" aria-labelledby="selected-work-heading">
      <div className={styles.inner}>
        <div className={styles.head}>
          <div>
            <p className={styles.eyebrow}>Selected work</p>
            <h2 id="selected-work-heading">The work, up close.</h2>
          </div>
          <Link className={styles.viewAll} href="/work">
            View all work <span aria-hidden="true">→</span>
          </Link>
        </div>

        <ul className={styles.grid} data-reveal-group>
          {featured.map((project) => (
            <li className={styles.card} key={project.slug} data-reveal>
              <Link className={styles.cardLink} href={`/work/${project.slug}`}>
                <span className={styles.media}>
                  <img
                    src={project.heroImage}
                    alt={project.heroImageAlt}
                    loading="lazy"
                    decoding="async"
                  />
                  <span className={styles.mediaScrim} aria-hidden="true" />
                </span>

                <span className={styles.body}>
                  <span className={styles.status}>
                    <StatusBadge status={project.status} onDark />
                  </span>
                  <span className={styles.title}>{project.title}</span>
                  <span className={styles.description}>{project.description}</span>
                  <span className={styles.more} aria-hidden="true">
                    View case study <span>→</span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
