"use client";

import { useEffect, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { formatAmount } from "../data/pricing";

gsap.registerPlugin(ScrollTrigger);

// GSAP reads layout, so it runs before paint on the client and as a plain
// effect during SSR, where it does nothing.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Motion for /pricing. Same library and posture as SiteMotion on the homepage.
 *
 * Every animation is `from`-based: the markup is authored in its final state,
 * so with JavaScript off, or under prefers-reduced-motion (where this returns
 * before touching anything), the page simply renders finished. Reduced motion
 * is an instant final state, not a faster animation.
 */
export default function PricingMotion() {
  useIsomorphicLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.querySelector<HTMLElement>("[data-pricing]");
    if (!root) return;

    const ctx = gsap.context(() => {
      // 1) Hero — a quiet entrance in reading order, media block settling in beside it.
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from("[data-hero='signal'], [data-hero='eyebrow']", { y: 12, autoAlpha: 0, duration: 0.5, stagger: 0.08 })
        .from("[data-hero='title']", { y: 36, autoAlpha: 0, duration: 1.0 }, "-=0.25")
        .from("[data-hero='lede'], [data-hero='actions']", { y: 18, autoAlpha: 0, duration: 0.7, stagger: 0.1 }, "-=0.55")
        .from("[data-hero='trust'] > *", { y: 14, autoAlpha: 0, duration: 0.55, stagger: 0.07 }, "-=0.4")
        .from("[data-hero='media']", { scale: 0.96, autoAlpha: 0, duration: 1.1, ease: "power2.out" }, 0.15)
        .from("[data-hero='media'] > *", { autoAlpha: 0, y: 10, duration: 0.6 }, "-=0.5");

      // 2) Section heads and rules draw in as they arrive.
      gsap.utils.toArray<HTMLElement>("[data-rule]").forEach((rule) => {
        gsap.from(rule, {
          scaleX: 0,
          transformOrigin: "left center",
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: rule, start: "top 88%" },
        });
      });

      // 3) Everything marked for reveal rises in; siblings stagger from one trigger.
      gsap.utils.toArray<HTMLElement>("[data-reveal-group]").forEach((group) => {
        const items = group.querySelectorAll<HTMLElement>("[data-reveal]");
        gsap.from(items, {
          y: 26,
          autoAlpha: 0,
          duration: 0.85,
          ease: "power3.out",
          stagger: 0.09,
          scrollTrigger: { trigger: group, start: "top 82%" },
        });
      });

      // 4) The featured card lands a beat after its neighbours and lifts.
      const featured = root.querySelector<HTMLElement>("[data-featured]");
      if (featured) {
        gsap.from(featured, {
          y: 34,
          autoAlpha: 0,
          duration: 1.0,
          delay: 0.18,
          ease: "power3.out",
          scrollTrigger: { trigger: "[data-tiers]", start: "top 80%" },
        });
      }

      // 5) Prices count up to their floor as the cards rise. The tween is only
      //    created on enter: a tween created up front with a ScrollTrigger is
      //    rendered at progress 0 on init, which would write "$0" into the DOM
      //    before the card is even visible.
      const counts = gsap.utils.toArray<HTMLElement>("[data-count]");
      if (counts.length) {
        ScrollTrigger.create({
          trigger: "[data-tiers]",
          start: "top 82%",
          once: true,
          onEnter: () => {
            counts.forEach((el, index) => {
              const value = Number(el.dataset.count);
              const counter = { n: 0 };
              gsap.to(counter, {
                n: value,
                duration: 1.2,
                delay: 0.25 + index * 0.1,
                ease: "power2.out",
                snap: { n: value >= 1000 ? 25 : 10 },
                onUpdate: () => { el.textContent = formatAmount(Math.round(counter.n)); },
                onComplete: () => { el.textContent = formatAmount(value); },
              });
            });
          },
        });
      }

      // 6) Process numbers and the close band.
      gsap.from("[data-phase-num]", {
        scale: 0.6,
        autoAlpha: 0,
        duration: 0.6,
        ease: "back.out(1.8)",
        stagger: 0.12,
        scrollTrigger: { trigger: "[data-phases]", start: "top 80%" },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return null;
}
