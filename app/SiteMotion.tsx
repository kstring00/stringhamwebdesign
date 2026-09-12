"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// GSAP reads layout, so it runs before paint on the client and as a plain
// effect during SSR, where it does nothing.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Sitewide motion, mounted once in the root layout and re-run on every route.
 *
 * Pages opt in with data attributes rather than importing anything:
 *
 *   data-hero                 entrance on load, staggered in DOM order
 *   data-hero="media"         a picture or panel that settles in beside the copy
 *   data-reveal-group         a container; its [data-reveal] descendants rise in
 *                             together as it scrolls into view (or its direct
 *                             children, if none are marked)
 *   data-reveal               an item inside a group, or standalone with its own trigger
 *   data-rule                 a hairline that draws in from the left
 *   data-parallax="-8"        drifts by that percent of its height over the scroll
 *
 * Every tween is `from`-based, so the markup is authored in its final state:
 * with JavaScript off, or under prefers-reduced-motion (where this returns
 * before touching anything), the page simply renders finished. Reduced motion
 * is an instant final state, not a faster animation.
 *
 * The previous version of this file targeted `.hero__copy` and friends —
 * classes no page had used for months — and so did nothing on any route.
 */
export default function SiteMotion() {
  const pathname = usePathname();

  useIsomorphicLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const ease = "power3.out";

      // 1) Hero entrance, in reading order. Media settles in alongside.
      const heroItems = gsap.utils.toArray<HTMLElement>("[data-hero]:not([data-hero='media'])");
      const heroMedia = gsap.utils.toArray<HTMLElement>("[data-hero='media']");
      if (heroItems.length) {
        const tl = gsap.timeline({ defaults: { ease } });
        tl.from(heroItems, { y: 22, autoAlpha: 0, duration: 0.85, stagger: 0.085 });
        if (heroMedia.length) {
          tl.from(heroMedia, { scale: 0.965, autoAlpha: 0, duration: 1.15, ease: "power2.out" }, 0.18);
        }
      } else if (heroMedia.length) {
        gsap.from(heroMedia, { scale: 0.965, autoAlpha: 0, duration: 1.15, ease: "power2.out" });
      }

      // 2) Reveal groups. Items stagger from one trigger on the group.
      gsap.utils.toArray<HTMLElement>("[data-reveal-group]").forEach((group) => {
        const marked = group.querySelectorAll<HTMLElement>("[data-reveal]");
        const items = marked.length ? Array.from(marked) : (Array.from(group.children) as HTMLElement[]);
        if (!items.length) return;
        gsap.from(items, {
          y: 26,
          autoAlpha: 0,
          duration: 0.85,
          ease,
          stagger: 0.09,
          scrollTrigger: { trigger: group, start: "top 84%" },
        });
      });

      // 3) Standalone reveals, each on its own trigger.
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        if (el.closest("[data-reveal-group]")) return;
        gsap.from(el, {
          y: 26,
          autoAlpha: 0,
          duration: 0.85,
          ease,
          scrollTrigger: { trigger: el, start: "top 86%" },
        });
      });

      // 4) Hairlines draw in.
      gsap.utils.toArray<HTMLElement>("[data-rule]").forEach((rule) => {
        gsap.from(rule, {
          scaleX: 0,
          transformOrigin: "left center",
          duration: 0.9,
          ease,
          scrollTrigger: { trigger: rule, start: "top 90%" },
        });
      });

      // 5) Parallax. The element must be oversized by its parent so no edge shows.
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        const amount = Number(el.dataset.parallax) || 0;
        if (!amount) return;
        gsap.fromTo(
          el,
          { yPercent: -amount / 2 },
          {
            yPercent: amount / 2,
            ease: "none",
            scrollTrigger: {
              trigger: el.parentElement ?? el,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.6,
            },
          },
        );
      });
    });

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [pathname]);

  return null;
}
