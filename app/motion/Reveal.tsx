"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { gsap, ScrollTrigger, prefersReducedMotion } from "./gsap";

/**
 * A small, quiet rise for anything marked data-reveal (grouped and staggered
 * under a data-reveal-group parent). Everything is in the page at rest; the
 * script only adds a short fade as a block scrolls into view, and anything
 * already on screen plays at once. Off under reduced motion and without JS.
 */
export default function Reveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const rise = (els: HTMLElement[] | NodeListOf<HTMLElement>, trigger: Element) => {
        gsap.from(els, { autoAlpha: 0, y: 12, duration: 0.55, ease: "power2.out", stagger: 0.06, scrollTrigger: { trigger, start: "top 94%", once: true } });
      };
      document.querySelectorAll<HTMLElement>("[data-reveal-group]").forEach((group) => {
        const items = group.querySelectorAll<HTMLElement>("[data-reveal]");
        if (items.length) rise(items, group);
      });
      document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-reveal-group] [data-reveal])").forEach((el) => rise([el], el));
      document.fonts?.ready.then(() => ScrollTrigger.refresh());
    });
    return () => ctx.revert();
  }, [pathname]);

  return null;
}
