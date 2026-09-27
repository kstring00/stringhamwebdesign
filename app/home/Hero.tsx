"use client";

import { useEffect, useRef } from "react";

import { cta } from "../data/nav";
import Magnetic from "../motion/Magnetic";
import { gsap, SplitText, prefersReducedMotion } from "../motion/gsap";
import styles from "./home.module.css";

function Arrow() {
  return (
    <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
      <path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

/**
 * The hero. The headline is set in the display face and reveals line by
 * line, masked and staggered, on load; the whole sequence is under 1.2s.
 * The text is readable immediately without JS: the split only happens
 * after fonts are ready, and the hidden state is applied by the script.
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    let split: SplitText | null = null;
    const ctx = gsap.context(() => {
      const h1 = el.querySelector("h1")!;
      const run = () => {
        split = SplitText.create(h1, { type: "lines", mask: "lines", linesClass: styles.line });
        gsap.timeline({ defaults: { ease: "power4.out" } })
          .from(split.lines, { yPercent: 110, duration: 0.9, stagger: 0.09 }, 0.05)
          .from(el.querySelectorAll("[data-hero]"), { autoAlpha: 0, y: 18, duration: 0.7, stagger: 0.08 }, 0.45);
      };
      if (document.fonts?.status === "loaded") run();
      else document.fonts?.ready.then(run);
    }, el);
    return () => { split?.revert(); ctx.revert(); };
  }, []);

  return (
    <section className={styles.hero} ref={root} aria-labelledby="hero-title">
      <div className="container">
        <p className={styles.eyebrow} data-hero>Stringham Web Design · League City, Texas</p>
        <h1 id="hero-title" className={`display-xl ${styles.h1}`}>Websites that feel like walking through your front door.</h1>
        <div className={styles.heroRow}>
          <p className={`lede ${styles.sub}`} data-hero>Custom, beautifully crafted websites for clinics, cafés, and the businesses people love. Built by me, owned by you.</p>
          <div className={styles.heroActions} data-hero>
            <Magnetic><a className="btn" href={cta.href}>{cta.label} <Arrow /></a></Magnetic>
            <Magnetic><a className="btn btn-secondary" href="/work">See the work</a></Magnetic>
          </div>
        </div>
      </div>
    </section>
  );
}
