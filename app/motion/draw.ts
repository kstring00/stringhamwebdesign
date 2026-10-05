"use client";

import { gsap } from "./gsap";

/**
 * Prepare SVG strokes so they can draw themselves. Every path, line, circle,
 * rect and polyline under `root` marked data-stroke gets its own dash length,
 * hidden at the start (offset = length). Call `drawStrokes` to animate them.
 * Nothing here runs without JS, so the drawings are complete by default.
 */
export function prepareStrokes(root: Element) {
  const els = Array.from(root.querySelectorAll<SVGGeometryElement>("[data-stroke]"));
  els.forEach((el) => {
    const len = Math.ceil(el.getTotalLength ? el.getTotalLength() : 0) + 2;
    el.style.strokeDasharray = `${len}`;
    el.style.strokeDashoffset = `${len}`;
  });
  return els;
}

/** Draw prepared strokes in document order. Returns the tween. */
export function drawStrokes(els: Element[], vars: gsap.TweenVars = {}) {
  return gsap.to(els, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut", stagger: { each: 0.06 }, ...vars });
}
