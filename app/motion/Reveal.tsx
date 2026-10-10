"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { gsap, prefersReducedMotion } from "./gsap";

/**
 * A one-time fade-up for section headings and cards marked data-reveal
 * (grouped and staggered under a data-reveal-group parent). Nothing else
 * animates on scroll. Everything is in the page at rest; the
 * script only adds a short settle as a block scrolls into view; anything
 * already on screen at load is left alone. An IntersectionObserver does the
 * watching (it fires on layout, not just on scroll events) and a short
 * safety timer settles anything still waiting.
 * Off under reduced motion and without JS.
 */
export default function Reveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const pending = new Map<Element, HTMLElement[]>();
      const play = (trigger: Element) => {
        const els = pending.get(trigger);
        if (!els) return;
        pending.delete(trigger);
        gsap.to(els, { y: 0, autoAlpha: 1, duration: 0.7, ease: "power2.out", stagger: 0.08, overwrite: true });
      };
      const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { play(e.target); io.unobserve(e.target); } }), { rootMargin: "0px 0px -6% 0px" });
      const watch = (els: HTMLElement[], trigger: Element) => {
        // Anything already on screen at load stays exactly as it is.
        if (trigger.getBoundingClientRect().top < window.innerHeight) return;
        gsap.set(els, { y: 18, autoAlpha: 0 });
        pending.set(trigger, els);
        io.observe(trigger);
      };
      document.querySelectorAll<HTMLElement>("[data-reveal-group]").forEach((group) => {
        const items = Array.from(group.querySelectorAll<HTMLElement>("[data-reveal]"));
        if (items.length) watch(items, group);
      });
      document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-reveal-group] [data-reveal])").forEach((el) => watch([el], el));
      // Nothing waits forever: whatever has not come into view by now is shown.
      const safety = window.setTimeout(() => [...pending.keys()].forEach(play), 2500);
      return () => { io.disconnect(); window.clearTimeout(safety); };
    });
    return () => ctx.revert();
  }, [pathname]);

  return null;
}
