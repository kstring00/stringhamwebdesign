"use client";

import { useEffect, useRef } from "react";

import { steps } from "../data/process";
import { gsap, isFinePointerDesktop, prefersReducedMotion } from "../motion/gsap";
import { roughLine } from "../motifs/sketch";
import sk from "../motifs/sketch.module.css";
import styles from "./home.module.css";

/**
 * How it works. Four steps on one rule, told as a short sticky scroll story
 * on desktop: the section pins briefly while a solid ink line draws over
 * the pencil one, and each step's marker turns from a sketched ring into a
 * solid ember dot as the line reaches it. Phones get the same line down the
 * left edge, without pinning. With reduced motion (or no JS) the line is
 * solid and every step is lit.
 */
export default function ProcessStory() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const pinBox = el.querySelector<HTMLElement>("[data-pin]")!;
    const list = el.querySelector<HTMLElement>("[data-steps]")!;
    const fill = el.querySelector<HTMLElement>("[data-fill]")!;
    const items = gsap.utils.toArray<HTMLElement>("[data-step]", el);
    el.dataset.animate = "";

    const mm = gsap.matchMedia();
    mm.add({ wide: "(min-width: 64rem)", narrow: "(max-width: 63.99rem)" }, (context) => {
      const wide = Boolean(context.conditions?.wide);
      const pin = wide && isFinePointerDesktop();
      const light = (p: number) => items.forEach((item, i) => item.classList.toggle(styles.stepLit, p >= (wide ? i / items.length + 0.03 : (i + 0.15) / items.length)));
      gsap.fromTo(fill, wide ? { scaleX: 0, scaleY: 1 } : { scaleY: 0, scaleX: 1 }, {
        ...(wide ? { scaleX: 1 } : { scaleY: 1 }),
        ease: "none",
        scrollTrigger: pin
          ? { trigger: pinBox, start: "center center", end: "+=80%", pin: true, scrub: 0.5, onUpdate: (self) => light(self.progress) }
          : { trigger: list, start: "top 80%", end: wide ? "bottom 40%" : "bottom 50%", scrub: 0.5, onUpdate: (self) => light(self.progress) },
      });
      light(0);
    });

    return () => { mm.revert(); delete el.dataset.animate; items.forEach((i) => i.classList.remove(styles.stepLit)); };
  }, []);

  return (
    <section className={styles.process} ref={root} aria-labelledby="process-title">
      <div className="container" data-pin>
        <div className={styles.sectionHead}>
          <p className="label"><b>06</b> How it works</p>
          <h2 id="process-title" className="display-l">Four steps. No surprises.</h2>
        </div>
        <div className={styles.flow}>
          {/* The pencil rule, and the solid line that draws over it. */}
          <div className={styles.rail} aria-hidden="true">
            <svg className={styles.railPencil} viewBox="0 0 1000 4" preserveAspectRatio="none" focusable="false"><path className={sk.pencil} d={roughLine(0, 2, 1000, 2, 21, 0.8)} /></svg>
            <svg className={styles.railPencilV} viewBox="0 0 4 1000" preserveAspectRatio="none" focusable="false"><path className={sk.pencil} d={roughLine(2, 0, 2, 1000, 22, 0.8)} /></svg>
            <span className={styles.railFill} data-fill />
          </div>
          <ol className={styles.steps} data-steps>
            {steps.map((s) => (
              <li className={styles.step} key={s.n} data-step>
                <span className={styles.stepMark} aria-hidden="true">
                  <svg viewBox="0 0 32 32" focusable="false">
                    <path className={`${sk.pencil} ${styles.markRing}`} d="M16 5.5c5.6-.4 10.3 4.4 10.4 10.2.2 5.9-4.6 10.9-10.4 10.8C10 26.4 5.4 21.6 5.6 15.7 5.8 10 10.3 5.9 16.6 5.5" />
                    <circle className={styles.markDot} cx="16" cy="16" r="6.5" />
                  </svg>
                </span>
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
