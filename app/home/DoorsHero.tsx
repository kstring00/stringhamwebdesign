"use client";

import { useEffect, useRef } from "react";

import { studioLine } from "../data/site";
import { CoffeeCup, CoffeeRing, Pieces, Rosetta } from "../motifs/Motifs";
import { gsap, SplitText, isFinePointerDesktop, prefersReducedMotion } from "../motion/gsap";
import styles from "./doors.module.css";

function Arrow() {
  return (
    <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
      <path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

/**
 * Two doors: coffee on the left, clinics on the right, one headline across
 * both. On desktop with a fine pointer, hovering (or focusing) a door
 * widens it to about 60% and deepens its color while the other dims; a
 * click plays a color wipe into that world (see PageTransition, which reads
 * data-wipe). On phones the doors stack, coffee first, and the headline is
 * shown at once (it is the page's largest paint). With reduced motion
 * nothing moves: no steam, no drawing, no assembly.
 */
export default function DoorsHero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    let split: SplitText | null = null;
    // Phones: the headline is the largest paint, so it shows at once and only
    // the lines around it fade in. The masked line reveal is desktop-only.
    if (!isFinePointerDesktop()) {
      const ctx = gsap.context(() => {
        gsap.from(el.querySelectorAll("[data-hero]"), { autoAlpha: 0, y: 12, duration: 0.6, stagger: 0.08, delay: 0.1 });
      }, el);
      return () => ctx.revert();
    }
    const ctx = gsap.context(() => {
      const h1 = el.querySelector("h1")!;
      const run = () => {
        split = SplitText.create(h1, { type: "lines", mask: "lines", linesClass: styles.line });
        gsap.timeline({ defaults: { ease: "power4.out" } })
          .from(split.lines, { yPercent: 110, duration: 0.9, stagger: 0.09 }, 0.05)
          .from(el.querySelectorAll("[data-hero]"), { autoAlpha: 0, y: 16, duration: 0.7, stagger: 0.08 }, 0.4);
      };
      if (document.fonts?.status === "loaded") run();
      else document.fonts?.ready.then(run);
    }, el);
    return () => { split?.revert(); ctx.revert(); };
  }, []);

  return (
    <section className={styles.doors} ref={root} aria-labelledby="hero-title">
      <div className={styles.head}>
        <p className={styles.eyebrow} data-hero>{studioLine}</p>
        <h1 id="hero-title" className={styles.title}>Websites for the places people come back to.</h1>
        <p className={styles.sub} data-hero>Custom websites for independent coffee shops and autism therapy clinics. Built by me, owned by you.</p>
      </div>

      <div className={styles.row}>
        <a className={`${styles.door} ${styles.coffee} world-coffee`} href="/coffee-shops" data-wipe="#3a261c" data-cursor="grow">
          <CoffeeRing className={styles.ringA} />
          <CoffeeRing className={styles.ringB} />
          <div className={styles.motif}>
            <CoffeeCup level={0.72} className={styles.cup} />
            <Rosetta className={styles.rosetta} />
          </div>
          <div className={styles.copy}>
            <p className={styles.label}>For coffee shops</p>
            <p className={styles.line2}>Turn a morning stop into a morning routine.</p>
            <span className={`btn ${styles.enter}`}>Enter <Arrow /></span>
          </div>
        </a>

        <a className={`${styles.door} ${styles.clinic} world-clinic`} href="/autism-clinics" data-wipe="#3f6457" data-cursor="grow">
          <div className={styles.motif}>
            <Pieces mode="load" className={styles.pieces} />
          </div>
          <div className={styles.copy}>
            <p className={styles.label}>For autism clinics</p>
            <p className={styles.line2}>Give families support between sessions.</p>
            <span className={`btn ${styles.enter}`}>Enter <Arrow /></span>
          </div>
        </a>
      </div>
    </section>
  );
}
