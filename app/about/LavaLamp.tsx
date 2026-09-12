"use client";

import { useEffect, useId, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * A lava lamp in gold and navy.
 *
 * Blobs are plain circles under a "gooey" filter — a blur followed by an alpha
 * contrast step — so that when two drift close they merge and pull apart like
 * liquid. Behind them, vertical glass ribbons displaced by static turbulence
 * refract the light; in front, a handful of bokeh points drift. Everything
 * that moves is a transform, driven by GSAP on long sine loops with different
 * periods so the motion never repeats visibly.
 *
 * Cost is the filter: it re-rasterises the blob group every frame. So the
 * filter region is tight, the blob count drops on narrow viewports, and the
 * glass displacement is applied to a layer that never changes, where the
 * browser can cache it. Under prefers-reduced-motion nothing is tweened and
 * the blobs rest at spread positions.
 */

type Blob = { x: number; r: number; from: number; to: number; period: number; drift: number };

const DESKTOP: Blob[] = [
  { x: 300, r: 74, from: 690, to: 210, period: 15, drift: 16 },
  { x: 205, r: 46, from: 720, to: 330, period: 11.5, drift: 12 },
  { x: 392, r: 54, from: 640, to: 150, period: 13.2, drift: 14 },
  { x: 150, r: 30, from: 760, to: 470, period: 9.4, drift: 9 },
  { x: 458, r: 34, from: 700, to: 380, period: 10.8, drift: 10 },
  { x: 268, r: 24, from: 780, to: 120, period: 17.5, drift: 8 },
  { x: 350, r: 40, from: 610, to: 520, period: 8.6, drift: 11 },
];

const REST: Blob[] = [
  { x: 300, r: 74, from: 560, to: 560, period: 0, drift: 0 },
  { x: 205, r: 46, from: 330, to: 330, period: 0, drift: 0 },
  { x: 392, r: 54, from: 190, to: 190, period: 0, drift: 0 },
  { x: 150, r: 30, from: 640, to: 640, period: 0, drift: 0 },
  { x: 458, r: 34, from: 430, to: 430, period: 0, drift: 0 },
  { x: 268, r: 24, from: 120, to: 120, period: 0, drift: 0 },
  { x: 350, r: 40, from: 700, to: 700, period: 0, drift: 0 },
];

const BOKEH = [
  [70, 140, 3], [520, 90, 2.5], [90, 620, 2], [540, 560, 3.5], [470, 260, 1.8],
  [130, 380, 2.2], [560, 700, 2], [40, 760, 2.6],
] as const;

export default function LavaLamp() {
  const id = useId().replace(/:/g, "");
  const root = useRef<SVGSVGElement | null>(null);

  useIsomorphicLayoutEffect(() => {
    const svg = root.current;
    if (!svg) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const narrow = window.matchMedia("(max-width: 64rem)").matches;
    const ctx = gsap.context(() => {
      const blobs = svg.querySelectorAll<SVGGElement>("[data-blob]");
      blobs.forEach((g, i) => {
        const spec = DESKTOP[i];
        // On narrow viewports the two smallest blobs sit still: fewer moving
        // parts under the filter, same silhouette.
        if (narrow && (i === 5 || i === 6)) return;
        // Rise and settle. Each blob has its own period and a phase offset so
        // the lamp never falls into a visible rhythm.
        gsap.fromTo(
          g,
          { y: spec.from - REST[i].from },
          {
            y: spec.to - REST[i].from,
            duration: spec.period,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            delay: -spec.period * ((i * 0.37) % 1),
          },
        );
        // A slow sideways wander and a breath in scale, on unrelated periods.
        gsap.to(g, {
          x: spec.drift,
          duration: spec.period * 0.61,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: -spec.period * ((i * 0.53) % 1),
        });
        gsap.to(g.firstElementChild, {
          scale: 1.07,
          transformOrigin: "50% 50%",
          duration: spec.period * 0.43,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: -spec.period * ((i * 0.71) % 1),
        });
      });

      // Bokeh drifts upward and fades, very slowly.
      svg.querySelectorAll<SVGCircleElement>("[data-bokeh]").forEach((c, i) => {
        gsap.to(c, {
          y: -40 - (i % 3) * 18,
          opacity: 0.08,
          duration: 12 + (i % 4) * 3,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: -(i * 2.3),
        });
      });

      // The lamp's inner light breathes.
      gsap.to(svg.querySelector("[data-glow]"), {
        opacity: 0.55,
        duration: 6.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    }, svg);

    return () => ctx.revert();
  }, []);

  return (
    <svg
      ref={root}
      viewBox="0 0 600 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      style={{ display: "block", width: "100%", height: "100%" }}
    >
      <defs>
        <radialGradient id={`${id}-gold`} cx="38%" cy="32%" r="72%">
          <stop offset="0%" stopColor="#f6e4b4" />
          <stop offset="34%" stopColor="#dcb85e" />
          <stop offset="72%" stopColor="#a87f2c" />
          <stop offset="100%" stopColor="#6b4e17" />
        </radialGradient>
        <radialGradient id={`${id}-glow`} cx="50%" cy="58%" r="60%">
          <stop offset="0%" stopColor="#c9a227" stopOpacity="0.42" />
          <stop offset="55%" stopColor="#c9a227" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#c9a227" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0b1a2a" />
          <stop offset="100%" stopColor="#05172f" />
        </linearGradient>
        <linearGradient id={`${id}-ribbon`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#05172f" stopOpacity="0" />
          <stop offset="28%" stopColor="#e2c58a" stopOpacity="0.16" />
          <stop offset="46%" stopColor="#f6e4b4" stopOpacity="0.42" />
          <stop offset="60%" stopColor="#c9a227" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#05172f" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${id}-vignette`} cx="50%" cy="50%" r="62%">
          <stop offset="55%" stopColor="#05172f" stopOpacity="0" />
          <stop offset="100%" stopColor="#05172f" stopOpacity="0.92" />
        </radialGradient>

        {/* Gooey: blur, then push alpha to a hard edge so touching blobs merge. */}
        <filter id={`${id}-goo`} x="-10%" y="-8%" width="120%" height="116%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="blur" />
          <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 26 -11" result="goo" />
          <feGaussianBlur in="goo" stdDeviation="1.2" />
        </filter>

        {/* Glass: static turbulence bends the ribbons once; nothing under it ever changes. */}
        <filter id={`${id}-glass`} x="-4%" y="-4%" width="108%" height="108%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.0045 0.018" numOctaves="2" seed="11" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="26" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>

      <rect width="600" height="800" fill={`url(#${id}-bg)`} />

      {/* Glass ribbons, behind the liquid. */}
      <g filter={`url(#${id}-glass)`} opacity="0.9">
        {[
          [70, 34], [128, 18], [172, 58], [260, 22], [318, 76], [420, 30], [468, 62], [548, 26],
        ].map(([x, w], i) => (
          <rect key={i} x={x} y="-40" width={w} height="880" fill={`url(#${id}-ribbon)`} />
        ))}
      </g>

      {/* The lamp's light. */}
      <ellipse data-glow cx="300" cy="470" rx="290" ry="380" fill={`url(#${id}-glow)`} opacity="0.32" />

      {/* Liquid. Each blob is a group (moved) around a circle (scaled). */}
      <g filter={`url(#${id}-goo)`}>
        {REST.map((b, i) => (
          <g key={i} data-blob>
            <circle cx={b.x} cy={b.from} r={b.r} fill={`url(#${id}-gold)`} />
          </g>
        ))}
        {/* The pool at the base the blobs rise from and return to. */}
        <ellipse cx="300" cy="812" rx="200" ry="70" fill={`url(#${id}-gold)`} />
      </g>

      {/* Specular edge on the glass, in front of the liquid. */}
      <g opacity="0.55">
        {[[172, 58], [318, 76], [468, 62]].map(([x, w], i) => (
          <rect key={i} x={x + w * 0.42} y="0" width="1.5" height="800" fill="#f6e4b4" opacity="0.35" />
        ))}
      </g>

      {/* Bokeh. */}
      {BOKEH.map(([x, y, r], i) => (
        <circle key={i} data-bokeh cx={x} cy={y} r={r} fill="#f6e4b4" opacity="0.28" />
      ))}

      <rect width="600" height="800" fill={`url(#${id}-vignette)`} />
    </svg>
  );
}
