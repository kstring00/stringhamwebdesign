"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { gsap, isFinePointerDesktop, prefersReducedMotion } from "./gsap";

/**
 * Wraps a button so it leans toward the cursor within a small radius. Fine
 * pointers only; the wrapped element is a plain link everywhere else.
 */
export default function Magnetic({ children, strength = 0.35 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !isFinePointerDesktop()) return;
    const target = el.firstElementChild as HTMLElement | null;
    if (!target) return;
    const xTo = gsap.quickTo(target, "x", { duration: 0.6, ease: "power3.out" });
    const yTo = gsap.quickTo(target, "y", { duration: 0.6, ease: "power3.out" });
    const move = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const leave = () => { xTo(0); yTo(0); };
    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", leave);
    return () => { el.removeEventListener("mousemove", move); el.removeEventListener("mouseleave", leave); };
  }, [strength]);

  return <span ref={ref} style={{ display: "inline-block", padding: "0.6rem", margin: "-0.6rem" }}>{children}</span>;
}
