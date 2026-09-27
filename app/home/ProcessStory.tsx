"use client";

import { useEffect, useRef } from "react";

import { steps } from "../data/process";
import { gsap, prefersReducedMotion } from "../motion/gsap";
import styles from "./home.module.css";

/**
 * How it goes. Four steps on one thin rule: across the page on desktop,
 * down the left edge on phones. As the reader scrolls, an ember line draws
 * along the rule and each step's number lights up when the line reaches
 * it. One short pass, no pinning. With reduced motion (or no JS) the line
 * is drawn and every step is lit from the start.
 */
export default function ProcessStory() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const list = el.querySelector<HTMLElement>("[data-steps]")!;
    const fill = el.querySelector<HTMLElement>("[data-fill]")!;
    const items = gsap.utils.toArray<HTMLElement>("[data-step]", el);
    el.dataset.animate = "";

    const mm = gsap.matchMedia();
    mm.add({ wide: "(min-width: 64rem)", narrow: "(max-width: 63.99rem)" }, (context) => {
      const wide = Boolean(context.conditions?.wide);
      const light = (p: number) => items.forEach((item, i) => item.classList.toggle(styles.stepLit, p >= (wide ? i / items.length + 0.02 : (i + 0.15) / items.length)));
      gsap.fromTo(fill, wide ? { scaleX: 0, scaleY: 1 } : { scaleY: 0, scaleX: 1 }, {
        ...(wide ? { scaleX: 1 } : { scaleY: 1 }),
        ease: "none",
        scrollTrigger: {
          trigger: list,
          start: "top 80%",
          end: wide ? "bottom 40%" : "bottom 50%",
          scrub: 0.5,
          onUpdate: (self) => light(self.progress),
        },
      });
      light(0);
    });

    return () => { mm.revert(); delete el.dataset.animate; items.forEach((i) => i.classList.remove(styles.stepLit)); };
  }, []);

  return (
    <section className={styles.process} ref={root} aria-labelledby="process-title">
      <div className="container">
        <div className={styles.sectionHead}>
          <p className="label"><b>03</b> How it goes</p>
          <h2 id="process-title" className="display-l">Four steps. No surprises.</h2>
        </div>
        <div className={styles.flow}>
          <div className={styles.rail} aria-hidden="true"><span className={styles.railFill} data-fill /></div>
          <ol className={styles.steps} data-steps>
            {steps.map((s) => (
              <li className={styles.step} key={s.n} data-step>
                <span className={styles.stepDot} aria-hidden="true" />
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
