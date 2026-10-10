"use client";

import { useEffect, useRef } from "react";

import { gsap, prefersReducedMotion } from "./gsap";

/**
 * A number that counts up from 0 the first time it scrolls into view. The
 * server renders the final value, so without JS, under reduced motion, or
 * when it's already on screen at load, it simply shows the number.
 * Decorative copies only: the same figure is always in the text beside it.
 */
export default function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const el = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = el.current;
    if (!node || prefersReducedMotion() || node.getBoundingClientRect().top < window.innerHeight) return;
    const state = { n: 0 };
    const paint = () => { node.textContent = `${Math.round(state.n)}${suffix}`; };
    paint();
    let tween: gsap.core.Tween | null = null;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      tween = gsap.to(state, { n: value, duration: 1.2, ease: "power3.out", onUpdate: paint });
    }, { threshold: 0.6 });
    io.observe(node);
    return () => { io.disconnect(); tween?.kill(); state.n = value; paint(); };
  }, [value, suffix]);

  return <span ref={el} style={{ fontVariantNumeric: "tabular-nums" }}>{value}{suffix}</span>;
}
