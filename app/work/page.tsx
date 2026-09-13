import type { Metadata } from "next";

import Header from "../Header";
import SiteFooter from "../SiteFooter";
import { projects } from "../data/projects";
import { ProjectCard } from "./ProjectUI";
import styles from "./work.module.css";

export const metadata: Metadata = {
  title: "Portfolio — Custom Websites for Small Businesses · Kyle Stringham, League City TX",
  description:
    "Case studies of custom websites and web applications built by Kyle Stringham for small businesses in League City, Houston and beyond: storage, ABA and autism support, exam prep, coaching.",
  alternates: { canonical: "/work" },
};

export default function WorkPage() {
  return (
    <>
      <Header />
      <main className={styles.page}>
        <section className={styles.indexHero} id="top">
          {/* Low sun through a stand of pines. The frame is near-black down the
              left and warm where the light breaks through on the right, so the
              copy column already sits on the darkest part of the photograph and
              the scrim only has to finish the job. Eager and high priority:
              this is the LCP element. */}
          <img
            className={styles.indexHeroImage}
            src="/work/hero-forest.webp"
            srcSet="/work/hero-forest-900.webp 900w, /work/hero-forest-1280.webp 1280w, /work/hero-forest.webp 2000w"
            sizes="100vw"
            alt=""
            width="2000"
            height="1333"
            fetchPriority="high"
            decoding="async"
          />
          <span className={styles.indexHeroScrim} aria-hidden="true" />

          <div className={styles.indexHeroInner}>
            <p className={styles.eyebrow} data-hero>Projects / Work</p>
            <h1 data-hero>Custom sites. Built around the business.</h1>
            <p className={styles.indexHeroCopy} data-hero>
              Custom websites and web applications for small businesses — from
              service companies and practices to coaches and course creators.
            </p>
          </div>
        </section>

        <section className={styles.indexSection} aria-labelledby="projects-heading">
          <div className={styles.indexInner}>
            <p className={styles.projectCount}>{projects.length} PROJECTS</p>
            <h2 id="projects-heading" className="tag" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
              Project case studies
            </h2>
            <div className={styles.projectGrid} data-reveal-group>
              {projects.map((project, index) => (
                <ProjectCard project={project} index={index} key={project.slug} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
