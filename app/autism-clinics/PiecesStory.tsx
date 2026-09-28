"use client";

import { useEffect, useRef, useState } from "react";
import type { ScrollTrigger } from "gsap/ScrollTrigger";

import { Pieces } from "../motifs/Motifs";
import { isFinePointerDesktop } from "../motion/gsap";
import styles from "../niche.module.css";

/**
 * The clinic scroll moment. Four soft pieces drift in from scattered
 * positions and settle into one whole as the reader scrolls; each label
 * fades in as its piece lands, and "Everyone on the same page." appears
 * once the whole is complete. Desktop pins the section for the assembly;
 * phones assemble it as it passes. Reduced motion shows it whole.
 */
export default function PiecesStory() {
  const section = useRef<HTMLElement>(null);
  // Starts true so the line is there without JS; scrolling hides it until the whole is complete.
  const [whole, setWhole] = useState(true);
  const [scroll, setScroll] = useState<ScrollTrigger.Vars | undefined>(undefined);

  useEffect(() => {
    // Decide on pinning after mount, where the pointer can be known.
    const id = requestAnimationFrame(() => {
      if (isFinePointerDesktop()) setScroll({ trigger: section.current, start: "top top", end: "+=110%", pin: true, scrub: 0.6 });
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <section className={`${styles.section} ${styles.assemble}`} ref={section} aria-labelledby="together-title">
      <div className={`container ${styles.assembleGrid}`}>
        <div className={styles.assembleText}>
          <p className="label"><b>02</b> Coming together</p>
          <h2 id="together-title" className="display-m">A family&rsquo;s week has a lot of moving parts.</h2>
          <p className={styles.assembleBody}>Parents, your team, home and the clinic. The right website helps them fit.</p>
          <p className={`${styles.sameLine} ${whole ? styles.sameLineOn : ""}`} aria-live="polite">Everyone on the same page.</p>
        </div>
        <figure className={styles.assembleFigure}>
          <Pieces key={scroll ? "pinned" : "free"} mode="scroll" scroll={scroll} trigger={section} labels={["Parents", "Your team", "Home", "Clinic"]} className={styles.bigPieces} onComplete={setWhole} />
          <figcaption className="sr-only">Four pieces labeled Parents, Your team, Home and Clinic fit together into one whole.</figcaption>
        </figure>
      </div>
    </section>
  );
}
