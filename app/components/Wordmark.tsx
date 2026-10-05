"use client";

import { useEffect, useRef } from "react";

import { gsap, ScrollTrigger, prefersReducedMotion } from "../motion/gsap";
import styles from "./Footer.module.css";

/**
 * The footer wordmark: "Stringham" as SVG text that is first a pencil
 * outline and fills solid as it scrolls into view. Solid by default (no JS,
 * reduced motion); the script only rewinds it when it will animate it.
 */
export default function Wordmark() {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg || prefersReducedMotion()) return;
    const text = svg.querySelector("text")!;
    const dash = 900;
    gsap.set(text, { fillOpacity: 0, strokeOpacity: 1, strokeDasharray: dash, strokeDashoffset: dash });
    const st = ScrollTrigger.create({
      trigger: svg,
      start: "top 90%",
      once: true,
      onEnter: () => {
        gsap.timeline()
          .to(text, { strokeDashoffset: 0, duration: 1.8, ease: "power2.inOut" })
          .to(text, { fillOpacity: 1, duration: 1.1, ease: "power2.inOut" }, "-=0.5")
          .to(text, { strokeOpacity: 0, duration: 0.8 }, "<0.3");
      },
    });
    return () => { st.kill(); gsap.set(text, { clearProps: "all" }); };
  }, []);

  return (
    <svg className={styles.wordmark} ref={ref} viewBox="0 0 1000 205" aria-hidden="true" focusable="false">
      <text className={styles.wordText} x="0" y="180" textLength="1000" lengthAdjust="spacingAndGlyphs">Stringham</text>
    </svg>
  );
}
