"use client";

import Link from "next/link";
import { useState } from "react";

import type { Project, ProjectStatus } from "../data/projects";
import fixStyles from "./WorkFixes.module.css";
import styles from "./work.module.css";

const statusClass: Record<ProjectStatus, string> = {
  LIVE: styles.statusLive,
  "IN PILOT": styles.statusPilot,
  "CASE STUDY": styles.statusCaseStudy,
};

const statusClassOnDark: Record<ProjectStatus, string> = {
  LIVE: styles.statusLive,
  "IN PILOT": styles.statusPilot,
  "CASE STUDY": styles.statusCaseStudyDark,
};

/**
 * `onDark` swaps only the two variants that are drawn in ink on a transparent
 * ground — #806635 and #60676d are chosen for cream and fall to about 2.9:1
 * on the navy band. The filled variants carry their own background and need
 * no change, so the treatment stays one component and one shape.
 */
export function StatusBadge({
  status,
  onDark = false,
}: {
  status: ProjectStatus;
  onDark?: boolean;
}) {
  return (
    <span
      className={`${styles.statusBadge} ${(onDark ? statusClassOnDark : statusClass)[status]}`}
    >
      {status}
    </span>
  );
}

export function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const number = String(index + 1).padStart(2, "0");
  const caseStudyHref = `/work/${project.slug}`;
  const showImage = Boolean(project.heroImage) && !imageFailed;

  return (
    <article className={styles.projectCard}>
      <Link
        className={fixStyles.mediaLink}
        href={caseStudyHref}
        aria-label={`View case study for ${project.title}`}
      >
        <div className={styles.cardMedia}>
          {showImage ? (
            <>
              <img
                className={`${styles.cardImage} ${project.slug === "bcba-prep" ? fixStyles.bcbaImage : ""}`}
                src={project.heroImage}
                alt={project.heroImageAlt}
                width={project.heroImageWidth}
                height={project.heroImageHeight}
                loading="lazy"
                decoding="async"
                onError={() => setImageFailed(true)}
              />
              <span className={styles.cardMediaScrim} aria-hidden="true" />
            </>
          ) : (
            <div
              className={styles.cardMediaPlaceholder}
              role="img"
              aria-label={project.heroImageAlt}
            />
          )}

          <span className={styles.cardIndex}>{number}</span>
          <span
            className={`${styles.cardStatus} ${project.slug === "bcba-prep" ? fixStyles.bcbaStatus : ""}`}
          >
            <StatusBadge status={project.status} />
          </span>
        </div>
      </Link>

      <div className={styles.cardContent}>
        <div className={styles.cardBody}>
          <h3>
            <Link className={fixStyles.titleLink} href={caseStudyHref}>
              {project.title}
            </Link>
          </h3>
          <p className={styles.cardDescription}>{project.description}</p>

          <div className={styles.techList} aria-label="Technology used">
            {project.tech.map((item, techIndex) => (
              <span className={styles.techPill} key={`${item}-${techIndex}`}>
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className={fixStyles.cardActions}>
          <Link
            className={`${styles.cardLink} ${fixStyles.cardActionLink}`}
            href={caseStudyHref}
          >
            View case study <span>→</span>
          </Link>
          {project.liveUrl ? (
            <a
              className={fixStyles.visitSiteLink}
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit site <span aria-hidden="true">↗</span>
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
