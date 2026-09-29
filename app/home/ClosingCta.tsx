"use client";

import { useEffect, useRef } from "react";

import { cta } from "../data/nav";
import Magnetic from "../motion/Magnetic";
import { drawStrokes, prepareStrokes } from "../motion/draw";
import { ScrollTrigger, prefersReducedMotion } from "../motion/gsap";
import { roughLine } from "../motifs/sketch";
import sk from "../motifs/sketch.module.css";
import styles from "./home.module.css";

/**
 * The closing. A giant line with a pencil underline that draws itself as
 * the section comes into view, and the one button. Drawn in full without
 * JS or with reduced motion.
 */
export default function ClosingCta({ line = "Let's make it real." }: { line?: string }) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const strokes = prepareStrokes(el);
    const st = ScrollTrigger.create({ trigger: el, start: "top 60%", once: true, onEnter: () => drawStrokes(strokes, { duration: 1.1, stagger: 0.35, ease: "power2.inOut" }) });
    return () => { st.kill(); strokes.forEach((s) => { (s as SVGElement).style.strokeDasharray = ""; (s as SVGElement).style.strokeDashoffset = ""; }); };
  }, []);

  return (
    <section className={`${styles.closing} ink`} ref={root} aria-labelledby="closing-title">
      <div className="container">
        <h2 id="closing-title" className={styles.closingLine} data-reveal>
          <span className={styles.closingWords}>
            {line}
            <svg className={styles.underline} viewBox="0 0 1000 40" preserveAspectRatio="none" aria-hidden="true" focusable="false">
              <path className={sk.pencil} data-stroke d={roughLine(4, 18, 996, 22, 31, 2.4)} style={{ stroke: "rgba(244, 239, 230, 0.55)", strokeWidth: 2 }} />
              <path className={sk.ember} data-stroke d={roughLine(10, 28, 990, 24, 32, 1.6)} style={{ stroke: "var(--ember-on-ink)", strokeWidth: 2.4 }} />
            </svg>
          </span>
        </h2>
        <div data-reveal>
          <Magnetic>
            <a className="btn" href={cta.href} data-cursor="grow">
              {cta.label}
              <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true"><path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.4" /></svg>
            </a>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
