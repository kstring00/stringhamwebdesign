"use client";

import { useEffect, useRef } from "react";

import { gsap, ScrollTrigger, prefersReducedMotion } from "../motion/gsap";
import s from "./home.module.css";

type Frame = { key: string; name: string; alt: string };

/** How far each frame drifts as the hero scrolls away (px): front, middle, back. */
const DRIFT = [-40, -90, -140];

/**
 * Three overlapping browser frames with the featured demos, stacked back
 * to front. On load they float in with a short stagger; on scroll each
 * drifts at its own rate (a little parallax, scrubbed by ScrollTrigger).
 * Both off under reduced motion. The same screenshots appear, labeled, in
 * the carousel below, so this group is decorative to assistive tech.
 */
export default function HeroFrames({ items }: { items: Frame[] }) {
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el || prefersReducedMotion()) return;
    const frames = Array.from(el.querySelectorAll<HTMLElement>(`.${s.frame}`));
    const ctx = gsap.context(() => {
      gsap.from(frames, { y: 48, scale: 0.96, autoAlpha: 0, duration: 0.9, ease: "power3.out", stagger: 0.12, delay: 0.15, clearProps: "opacity,visibility" });
      frames.forEach((f, i) => {
        gsap.to(f, { y: DRIFT[i] ?? -60, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: 0.4 } });
      });
    }, el);
    return () => { ctx.revert(); ScrollTrigger.refresh(); };
  }, []);

  return (
    <div ref={wrap} className={s.frames} data-field-clear aria-hidden="true">
      {items.slice(0, 3).map((w, i) => (
        <div key={w.key} className={s.frame} style={{ "--i": i } as React.CSSProperties}>
          <div className={s.chrome}><i /><i /><i /><span>{w.name}</span></div>
          <picture>
            <source type="image/avif" srcSet={`/showcase/${w.key}-desktop.avif`} />
            <img src={`/showcase/${w.key}-desktop.webp`} alt="" width={1440} height={900} loading={i === 0 ? "eager" : "lazy"} decoding="async" />
          </picture>
        </div>
      ))}
    </div>
  );
}
