"use client";

import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** One registration for the whole site. GSAP is only ever imported from here, on the client. */
gsap.registerPlugin(ScrollTrigger, Draggable, InertiaPlugin);

export { gsap, ScrollTrigger, Draggable };

/** True when the visitor asked for less motion. Every effect checks this. */
export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
