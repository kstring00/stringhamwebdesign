"use client";

import { useEffect, useRef } from "react";

import { projects } from "../data/projects";
import { gsap, ScrollTrigger, isFinePointerDesktop, prefersReducedMotion } from "../motion/gsap";
import styles from "./home.module.css";

/**
 * The showpiece. On desktop the gallery pins and scrolls sideways: each
 * project is a large framed capture that scales and drifts slightly as it
 * passes, its name set in the display face. On touch, and with reduced
 * motion, it is a vertical stack with the same reveal as everything else.
 */
export default function FeaturedWork() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sec = section.current, tr = track.current;
    if (!sec || !tr || prefersReducedMotion() || !isFinePointerDesktop()) return;
    sec.dataset.horizontal = "";
    const ctx = gsap.context(() => {
      const distance = () => tr.scrollWidth - window.innerWidth;
      const tween = gsap.to(tr, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: { trigger: sec, pin: true, scrub: 0.6, start: "top top", end: () => `+=${distance()}`, invalidateOnRefresh: true, anticipatePin: 1 },
      });
      tr.querySelectorAll<HTMLElement>("[data-frame]").forEach((frame) => {
        const img = frame.querySelector("img");
        gsap.fromTo(frame, { scale: 0.92 }, { scale: 1, ease: "none", scrollTrigger: { trigger: frame, containerAnimation: tween, start: "left 90%", end: "left 35%", scrub: true } });
        if (img) gsap.fromTo(img, { xPercent: -4 }, { xPercent: 4, ease: "none", scrollTrigger: { trigger: frame, containerAnimation: tween, start: "left right", end: "right left", scrub: true } });
      });
    }, sec);
    return () => { ctx.revert(); delete sec.dataset.horizontal; ScrollTrigger.refresh(); };
  }, []);

  return (
    <section className={styles.work} ref={section} aria-labelledby="work-title">
      <div className={`container ${styles.workHead}`}>
        <p className="label"><b>01</b> Featured work</p>
        <h2 id="work-title" className="display-l">Real businesses, built around how they work.</h2>
      </div>
      <div className={styles.track} ref={track} data-reveal-group>
        {projects.map((p, i) => (
          <a className={styles.project} href={p.href} target="_blank" rel="noopener noreferrer" key={p.slug} data-reveal data-cursor="view">
            <div className={`frame ${styles.frame}`} data-frame>
              <img src={p.image.src} alt={p.image.alt} width={p.image.width} height={p.image.height} loading={i === 0 ? "eager" : "lazy"} decoding="async" />
            </div>
            <div className={styles.projectMeta}>
              <span className={styles.projectIndex}>{String(i + 1).padStart(2, "0")}</span>
              <span className={styles.projectName}>{p.name}</span>
              <span className={styles.projectCat}>{p.category}</span>
              <span className={styles.projectLine}>{p.line}</span>
              <span className="sr-only"> (opens in a new tab)</span>
            </div>
          </a>
        ))}
        <a className={styles.projectAll} href="/work" data-reveal>
          <span className="display-m">All the work</span>
          <span className={styles.projectAllArrow} aria-hidden="true">→</span>
        </a>
      </div>
    </section>
  );
}
