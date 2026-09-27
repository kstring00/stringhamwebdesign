"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";

/**
 * One registration for the whole site. GSAP and its three plugins
 * (ScrollTrigger, ScrollSmoother and SplitText are free as of GSAP 3.13)
 * are only ever imported from here, on the client.
 */
gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);

export { gsap, ScrollTrigger, ScrollSmoother, SplitText };

/** True when the visitor asked for less motion. Every effect checks this. */
export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Desktop with a real pointer: where smoothing, pinning and the cursor run. */
export function isFinePointerDesktop() {
  return typeof window !== "undefined" && window.matchMedia("(min-width: 64rem) and (pointer: fine) and (hover: hover)").matches;
}
