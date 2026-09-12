import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import Header from "../../Header";
import headerStyles from "../../Header.module.css";
import SiteFooter from "../../SiteFooter";
import { RESOURCE_ORDER, getResource, signal } from "../lib";
import styles from "../resources.module.css";
import "../prose.css";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return RESOURCE_ORDER.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const resource = getResource(slug);
  if (!resource) return {};
  return {
    title: `${resource.title} — Stringham Web Design, League City`,
    description: resource.description,
  };
}

function Arrow() {
  return (
    <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
      <path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export default async function ResourcePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const resource = getResource(slug);
  if (!resource) notFound();

  return (
    <>
      <Header />
      <main className={styles.page}>
        <article className={styles.doc}>
          <header className={styles.docHead}>
            <div className={styles.inner}>
              <Link className={styles.back} href="/resources" data-hero>
                <span className={styles.backArrow} aria-hidden="true">
                  <Arrow />
                </span>
                Back to resources
              </Link>
              <p className={styles.signal} data-hero>
                Resources &middot; {signal(resource.number)}
              </p>
              <h1 data-hero>{resource.title}</h1>
              <p className={styles.docMeta} data-hero>
                {resource.minutes} minute read
              </p>
              <hr className={styles.rule} data-rule />
            </div>
          </header>

          {/* The document, rendered as written. See lib.ts for the only
              structural edits made to it. */}
          <div className={styles.inner}>
            <div
              className={`${styles.prose} resourceProse`}
              dangerouslySetInnerHTML={{ __html: resource.html }}
            />
          </div>

          <footer className={styles.docFoot}>
            <div className={styles.inner}>
              <hr className={styles.rule} data-rule />
              <div className={styles.cta} data-reveal-group>
                <p className={styles.ctaLine} data-reveal>
                  Ready when you are.
                </p>
                <a className={headerStyles.getStarted} href="/quote" data-reveal>
                  <span>Start a project</span>
                  <Arrow />
                </a>
              </div>
            </div>
          </footer>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
