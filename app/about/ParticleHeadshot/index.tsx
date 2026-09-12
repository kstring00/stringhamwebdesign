"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./ParticleHeadshot.module.css";

/**
 * The hero headshot. Renders a plain <img> — the LCP element — in a fixed
 * 4:5 box, and on desktop with a fine pointer, after the window has loaded
 * and only when motion is not reduced, dynamically imports the Three engine
 * and cross-fades its canvas in over the image once the first frame renders.
 *
 * Phones and tablets never load Three. The canvas is aria-hidden; the image
 * carries the description. Same box either way, so nothing shifts.
 */

const SRC_IMAGE = "/about/headshot.webp";  // the <img>: compressed, under 120 KB
const SRC_SAMPLE = "/about/headshot.png";  // sampled for particles: alpha matters here
const DESKTOP = "(min-width: 1024px) and (pointer: fine)";
const REDUCED = "(prefers-reduced-motion: reduce)";

export default function ParticleHeadshot() {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [live, setLive] = useState(false);
  const [count, setCount] = useState(0);
  /** "loading" once the dynamic import starts, "ready" once the engine runs. Absent when Three was never requested. */
  const [engine, setEngine] = useState<"loading" | "ready" | null>(null);
  /** The engine's motion state, exposed for the check and for the cue. */
  const [motion, setMotion] = useState<"assembled" | "scattering" | "assembling" | null>(null);

  useEffect(() => {
    const host = box.current, cv = canvas.current;
    if (!host || !cv) return;
    if (!window.matchMedia(DESKTOP).matches || window.matchMedia(REDUCED).matches) return;

    let cancelled = false;
    let running: Awaited<ReturnType<typeof import("./engine")["start"]>> | null = null;
    let io: IntersectionObserver | null = null;

    const boot = async () => {
      if (cancelled) return;
      setEngine("loading");
      const mod = await import("./engine");
      if (cancelled) return;
      try {
        running = await mod.start({
          canvas: cv,
          host,
          src: SRC_SAMPLE,
          onFirstFrame: () => { if (!cancelled) setLive(true); },
          onState: (m) => { if (!cancelled) setMotion(m); },
        });
      } catch {
        return; // the <img> is already showing; nothing to recover
      }
      if (cancelled) { running.dispose(); return; }
      setCount(running.count);
      setEngine("ready");
      // Pause off-screen and when the tab is hidden.
      io = new IntersectionObserver(([e]) => running?.setVisible(e.isIntersecting), { threshold: 0.05 });
      io.observe(host);
      document.addEventListener("visibilitychange", onVis);
    };
    const onVis = () => running?.setVisible(document.visibilityState === "visible" && (host.getBoundingClientRect().bottom > 0));

    // Never on the critical path: wait for the load event.
    if (document.readyState === "complete") boot();
    else window.addEventListener("load", boot, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener("load", boot);
      document.removeEventListener("visibilitychange", onVis);
      io?.disconnect();
      running?.dispose();
    };
  }, []);

  return (
    <div
      className={styles.box}
      ref={box}
      data-particles={count || undefined}
      data-live={live ? "" : undefined}
      data-engine={engine ?? undefined}
      data-motion={motion ?? undefined}
    >
      <img
        className={styles.image}
        src={SRC_IMAGE}
        alt="Kyle Stringham, web designer in League City, Texas"
        width="598"
        height="748"
        fetchPriority="high"
        decoding="async"
      />
      <canvas className={styles.canvas} ref={canvas} aria-hidden="true" />
      {/* Only once the particles are live, and only where a pointer exists —
          which is the only place the canvas is ever shown. Absolutely
          positioned on the box's bottom edge, so it costs no layout. The
          interaction is decorative, so the hint is hidden from assistive
          technology along with the canvas it describes. */}
      {live ? (
        <p className={styles.hint} aria-hidden="true">
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 2.5v8.2l2.3-2.1 1.7 3.6 1.6-.8-1.7-3.5H12z" />
          </svg>
          Click to scatter
        </p>
      ) : null}
    </div>
  );
}
