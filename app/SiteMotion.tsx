"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SiteMotion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cleanups: Array<() => void> = [];

    const ctx = gsap.context(() => {
      // 1) HERO — quiet entrance plus a very small amount of scroll depth.
      const heroCopy = document.querySelector(".hero__copy");
      const heroPhoto = document.querySelector<HTMLElement>(".hero__photo");
      const heroFrame = document.querySelector<HTMLElement>(".hero__frame");

      if (heroCopy) {
        const intro = gsap.timeline({ defaults: { ease: "power3.out" } });

        intro
          .from(".hero__copy h1", {
            y: 34,
            autoAlpha: 0,
            duration: 1.05,
          })
          .from(
            ".hero__copy .rule--tight",
            {
              scaleX: 0,
              transformOrigin: "left center",
              duration: 0.7,
            },
            "-=0.66",
          )
          .from(
            [
              ".hero__copy > .tag",
              ".hero__lede",
              ".hero__seo",
              ".hero__cta",
              ".hero__foot",
            ],
            {
              y: 18,
              autoAlpha: 0,
              duration: 0.72,
              stagger: 0.075,
            },
            "-=0.48",
          );
      }

      if (heroPhoto) {
        gsap.fromTo(
          heroPhoto,
          { scale: 1.02, yPercent: -1.5 },
          {
            scale: 1.075,
            yPercent: 6,
            ease: "none",
            scrollTrigger: {
              trigger: ".hero",
              start: "top top",
              end: "bottom top",
              scrub: 1.15,
            },
          },
        );
      }

      if (heroFrame) {
        gsap.to(heroFrame, {
          yPercent: -7,
          rotate: -1.4,
          ease: "none",
          scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: 1.25,
          },
        });
      }

      // 3) REMAINING SECTIONS — stagger the copy and actions without turning
      // the whole page into an animation demo.
      const revealSections = ["#needs", "#contact"];

      revealSections.forEach((selector) => {
        const section = document.querySelector<HTMLElement>(selector);
        if (!section) return;

        const heading = section.querySelector("h2");
        const supporting = section.querySelectorAll<HTMLElement>(
          ".needs li, .aside, .contact__body, .contact__like, .contact__actions",
        );

        if (heading) {
          gsap.from(heading, {
            y: 40,
            autoAlpha: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 78%",
              once: true,
            },
          });
        }

        if (supporting.length) {
          gsap.from(supporting, {
            y: 26,
            autoAlpha: 0,
            duration: 0.78,
            stagger: 0.065,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 74%",
              once: true,
            },
          });
        }
      });
    });

    ScrollTrigger.refresh();

    return () => {
      cleanups.forEach((cleanup) => cleanup());
      ctx.revert();
    };
  }, []);

  return null;
}
