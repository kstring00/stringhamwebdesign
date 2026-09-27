"use client";

import { useEffect, useRef } from "react";

import { gsap, isFinePointerDesktop, prefersReducedMotion } from "./gsap";
import styles from "./Cursor.module.css";

/**
 * A small dot that follows the pointer and grows into a "View" ring over
 * anything marked data-cursor="view". Desktop with a fine pointer only;
 * never with reduced motion. Purely decorative: aria-hidden, no pointer
 * events, and the native cursor stays.
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = dot.current;
    if (!el || prefersReducedMotion() || !isFinePointerDesktop()) return;
    // Stay hidden until the pointer actually moves, so the dot never sits
    // in the corner on first paint.
    const xTo = gsap.quickTo(el, "x", { duration: 0.25, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.25, ease: "power3.out" });
    const move = (e: MouseEvent) => { if (el.hidden) { el.hidden = false; gsap.set(el, { x: e.clientX, y: e.clientY }); } xTo(e.clientX); yTo(e.clientY); };
    const over = (e: MouseEvent) => {
      const t = (e.target as HTMLElement | null)?.closest?.("[data-cursor='view']");
      el.dataset.state = t ? "view" : "";
    };
    window.addEventListener("mousemove", move, { passive: true });
    document.addEventListener("mouseover", over, { passive: true });
    return () => { window.removeEventListener("mousemove", move); document.removeEventListener("mouseover", over); el.hidden = true; };
  }, []);

  return (
    <div ref={dot} className={styles.cursor} aria-hidden="true" hidden>
      <span>View</span>
    </div>
  );
}
