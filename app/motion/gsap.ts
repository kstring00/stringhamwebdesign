"use client";

import { gsap } from "gsap";

/** GSAP is only ever imported from here, on the client. The core alone: no plugin is in use. */
export { gsap };

/** True when the visitor asked for less motion. Every effect checks this. */
export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
