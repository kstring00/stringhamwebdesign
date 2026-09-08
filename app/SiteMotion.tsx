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

      // 3) PROCESS — reveal only by position and opacity. Interactive timeline
      // state changes never use scale, bounce, or spring motion.
      const timeline = document.querySelector<HTMLElement>("#timeline");
      if (timeline) {
        const heading = timeline.querySelector(".timeline-heading");
        const copy = timeline.querySelector(".timeline-copy");
        const steps = timeline.querySelectorAll<HTMLElement>(".timeline-step");
        const visual = timeline.querySelector<HTMLElement>(".timeline-visual");
        const orbs = timeline.querySelectorAll<HTMLElement>(".timeline-orb");

        const processTl = gsap.timeline({
          scrollTrigger: {
            trigger: timeline,
            start: "top 76%",
            once: true,
          },
          defaults: { ease: "power3.out" },
        });

        if (heading) {
          processTl.from(heading, {
            y: 46,
            autoAlpha: 0,
            duration: 0.95,
          });
        }

        if (copy) {
          processTl.from(
            copy,
            {
              y: 24,
              autoAlpha: 0,
              duration: 0.72,
            },
            "-=0.52",
          );
        }

        if (steps.length) {
          processTl.from(
            steps,
            {
              y: 30,
              autoAlpha: 0,
              duration: 0.72,
              stagger: 0.09,
            },
            "-=0.34",
          );
        }

        if (orbs.length) {
          processTl.from(
            orbs,
            {
              y: 18,
              autoAlpha: 0,
              duration: 0.68,
              stagger: 0.12,
            },
            "-=0.72",
          );
        }

        if (visual) {
          gsap.fromTo(
            visual,
            { xPercent: 3.5 },
            {
              xPercent: 0,
              ease: "none",
              scrollTrigger: {
                trigger: timeline,
                start: "top 92%",
                end: "bottom 28%",
                scrub: 0.9,
              },
            },
          );
        }
      }

      // 4) REMAINING SECTIONS — stagger the copy and actions without turning
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
