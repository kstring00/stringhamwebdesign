"use client";

import { useEffect, useRef } from "react";

import { gsap, prefersReducedMotion } from "./gsap";
import styles from "./Marquee.module.css";

/**
 * A slow, continuous ticker. Two copies of the list scroll as one track;
 * it pauses on hover and is static (one copy, wrapped) with reduced motion.
 */
export default function Marquee({ items, label }: { items: readonly string[]; label: string }) {
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = track.current;
    if (!el || prefersReducedMotion()) return;
    el.parentElement?.setAttribute("data-moving", "");
    const tween = gsap.to(el, { xPercent: -50, duration: 42, ease: "none", repeat: -1 });
    const wrap = el.parentElement!;
    const pause = () => tween.pause();
    const play = () => tween.play();
    wrap.addEventListener("mouseenter", pause);
    wrap.addEventListener("mouseleave", play);
    wrap.addEventListener("focusin", pause);
    wrap.addEventListener("focusout", play);
    return () => { tween.kill(); wrap.removeEventListener("mouseenter", pause); wrap.removeEventListener("mouseleave", play); wrap.removeEventListener("focusin", pause); wrap.removeEventListener("focusout", play); };
  }, []);

  const row = (hidden: boolean) => (
    <ul className={styles.row} aria-hidden={hidden || undefined}>
      {items.map((item) => (
        <li key={item}><span>{item}</span><i aria-hidden="true">·</i></li>
      ))}
    </ul>
  );

  return (
    <div className={styles.marquee} aria-label={label} role="region">
      <div className={styles.track} ref={track}>
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
