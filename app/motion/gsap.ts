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

/**
 * Run non-essential motion setup once the browser is idle, so it never
 * competes with the first paint or hydration. Returns a cancel function.
 */
export function whenIdle(run: () => void, timeout = 1200) {
  const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
  if (w.requestIdleCallback) {
    const id = w.requestIdleCallback(run, { timeout });
    return () => w.cancelIdleCallback?.(id);
  }
  const t = window.setTimeout(run, 150);
  return () => window.clearTimeout(t);
}
