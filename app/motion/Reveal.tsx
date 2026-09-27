"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { gsap, ScrollTrigger, prefersReducedMotion } from "./gsap";

/**
 * Scroll-in for anything marked data-reveal (optionally grouped by a
 * data-reveal-group parent, which staggers its children). The hidden state
 * is set by the script, so with no JS or reduced motion the content simply
 * shows.
 */
export default function Reveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      document.querySelectorAll<HTMLElement>("[data-reveal-group]").forEach((group) => {
        const items = group.querySelectorAll<HTMLElement>("[data-reveal]");
        if (!items.length) return;
        gsap.set(items, { autoAlpha: 0, y: 28 });
        ScrollTrigger.create({
          trigger: group,
          start: "top 85%",
          once: true,
          onEnter: () => gsap.to(items, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.08 }),
        });
      });
      document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-reveal-group] [data-reveal])").forEach((el) => {
        gsap.set(el, { autoAlpha: 0, y: 28 });
        ScrollTrigger.create({
          trigger: el,
          start: "top 88%",
          once: true,
          onEnter: () => gsap.to(el, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out" }),
        });
      });
      document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
        const amount = Number(el.dataset.parallax || 40);
        gsap.fromTo(el, { y: amount }, { y: -amount, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
      });
    });
    return () => ctx.revert();
  }, [pathname]);

  return null;
}
