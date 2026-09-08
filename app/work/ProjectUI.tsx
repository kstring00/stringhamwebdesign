"use client";

import Link from "next/link";
import { useState } from "react";

import type { Project, ProjectStatus } from "../data/projects";
import fixStyles from "./WorkFixes.module.css";
import styles from "./work.module.css";

const statusClass: Record<ProjectStatus, string> = {
  LIVE: styles.statusLive,
  "IN PILOT": styles.statusPilot,
  "LAUNCHING SOON": styles.statusSoon,
  "CASE STUDY": styles.statusCaseStudy,
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span className={`${styles.statusBadge} ${statusClass[status]}`}>
      {status}
    </span>
  );
}

export function ProjectMedia({
  src,
  alt,
  title,
  caption,
  className = "",
  loading = "lazy",
}: {
  src: string;
  alt: string;
  title: string;
  caption?: string;
  className?: string;
  loading?: "lazy" | "eager";
}) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <figure className={`${styles.mediaFigure} ${className}`}>
      {src && !imageFailed ? (
        <img
          className={styles.mediaImage}
          src={src}
          alt={alt}
          loading={loading}
          decoding="async"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div
          className={styles.mediaPlaceholder}
          role="img"
          aria-label={alt}
        >
          <span>Preview coming soon</span>
          <strong>{title}</strong>
        </div>
      )}
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
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

export function PendingProjectCard({ index }: { index: number }) {
  const number = String(index + 1).padStart(2, "0");

  return (
    <Link
      className={`${styles.projectCard} ${fixStyles.pendingCard}`}
      href="/#quick-contact"
      aria-label="Start a project with Kyle Stringham"
    >
      <div className={`${styles.cardMedia} ${fixStyles.pendingMedia}`}>
        <div className={fixStyles.pendingFrame} aria-hidden="true">
          <span>A place for what&apos;s next</span>
        </div>
        <span className={styles.cardIndex}>{number}</span>
        <span className={styles.cardStatus}>
          <span className={`${styles.statusBadge} ${fixStyles.statusPending}`}>
            PENDING
          </span>
        </span>
      </div>

      <div className={styles.cardContent}>
        <div className={styles.cardBody}>
          <h3>Yours here</h3>
          <p className={styles.cardDescription}>
            The next case study starts with a real business problem worth solving.
          </p>
          <div className={styles.techList} aria-label="Project availability">
            <span className={styles.techPill}>Custom build</span>
            <span className={styles.techPill}>Open slot</span>
          </div>
        </div>

        <span className={`${styles.cardLink} ${fixStyles.cardActionLink}`}>
          Start a project <span>→</span>
        </span>
      </div>
    </Link>
  );
}
