"use client";

import { useEffect, useRef } from "react";

import { steps } from "../data/process";
import { gsap, ScrollTrigger, isFinePointerDesktop, prefersReducedMotion } from "../motion/gsap";
import styles from "./home.module.css";

/**
 * A sticky scroll story on desktop: the big step number stays pinned on the
 * left while each step's text swaps in as the reader scrolls. On touch and
 * with reduced motion, the four steps stack and read top to bottom.
 */
export default function ProcessStory() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion() || !isFinePointerDesktop()) return;
    el.dataset.story = "";
    const ctx = gsap.context(() => {
      const number = el.querySelector<HTMLElement>("[data-number]")!;
      const panels = el.querySelectorAll<HTMLElement>("[data-step]");
      panels.forEach((panel, i) => {
        ScrollTrigger.create({
          trigger: panel,
          start: "top 60%",
          end: "bottom 60%",
          onEnter: () => set(i),
          onEnterBack: () => set(i),
        });
      });
      function set(i: number) {
        const n = steps[i].n;
        if (number.textContent === n) return;
        gsap.timeline()
          .to(number, { yPercent: -30, autoAlpha: 0, duration: 0.18, ease: "power2.in" })
          .add(() => { number.textContent = n; })
          .fromTo(number, { yPercent: 30, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.32, ease: "power3.out" });
        panels.forEach((p, j) => p.classList.toggle(styles.stepActive, j === i));
      }
      set(0);
    }, el);
    return () => { ctx.revert(); delete el.dataset.story; };
  }, []);

  return (
    <section className={styles.process} ref={root} aria-labelledby="process-title">
      <div className="container">
        <div className={styles.sectionHead}>
          <p className="label"><b>03</b> How it goes</p>
          <h2 id="process-title" className="display-l">Four steps. No surprises.</h2>
        </div>
        <div className={styles.story}>
          <div className={styles.storyPin} aria-hidden="true">
            <span className={styles.storyNumber} data-number>01</span>
          </div>
          <ol className={styles.steps}>
            {steps.map((s) => (
              <li className={styles.step} key={s.n} data-step data-reveal>
                <span className={styles.stepN} aria-hidden="true">{s.n}</span>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepBody}>{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
