import type { Metadata } from "next";

import Header from "../Header";
import SiteFooter from "../SiteFooter";
import SiteMotion from "../SiteMotion";
import { projects } from "../data/projects";
import { PendingProjectCard, ProjectCard } from "./ProjectUI";
import styles from "./work.module.css";

export const metadata: Metadata = {
  title: "Work | Kyle Stringham Web Design & Development",
  description: "Custom websites and web applications for small businesses.",
};

export default function WorkPage() {
  return (
    <>
      <Header />
      <main className={styles.page}>
        <section className={styles.indexHero} id="top">
          <div className={styles.indexHeroInner}>
            <p className={styles.eyebrow}>Projects / Work</p>
            <h1>Custom sites. Built around the business.</h1>
            <p className={styles.indexHeroCopy}>
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
            <div className={styles.projectGrid}>
              {projects.map((project, index) => (
                <ProjectCard project={project} index={index} key={project.slug} />
              ))}
              <PendingProjectCard index={projects.length} />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <SiteMotion />
    </>
  );
}
