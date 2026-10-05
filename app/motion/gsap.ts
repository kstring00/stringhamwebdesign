"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** One registration for the whole site. GSAP is only ever imported from here, on the client. */
gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

/** True when the visitor asked for less motion. Every effect checks this. */
export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
