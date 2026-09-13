import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import Header from "../../Header";
import SiteFooter from "../../SiteFooter";
import { getProjectBySlug, projects } from "../../data/projects";
import { StatusBadge } from "../ProjectUI";
import detailStyles from "../CaseStudyCompact.module.css";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) return {};

  return {
    title: `${project.title} — Web design case study by Kyle Stringham, League City TX`,
    description: `${project.summary} A custom website by Kyle Stringham, web designer and developer in League City, Texas.`,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      title: `${project.title} — a custom website by Kyle Stringham`,
      description: project.summary,
      url: `/work/${project.slug}`,
      images: [{ url: project.heroImage, width: project.heroImageWidth, height: project.heroImageHeight, alt: project.heroImageAlt }],
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) notFound();

  const projectIndex = projects.findIndex((item) => item.slug === project.slug);
  const previousProject = projects[(projectIndex - 1 + projects.length) % projects.length];
  const nextProject = projects[(projectIndex + 1) % projects.length];

  const heroScreenshot = project.screenshots[0] ?? {
    src: project.heroImage,
    alt: project.heroImageAlt,
    caption: "",
    width: project.heroImageWidth,
    height: project.heroImageHeight,
  };
  const remainingScreenshots = project.screenshots.slice(1);

  return (
    <>
      <Header />
      <main className={detailStyles.caseStudy}>
        <div className={detailStyles.shell}>
          <aside className={detailStyles.projectRail}>
            <Link className={detailStyles.backLink} href="/work">
              ← All work
            </Link>

            <div className={detailStyles.railIdentity}>
              <h1 data-hero>{project.title}</h1>
              <StatusBadge status={project.status} />
            </div>

            <dl className={detailStyles.metaList}>
              <div>
                <dt>Year</dt>
                <dd>{project.year}</dd>
              </div>
              <div>
                <dt>Client type</dt>
                <dd>{project.clientType}</dd>
              </div>
              <div>
                <dt>Stack</dt>
                <dd>{project.tech.join(" · ")}</dd>
              </div>
            </dl>

            {project.note ? (
              <p className={detailStyles.projectNote}>{project.note}</p>
            ) : null}

            {project.liveUrl ? (
              <a
                className={detailStyles.visitButton}
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit site <span aria-hidden="true">↗</span>
              </a>
            ) : null}
          </aside>

          <article className={detailStyles.projectContent} data-reveal-group>
            <figure className={detailStyles.heroFigure}>
              <img
                src={heroScreenshot.src}
                alt={heroScreenshot.alt}
                width={heroScreenshot.width}
                height={heroScreenshot.height}
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            </figure>

            <div className={detailStyles.copyStack}>
              <section className={detailStyles.copyBlock} aria-labelledby="problem-heading">
                <p className={detailStyles.sectionLabel}>The problem</p>
                <p id="problem-heading" className={detailStyles.bodyCopy}>
                  {project.problem.join(" ")}
                </p>
              </section>

              <section className={detailStyles.copyBlock} aria-labelledby="built-heading">
                <p className={detailStyles.sectionLabel}>What I built</p>
                <ul id="built-heading" className={detailStyles.featureList}>
                  {project.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </section>

              <section className={detailStyles.copyBlock} aria-labelledby="approach-heading">
                <p className={detailStyles.sectionLabel}>The approach</p>
                <p id="approach-heading" className={detailStyles.bodyCopy}>
                  {project.approach}
                </p>
              </section>
            </div>

            {remainingScreenshots.length > 0 ? (
              <div className={detailStyles.screenshotStack} aria-label={`${project.title} screenshots`}>
                {remainingScreenshots.map((image, index) => (
                  <figure className={detailStyles.screenshotFigure} key={`${image.caption}-${index}`}>
                    <img
                      src={image.src}
                      alt={image.alt}
                      width={image.width}
                      height={image.height}
                      loading="lazy"
                      decoding="async"
                    />
                    <figcaption>{image.caption}</figcaption>
                  </figure>
                ))}
              </div>
            ) : null}
          </article>
        </div>

        <nav className={detailStyles.projectNav} aria-label="Project navigation">
          <Link href={`/work/${previousProject.slug}`}>
            <small>← Previous</small>
            <strong>{previousProject.title}</strong>
          </Link>
          <Link href={`/work/${nextProject.slug}`}>
            <small>Next →</small>
            <strong>{nextProject.title}</strong>
          </Link>
        </nav>
      </main>
      <SiteFooter />
    </>
  );
}
