"use client";

import { useEffect, useRef } from "react";

import { steps } from "../data/process";
import { gsap, isFinePointerDesktop, prefersReducedMotion } from "../motion/gsap";
import styles from "./home.module.css";

/** Step marker, coffee world: a small cup that fills when its step lights. */
function CupMarker() {
  return (
    <svg className={styles.markCup} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path className={styles.markCupFill} d="M7 12h16l-1.6 13.2A2.4 2.4 0 0 1 19 27.4h-8a2.4 2.4 0 0 1-2.4-2.2z" />
      <path className={styles.markCupLine} d="M7 12h16l-1.6 13.2A2.4 2.4 0 0 1 19 27.4h-8a2.4 2.4 0 0 1-2.4-2.2zM23 15c4.4 0 4.4 7 0 7" />
    </svg>
  );
}

/** Step marker, clinic world: four soft quarters that click together. */
function PiecesMarker() {
  return (
    <svg className={styles.markPieces} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path className={styles.q1} d="M15 4.1A12 12 0 0 0 4.1 15H15z" />
      <path className={styles.q2} d="M17 4.1V15h10.9A12 12 0 0 0 17 4.1z" />
      <path className={styles.q3} d="M4.1 17A12 12 0 0 0 15 27.9V17z" />
      <path className={styles.q4} d="M17 27.9A12 12 0 0 0 27.9 17H17z" />
    </svg>
  );
}

/**
 * How it works. Four steps on one rule, a short sticky scroll story on
 * desktop: the section pins briefly while an ember line draws along the
 * rule, and each step's marker comes alive as the line reaches it. The
 * markers alternate worlds: a cup filling, then pieces clicking together.
 * Phones get the same line down the left edge, without pinning. With
 * reduced motion (or no JS) everything is drawn, filled and together.
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
          <p className="label"><b>04</b> How it works</p>
          <h2 id="process-title" className="display-l">Four steps. No surprises.</h2>
        </div>
        <div className={styles.flow}>
          <div className={styles.rail} aria-hidden="true"><span className={styles.railFill} data-fill /></div>
          <ol className={styles.steps} data-steps>
            {steps.map((s, i) => (
              <li className={styles.step} key={s.n} data-step>
                <span className={styles.stepMark}>{i % 2 === 0 ? <CupMarker /> : <PiecesMarker />}</span>
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
