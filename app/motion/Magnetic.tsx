"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { gsap, prefersReducedMotion } from "./gsap";

/** How far a button follows the pointer, and how far out it starts to. */
const PULL = 0.28;
const REACH = 36;

/**
 * Magnetic primary buttons: anything marked data-magnetic leans toward the
 * pointer when it comes near, and springs back when it leaves. Pointer
 * devices only, never under reduced motion, and the buttons are ordinary
 * links the whole time.
 */
export default function Magnetic() {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion() || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const ctx = gsap.context(() => {
      document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((el) => {
        const toX = gsap.quickTo(el, "x", { duration: 0.45, ease: "power3.out" });
        const toY = gsap.quickTo(el, "y", { duration: 0.45, ease: "power3.out" });
        const onMove = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          const dx = e.clientX - (r.left + r.width / 2);
          const dy = e.clientY - (r.top + r.height / 2);
          const near = Math.abs(dx) < r.width / 2 + REACH && Math.abs(dy) < r.height / 2 + REACH;
          toX(near ? dx * PULL : 0);
          toY(near ? dy * PULL : 0);
        };
        const onLeave = () => { toX(0); toY(0); };
        const zone = el.parentElement ?? el;
        zone.addEventListener("pointermove", onMove, { passive: true });
        zone.addEventListener("pointerleave", onLeave);
        return () => { zone.removeEventListener("pointermove", onMove); zone.removeEventListener("pointerleave", onLeave); };
      });
    });
    return () => ctx.revert();
  }, [pathname]);

  return null;
}
