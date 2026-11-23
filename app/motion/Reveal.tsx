"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { gsap, prefersReducedMotion } from "./gsap";

/**
 * A one-time rise for section headings, panels and cards marked data-reveal
 * (grouped and staggered under a data-reveal-group parent): 28px up and a
 * fade in, the same move the hero's words make on load. Nothing else
 * animates on scroll. Everything is in the page at rest; the
 * script only adds the rise as a block scrolls into view; anything already
 * on screen when it starts is left alone. An IntersectionObserver does the
 * watching (it fires on layout, not just on scroll events). What waits
 * below is only made transparent, never hidden: a screen reader, a search
 * in the page and a print (globals.css) all still have it.
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
        gsap.to(els, { y: 0, opacity: 1, duration: 0.9, ease: "expo.out", stagger: 0.12, overwrite: true });
      };
      const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { play(e.target); io.unobserve(e.target); } }), { rootMargin: "0px 0px -6% 0px" });
      const watch = (els: HTMLElement[], trigger: Element) => {
        // Anything already on screen at load stays exactly as it is.
        if (trigger.getBoundingClientRect().top < window.innerHeight) return;
        gsap.set(els, { y: 28, opacity: 0 });
        pending.set(trigger, els);
        io.observe(trigger);
      };
      document.querySelectorAll<HTMLElement>("[data-reveal-group]").forEach((group) => {
        const items = Array.from(group.querySelectorAll<HTMLElement>("[data-reveal]"));
        if (items.length) watch(items, group);
      });
      document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-reveal-group] [data-reveal])").forEach((el) => watch([el], el));
      return () => io.disconnect();
    });
    return () => ctx.revert();
  }, [pathname]);

  return null;
}
