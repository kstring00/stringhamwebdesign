"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { drawStrokes, prepareStrokes } from "../motion/draw";
import { gsap, ScrollTrigger, prefersReducedMotion } from "../motion/gsap";
import { hatch, roughCircle, roughLine, roughRect } from "./sketch";
import sk from "./sketch.module.css";
import styles from "./illustrations.module.css";

/* Six small drawings on a 200 × 160 sheet. Each has a pencil layer (rough
   strokes that draw themselves) and a finished layer (clean ink, a little
   ember) that fades in over it. */

type Layers = { pencil: ReactNode; finished: ReactNode };

const P = (d: string, k?: number, soft?: boolean) => <path key={k} className={soft ? sk.pencilSoft : sk.pencil} data-stroke d={d} />;

const DRAWINGS: Record<string, Layers> = {
  website: {
    pencil: [
      P(roughRect(20, 24, 160, 112, 101, 1.6), 1),
      P(roughLine(20, 44, 180, 44, 102), 2),
      P(roughCircle(31, 34, 3, 103), 3),
      P(roughLine(40, 68, 120, 68, 104, 1.3), 4),
      P(roughLine(40, 82, 100, 82, 105, 1.3), 5),
      P(roughRect(40, 100, 48, 16, 106, 1.2), 6),
      P(roughRect(120, 62, 44, 54, 107, 1.4), 7),
      P(hatch(124, 66, 36, 46, 108, 10), 8, true),
    ],
    finished: (
      <>
        <rect className={sk.inkLine} x="20" y="24" width="160" height="112" rx="6" />
        <path className={sk.inkLine} d="M20 44h160" />
        <circle cx="31" cy="34" r="3" fill="var(--ember)" />
        <path className={sk.inkLine} d="M40 68h80M40 82h60" style={{ strokeWidth: 3 }} />
        <rect x="40" y="100" width="48" height="16" rx="8" fill="var(--ink)" />
        <rect x="120" y="62" width="44" height="54" rx="4" fill="var(--paper-deep)" />
        <circle cx="150" cy="104" r="14" fill="var(--ember)" />
      </>
    ),
  },
  "get-paid": {
    pencil: [
      P(roughRect(58, 16, 84, 128, 111, 1.6), 1),
      P(roughLine(88, 28, 112, 28, 112), 2),
      P(roughRect(72, 48, 56, 34, 113, 1.4), 3),
      P(roughLine(72, 60, 128, 60, 114), 4),
      P(roughLine(78, 72, 100, 72, 115, 1.2), 5),
      P(roughCircle(100, 110, 16, 116), 6),
      P("M91 110l6 6 12-12", 7),
    ],
    finished: (
      <>
        <rect className={sk.inkLine} x="58" y="16" width="84" height="128" rx="10" />
        <path className={sk.inkLine} d="M88 28h24" />
        <rect x="72" y="48" width="56" height="34" rx="4" fill="var(--ink)" />
        <path d="M72 60h56" stroke="var(--paper)" strokeWidth="4" />
        <path d="M78 72h22" stroke="var(--paper)" strokeWidth="2" />
        <circle cx="100" cy="110" r="16" fill="var(--ember)" />
        <path d="M91 110l6 6 12-12" fill="none" stroke="var(--paper)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  "get-found": {
    pencil: [
      P(roughRect(24, 20, 152, 26, 121, 1.4), 1),
      P(roughCircle(40, 33, 5, 122), 2),
      P(roughLine(44, 37, 48, 41, 123), 3),
      P(roughLine(60, 33, 130, 33, 124, 1.2), 4),
      P(roughLine(24, 70, 176, 70, 125) + roughLine(24, 100, 176, 100, 126) + roughLine(24, 130, 176, 130, 127), 5, true),
      P(roughLine(70, 56, 70, 144, 128) + roughLine(130, 56, 130, 144, 129), 6, true),
      P("M100 74c-13 0-22 10-22 22 0 16 22 40 22 40s22-24 22-40c0-12-9-22-22-22z", 7),
      P(roughCircle(100, 96, 7, 130), 8),
    ],
    finished: (
      <>
        <rect className={sk.inkLine} x="24" y="20" width="152" height="26" rx="13" />
        <circle className={sk.inkLine} cx="40" cy="33" r="5" />
        <path className={sk.inkLine} d="M44 37l4 4M60 33h70" />
        <path d="M24 70h152M24 100h152M24 130h152M70 56v88M130 56v88" stroke="var(--line)" strokeWidth="1" />
        <path d="M100 74c-13 0-22 10-22 22 0 16 22 40 22 40s22-24 22-40c0-12-9-22-22-22z" fill="var(--ember)" />
        <circle cx="100" cy="96" r="7" fill="var(--paper)" />
      </>
    ),
  },
  "keep-them-coming-back": {
    pencil: [
      P(roughRect(30, 44, 140, 92, 131, 1.6), 1),
      P(roughLine(30, 46, 100, 100, 132, 1.4) + roughLine(100, 100, 170, 46, 133, 1.4), 2),
      P(roughLine(30, 134, 78, 92, 134) + roughLine(170, 134, 122, 92, 135), 3, true),
      P(roughCircle(160, 48, 14, 136), 4),
      P(roughLine(154, 48, 166, 48, 137) + roughLine(160, 42, 160, 54, 138), 5),
    ],
    finished: (
      <>
        <rect className={sk.inkLine} x="30" y="44" width="140" height="92" rx="6" />
        <path className={sk.inkLine} d="M30 46l70 54 70-54" />
        <path d="M30 134l48-42M170 134l-48-42" stroke="var(--line-strong)" strokeWidth="1.2" />
        <circle cx="160" cy="48" r="14" fill="var(--ember)" />
        <path d="M154 48h12M160 42v12" stroke="var(--paper)" strokeWidth="2.2" strokeLinecap="round" />
      </>
    ),
  },
  "look-the-part": {
    pencil: [
      P(roughRect(24, 28, 40, 40, 141, 1.4) + roughRect(72, 28, 40, 40, 142, 1.4) + roughRect(120, 28, 40, 40, 143, 1.4), 1),
      P(hatch(28, 32, 32, 32, 144, 9), 2, true),
      P(roughLine(24, 92, 176, 92, 145), 3, true),
      P("M40 138l18-42 18 42M46 124h24", 4),
      P(roughLine(92, 104, 168, 104, 146, 1.4) + roughLine(92, 120, 150, 120, 147, 1.2) + roughLine(92, 136, 130, 136, 148, 1.2), 5),
    ],
    finished: (
      <>
        <rect x="24" y="28" width="40" height="40" rx="4" fill="var(--ink)" />
        <rect x="72" y="28" width="40" height="40" rx="4" fill="var(--ember)" />
        <rect className={sk.inkLine} x="120" y="28" width="40" height="40" rx="4" fill="var(--paper-deep)" />
        <path d="M24 92h152" stroke="var(--line)" strokeWidth="1" />
        <path className={sk.inkLine} d="M40 138l18-42 18 42M46 124h24" style={{ strokeWidth: 2.4 }} />
        <path className={sk.inkLine} d="M92 104h76M92 120h58M92 136h38" style={{ strokeWidth: 3 }} />
      </>
    ),
  },
  "never-deal-with-the-tech": {
    pencil: [
      P("M100 22c-30 0-44 18-46 36-14 2-28 12-28 30 0 20 16 32 34 32h82c20 0 34-14 34-32 0-18-14-30-30-30 0-20-18-36-46-36z", 1),
      P(roughCircle(100, 88, 22, 151), 2),
      P(roughLine(90, 88, 98, 96, 152) + roughLine(98, 96, 114, 78, 153), 3),
      P(roughLine(70, 140, 130, 140, 154), 4, true),
    ],
    finished: (
      <>
        <path className={sk.inkLine} d="M100 22c-30 0-44 18-46 36-14 2-28 12-28 30 0 20 16 32 34 32h82c20 0 34-14 34-32 0-18-14-30-30-30 0-20-18-36-46-36z" fill="var(--paper-deep)" />
        <circle cx="100" cy="88" r="22" fill="var(--ember)" />
        <path d="M90 88l8 8 16-18" fill="none" stroke="var(--paper)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M70 140h60" stroke="var(--line-strong)" strokeWidth="1.2" />
      </>
    ),
  },
};

/**
 * One drawing. Finished by default (no JS, reduced motion). With motion,
 * the pencil draws itself as the drawing scrolls into view and the finished
 * version fades in over it.
 */
export default function Illustration({ name, className }: { name: keyof typeof DRAWINGS | string; className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const d = DRAWINGS[name] ?? DRAWINGS.website;

  useEffect(() => {
    const svg = ref.current;
    if (!svg || prefersReducedMotion()) return;
    const pencil = svg.querySelector<SVGGElement>("[data-pencil]")!;
    const finished = svg.querySelector<SVGGElement>("[data-finished]")!;
    const strokes = prepareStrokes(pencil);
    gsap.set(finished, { autoAlpha: 0 });
    gsap.set(pencil, { autoAlpha: 1 });
    const st = ScrollTrigger.create({
      trigger: svg,
      start: "top 78%",
      once: true,
      onEnter: () => {
        gsap.timeline()
          .add(drawStrokes(strokes, { duration: 0.7, stagger: 0.09, ease: "power1.inOut" }))
          .to(finished, { autoAlpha: 1, duration: 0.9, ease: "power2.inOut" }, "-=0.2")
          .to(pencil, { autoAlpha: 0.18, duration: 0.9, ease: "power2.inOut" }, "<");
      },
    });
    return () => { st.kill(); gsap.set([pencil, finished], { clearProps: "all" }); strokes.forEach((s) => { (s as SVGElement).style.strokeDasharray = ""; (s as SVGElement).style.strokeDashoffset = ""; }); };
  }, [name]);

  return (
    <svg className={`${styles.sheet} ${className ?? ""}`} ref={ref} viewBox="0 0 200 160" aria-hidden="true" focusable="false">
      <g className={styles.pencil} data-pencil>{d.pencil}</g>
      <g data-finished>{d.finished}</g>
    </svg>
  );
}
