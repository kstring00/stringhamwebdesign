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
      // Hero entrance, section reveals, rules and parallax are the sitewide
      // engine's job (app/SiteMotion.tsx). Only what is particular to this
      // page lives here.

      // 1) The featured card lands a beat after its neighbours.
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

      // 2) Prices count up to their floor as the cards rise. The tween is only
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

      // 3) Process numbers pop in.
      gsap.from("[data-phase-num]", {
        scale: 0.6,
        autoAlpha: 0,
        duration: 0.6,
        ease: "back.out(1.8)",
        stagger: 0.12,
        scrollTrigger: { trigger: "[data-phases]", start: "top 80%" },
      });

      // 4) The liquid edge on the statue: the turbulence frequency breathes,
      //    so the dissolving side of the figure ripples like something seen
      //    through moving water. Slow, small, and never on the text.
      const noise = root.querySelector<SVGElement>("[data-liquid-noise]");
      if (noise) {
        gsap.to(noise, {
          attr: { baseFrequency: "0.009 0.016" },
          duration: 7,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      }

      // 5) Fog drifts across the valley on three layers at three speeds.
      gsap.utils.toArray<HTMLElement>("[data-fog]").forEach((fog, index) => {
        gsap.to(fog, {
          xPercent: index % 2 ? -9 : 9,
          yPercent: index % 2 ? 5 : -4,
          duration: 14 + index * 4,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      });

      // 6) The valley draws back as you scroll past it — a slow Ken Burns,
      //    on top of the engine's parallax.
      const closeImage = root.querySelector<HTMLElement>("[data-close-image]");
      if (closeImage) {
        gsap.fromTo(
          closeImage,
          { scale: 1.14 },
          {
            scale: 1.02,
            ease: "none",
            scrollTrigger: {
              trigger: closeImage.parentElement,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.8,
            },
          },
        );
      }
    }, root);

    return () => ctx.revert();
  }, []);

  return null;
}
