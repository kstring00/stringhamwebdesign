"use client";

import { useEffect, useRef } from "react";

import { gsap, ScrollTrigger, prefersReducedMotion } from "../motion/gsap";
import styles from "../niche.module.css";

const line = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const NODES = [
  {
    name: "Your website",
    note: "The customer picks a drink and taps order.",
    icon: (<><rect x="5" y="8" width="30" height="24" rx="3" {...line} /><path d="M5 14h30" {...line} /><circle cx="9" cy="11" r="0.8" fill="currentColor" /><path d="M12 22h10M12 26h6" {...line} /></>),
  },
  {
    name: "Your POS",
    note: "Clover, Toast or Square takes the payment.",
    icon: (<><rect x="9" y="6" width="22" height="16" rx="2.5" {...line} /><path d="M13 12h14M13 16h8" {...line} /><path d="M6 32h28l-3-10H9z" {...line} /></>),
  },
  {
    name: "Barista ticket",
    note: "It prints or pops up like any other order.",
    icon: (<><path d="M11 5h18v28l-3-2-3 2-3-2-3 2-3-2-3 2z" {...line} /><path d="M15 12h10M15 17h10M15 22h6" {...line} /></>),
  },
  {
    name: "Grab and go",
    note: "Their name on the cup, on the pickup shelf.",
    icon: (<><path d="M11 13h18l-2 20a2.5 2.5 0 0 1-2.5 2.2h-9A2.5 2.5 0 0 1 13 33z" {...line} /><path d="M10 13h20M14 9h12l1 4H13z" {...line} /></>),
  },
];

/**
 * How ordering works: four stations on a line with a dot travelling along
 * it while the diagram is on screen. Horizontal on desktop, vertical on
 * phones. Static with reduced motion.
 */
export default function OrderFlow() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const dot = el.querySelector<HTMLElement>("[data-dot]")!;
      const nodes = gsap.utils.toArray<HTMLElement>("[data-node]", el);
      const mm = gsap.matchMedia();
      mm.add({ wide: "(min-width: 48rem)", narrow: "(max-width: 47.99rem)" }, (c) => {
        const wide = Boolean(c.conditions?.wide);
        const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.6, paused: true });
        tl.fromTo(dot, wide ? { left: "0%", top: "50%" } : { top: "0%", left: "50%" }, { ...(wide ? { left: "100%" } : { top: "100%" }), duration: 3.2, ease: "none" });
        nodes.forEach((n, i) => {
          tl.to(n, { keyframes: [{ scale: 1.08, duration: 0.2 }, { scale: 1, duration: 0.35 }], ease: "power2.out" }, (i / (nodes.length - 1)) * 3.2 - 0.1);
        });
        const st = ScrollTrigger.create({ trigger: el, start: "top bottom", end: "bottom top", onToggle: (self) => (self.isActive ? tl.play() : tl.pause()) });
        return () => { st.kill(); tl.kill(); };
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <div className={styles.flow} ref={root}>
      <div className={styles.flowTrack} aria-hidden="true">
        <span className={styles.flowDot} data-dot />
      </div>
      <ol className={styles.flowNodes}>
        {NODES.map((n) => (
          <li className={styles.flowNode} key={n.name}>
            <span className={styles.flowIcon} data-node aria-hidden="true">
              <svg viewBox="0 0 40 40" width="40" height="40" focusable="false">{n.icon}</svg>
            </span>
            <span className={styles.flowName}>{n.name}</span>
            <span className={styles.flowNote}>{n.note}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
