"use client";

import { forwardRef, useEffect, useId, useImperativeHandle, useRef } from "react";

import { gsap, ScrollTrigger, prefersReducedMotion, whenIdle } from "../motion/gsap";
import styles from "./motifs.module.css";

/*
 * The two worlds' motifs, all inline SVG. Every one is decorative
 * (aria-hidden) and has a static form: with reduced motion the steam
 * holds still, the rosetta is already drawn, the cup is full and the
 * pieces are already together.
 */

/* ---------- coffee ---------- */

const STEAM = [
  "M72 56 C 60 42, 84 32, 72 16 C 62 2, 80 -8, 72 -22",
  "M98 52 C 86 36, 110 26, 98 8 C 88 -6, 106 -16, 98 -32",
  "M124 56 C 112 42, 136 32, 124 16 C 114 2, 132 -8, 124 -22",
];

/** Loops the steam while it is on screen; pauses off screen. */
function useSteam(root: React.RefObject<SVGSVGElement | null>, enabled = true) {
  useEffect(() => {
    const el = root.current;
    if (!el || !enabled || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {});
    const cancel = whenIdle(() => ctx.add(() => {
      const paths = gsap.utils.toArray<SVGPathElement>("[data-steam]", el);
      const tl = gsap.timeline({ repeat: -1, paused: true });
      paths.forEach((p, i) => {
        tl.fromTo(p, { y: 10, autoAlpha: 0 }, { keyframes: [{ y: -4, autoAlpha: 0.75, duration: 1.2, ease: "sine.out" }, { y: -22, autoAlpha: 0, duration: 1.6, ease: "sine.in" }] }, i * 0.9);
      });
      ScrollTrigger.create({ trigger: el, start: "top bottom", end: "bottom top", onToggle: (self) => (self.isActive ? tl.play() : tl.pause()) });
    }));
    return () => { cancel(); ctx.revert(); };
  }, [root, enabled]);
}

export type CupHandle = { fill: SVGGElement | null; steam: SVGGElement | null };

/**
 * A line-drawn mug. `level` (0–1) sets a static coffee level; a parent can
 * drive the level itself through the ref (the fill group scales from the
 * bottom). `steam` loops steam above it.
 */
export const CoffeeCup = forwardRef<CupHandle, { level?: number; steam?: boolean; className?: string }>(function CoffeeCup({ level = 0, steam = true, className }, ref) {
  const svg = useRef<SVGSVGElement>(null);
  const fill = useRef<SVGGElement>(null);
  const steamG = useRef<SVGGElement>(null);
  const clip = `cup-${useId().replace(/:/g, "")}`;
  useImperativeHandle(ref, () => ({ fill: fill.current, steam: steamG.current }));
  useSteam(svg, steam);
  return (
    <svg ref={svg} className={`${styles.cup} ${className ?? ""}`} viewBox="0 -44 200 240" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={clip}>
          <path d="M42 72 L52 160 Q54 172 66 172 L124 172 Q136 172 138 160 L148 72 Z" />
        </clipPath>
      </defs>
      <g ref={steamG} className={styles.steam}>
        {STEAM.map((d) => <path key={d} d={d} data-steam />)}
      </g>
      <g clipPath={`url(#${clip})`}>
        <g ref={fill} className={styles.coffee} style={{ transform: `scaleY(${level})` }}>
          <rect x="30" y="72" width="130" height="100" className={styles.coffeeBody} />
          <rect x="30" y="72" width="130" height="7" className={styles.coffeeCrema} />
        </g>
      </g>
      <path className={styles.line} d="M42 72 L52 160 Q54 172 66 172 L124 172 Q136 172 138 160 L148 72" />
      <path className={styles.line} d="M36 72 L154 72" />
      <path className={styles.line} d="M145 92 C 176 90, 178 138, 141 140" />
      <path className={styles.line} d="M18 184 Q 95 198, 172 184" />
    </svg>
  );
});

/** Build the rosetta: a stem and a stack of leaves, narrowing to a heart. */
function rosettaPaths() {
  const leaves: string[] = [];
  for (let i = 0; i < 7; i++) {
    const y = 150 - i * 15;
    const w = 50 - i * 6;
    leaves.push(`M${100 - w} ${y - 9} Q100 ${y + 14} ${100 + w} ${y - 9}`);
  }
  return [...leaves, "M86 46 Q100 26 114 46", "M100 172 L100 40"];
}
const ROSETTA = rosettaPaths();

/** A latte seen from above; the rosetta draws itself once, on load. */
export function Rosetta({ className }: { className?: string }) {
  const svg = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const el = svg.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const paths = gsap.utils.toArray<SVGPathElement>("[data-draw]", el);
      paths.forEach((p) => { const len = p.getTotalLength(); gsap.set(p, { strokeDasharray: len, strokeDashoffset: len }); });
    }, el);
    const cancel = whenIdle(() => ctx.add(() => {
      gsap.to(gsap.utils.toArray<SVGPathElement>("[data-draw]", el), { strokeDashoffset: 0, duration: 0.9, ease: "power2.inOut", stagger: 0.12, delay: 0.2 });
    }));
    return () => { cancel(); ctx.revert(); };
  }, []);
  return (
    <svg ref={svg} className={`${styles.rosetta} ${className ?? ""}`} viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      <circle cx="100" cy="100" r="94" className={styles.saucer} />
      <circle cx="100" cy="100" r="80" className={styles.latte} />
      <g className={styles.art}>
        {ROSETTA.map((d) => <path key={d} d={d} data-draw />)}
      </g>
    </svg>
  );
}

/** A faint ring, as if a mug was set down here. Static texture. */
export function CoffeeRing({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={`${styles.ring} ${className ?? ""}`} style={style} viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      <path d="M100 14 A86 86 0 1 1 22 128" />
      <path d="M100 22 A78 78 0 0 1 176 86" className={styles.ringThin} />
      <path d="M30 70 A82 82 0 0 1 64 28" className={styles.ringThin} />
    </svg>
  );
}

/** Tiny steam, for the footer. */
export function SteamMark({ className }: { className?: string }) {
  return (
    <svg className={`${styles.mark} ${className ?? ""}`} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <path d="M14 36 C 8 28, 20 22, 14 12 C 10 6, 16 2, 14 -2" />
      <path d="M26 36 C 20 28, 32 22, 26 12 C 22 6, 28 2, 26 -2" />
    </svg>
  );
}

/* ---------- clinic ---------- */

/*
 * One round whole cut into four soft pieces by two gentle S-curves. No
 * knobs, no sockets: this is deliberately not the jigsaw puzzle-piece
 * symbol. Each region is clipped to the circle, and a stroke in the page
 * color leaves a small gap between neighbours.
 */
const V_TOP = "C 100 60, 140 96, 120 120";
const H_LEFT_REV = "C 96 140, 60 100, -10 120";
const PIECES = [
  { key: "a", d: `M-10 -10 L120 -10 ${V_TOP} ${H_LEFT_REV} Z`, from: { x: -70, y: -52, rotation: -22 }, label: { x: 66, y: 74 } },
  { key: "b", d: "M120 -10 L250 -10 L250 120 C 180 140, 144 100, 120 120 C 140 96, 100 60, 120 -10 Z", from: { x: 78, y: -46, rotation: 18 }, label: { x: 172, y: 74 } },
  { key: "c", d: "M-10 120 C 60 100, 96 140, 120 120 C 100 144, 140 180, 120 250 L-10 250 Z", from: { x: -64, y: 60, rotation: 16 }, label: { x: 66, y: 176 } },
  { key: "d", d: "M120 120 C 144 100, 180 140, 250 120 L250 250 L120 250 C 140 180, 100 144, 120 120 Z", from: { x: 72, y: 56, rotation: -20 }, label: { x: 172, y: 176 } },
];

export type PiecesMode = "load" | "scroll" | "static";

/**
 * The clinic motif. "load" drifts the pieces together once on mount;
 * "scroll" ties the assembly to the scroll position of `trigger` (or the
 * SVG itself; `scroll` overrides the ScrollTrigger, e.g. to pin) and fades
 * labels in as each piece settles; "static" is
 * already whole. Reduced motion is always static.
 */
export function Pieces({ mode = "load", labels, trigger, scroll, className, onComplete }: { mode?: PiecesMode; labels?: [string, string, string, string]; trigger?: React.RefObject<HTMLElement | null>; scroll?: ScrollTrigger.Vars; className?: string; onComplete?: (done: boolean) => void }) {
  const svg = useRef<SVGSVGElement>(null);
  const clip = `pieces-${useId().replace(/:/g, "")}`;
  const done = useRef(onComplete);
  useEffect(() => { done.current = onComplete; }, [onComplete]);

  useEffect(() => {
    const el = svg.current;
    if (!el || mode === "static" || prefersReducedMotion()) { done.current?.(true); return; }
    const ctx = gsap.context(() => {
      const groups = gsap.utils.toArray<SVGGElement>("[data-piece]", el);
      const texts = gsap.utils.toArray<SVGTextElement>("[data-label]", el);
      groups.forEach((g, i) => gsap.set(g, { ...PIECES[i].from, opacity: 0.55, svgOrigin: "120 120" }));
      if (texts.length) gsap.set(texts, { opacity: 0 });
    }, el);
    const cancel = whenIdle(() => ctx.add(() => {
      const groups = gsap.utils.toArray<SVGGElement>("[data-piece]", el);
      const texts = gsap.utils.toArray<SVGTextElement>("[data-label]", el);
      if (mode === "load") {
        gsap.to(groups, { x: 0, y: 0, rotation: 0, opacity: 1, duration: 1.3, ease: "back.out(1.25)", stagger: 0.12, delay: 0.35, onComplete: () => done.current?.(true) });
        if (texts.length) gsap.to(texts, { opacity: 1, duration: 0.4, stagger: 0.1, delay: 1.6 });
      } else {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: trigger?.current ?? el, start: "top 75%", end: "bottom 60%", scrub: 0.6, ...scroll, onUpdate: (self) => done.current?.(self.progress > 0.98) },
        });
        groups.forEach((g, i) => {
          tl.to(g, { x: 0, y: 0, rotation: 0, opacity: 1, duration: 1, ease: "power2.out" }, i * 0.35);
          if (texts[i]) tl.to(texts[i], { opacity: 1, duration: 0.3 }, i * 0.35 + 0.8);
        });
      }
    }));
    return () => { cancel(); ctx.revert(); };
  }, [mode, trigger, scroll]);

  return (
    <svg ref={svg} className={`${styles.pieces} ${className ?? ""}`} viewBox="-30 -30 300 300" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={clip}><circle cx="120" cy="120" r="100" /></clipPath>
      </defs>
      {PIECES.map((p, i) => (
        <g key={p.key} data-piece className={styles[`piece_${p.key}`]}>
          <path d={p.d} clipPath={`url(#${clip})`} />
          {labels ? <text data-label x={p.label.x} y={p.label.y} textAnchor="middle" dominantBaseline="middle">{labels[i]}</text> : null}
        </g>
      ))}
    </svg>
  );
}

/** Tiny interlocked shape, for the footer: the four pieces, together. */
export function PiecesMark({ className }: { className?: string }) {
  const clip = `mark-${useId().replace(/:/g, "")}`;
  return (
    <svg className={`${styles.mark} ${styles.markPieces} ${className ?? ""}`} viewBox="0 0 240 240" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={clip}><circle cx="120" cy="120" r="100" /></clipPath>
      </defs>
      {PIECES.map((p) => <path key={p.key} d={p.d} clipPath={`url(#${clip})`} />)}
    </svg>
  );
}
