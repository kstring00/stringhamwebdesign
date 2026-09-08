"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./HeroTileGrid.module.css";

const FALLOFF = 250; // px from the cursor at which a tile stops responding
const LIFT = 84; // px of translateZ at full strength
const GROW = 0.028; // added scale at full strength
const TILT = 8; // deg of rotateX/rotateY at full strength
const SETTLE = 520; // ms — matches the ease-back transition in the stylesheet
const FALLOFF_CURVE = 1.35; // concentrates the lift under the cursor

type Layout = { cols: number; rows: number; track: boolean };

const WIDE: Layout = { cols: 7, rows: 5, track: true };
const COMPACT: Layout = { cols: 5, rows: 4, track: true };
const STILL: Layout = { cols: 5, rows: 4, track: false };

export default function HeroTileGrid() {
  const [layout, setLayout] = useState<Layout>(WIDE);
  const [still, setStill] = useState(false);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const bloomRef = useRef<HTMLSpanElement | null>(null);
  const monogramRef = useRef<HTMLSpanElement | null>(null);
  const layoutRef = useRef<Layout>(WIDE);
  const tilesRef = useRef<Array<HTMLDivElement | null>>([]);
  const centersRef = useRef<Array<{ x: number; y: number }>>([]);
  const boundsRef = useRef<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const strengthRef = useRef<number[]>([]);
  const frameRef = useRef(0);
  const idleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  layoutRef.current = layout;

  const count = layout.cols * layout.rows;

  // Layout and motion preference both come from media queries so the grid keeps
  // matching the page after a resize or a change to the OS motion setting.
  useEffect(() => {
    const compact = window.matchMedia("(max-width: 1023.98px)");
    const touch = window.matchMedia("(max-width: 767.98px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    const sync = () => {
      setStill(reduce.matches);
      setLayout(touch.matches ? STILL : compact.matches ? COMPACT : WIDE);
    };

    sync();
    compact.addEventListener("change", sync);
    touch.addEventListener("change", sync);
    reduce.addEventListener("change", sync);
    return () => {
      compact.removeEventListener("change", sync);
      touch.removeEventListener("change", sync);
      reduce.removeEventListener("change", sync);
    };
  }, []);

  // Everything is derived from one rect read on the stage plus the grid metrics,
  // never from the tiles themselves: a tile that is mid-lift reports a transformed
  // box, which would poison both the centres and the mask.
  const measure = useCallback(() => {
    const stage = stageRef.current;
    const bloom = bloomRef.current;
    const monogram = monogramRef.current;
    if (!stage) return;

    const box = stage.getBoundingClientRect();
    if (!box.width || !box.height) return;

    boundsRef.current = {
      x1: box.left + window.scrollX,
      y1: box.top + window.scrollY,
      x2: box.right + window.scrollX,
      y2: box.bottom + window.scrollY,
    };

    const read = getComputedStyle(stage);
    const gap = parseFloat(read.getPropertyValue("--gap")) || 7;
    const radius = parseFloat(read.getPropertyValue("--radius")) || 18;
    const { cols, rows } = layoutRef.current;

    const cellW = (box.width - (cols - 1) * gap) / cols;
    const cellH = (box.height - (rows - 1) * gap) / rows;

    const centers: Array<{ x: number; y: number }> = [];
    let shapes = "";
    for (let i = 0; i < cols * rows; i += 1) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = col * (cellW + gap);
      const y = row * (cellH + gap);
      centers.push({
        x: box.left + window.scrollX + x + cellW / 2,
        y: box.top + window.scrollY + y + cellH / 2,
      });
      shapes +=
        `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" ` +
        `width="${cellW.toFixed(2)}" height="${cellH.toFixed(2)}" ` +
        `rx="${radius}" fill="#fff"/>`;
    }
    centersRef.current = centers;

    // Clip both the colour field and monogram to the tile shapes. The KS therefore
    // feels embedded beneath the glass instead of printing across the cream gutters.
    if (bloom || monogram) {
      const svg =
        `<svg xmlns="http://www.w3.org/2000/svg" width="${box.width.toFixed(2)}" ` +
        `height="${box.height.toFixed(2)}">${shapes}</svg>`;
      const url = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
      for (const layer of [bloom, monogram]) {
        if (!layer) continue;
        layer.style.maskImage = url;
        layer.style.webkitMaskImage = url;
      }
    }
  }, []);

  useEffect(() => {
    tilesRef.current.length = count;
    strengthRef.current = new Array(count).fill(0);
    measure();

    const stage = stageRef.current;
    if (!stage) return;

    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [count, measure]);

  useEffect(() => {
    if (still || !layout.track) return;

    const stage = stageRef.current;
    if (!stage) return;

    const paint = () => {
      frameRef.current = 0;
      const point = pointerRef.current;
      const tiles = tilesRef.current;
      const centers = centersRef.current;
      const last = strengthRef.current;

      for (let i = 0; i < tiles.length; i += 1) {
        const el = tiles[i];
        const c = centers[i];
        if (!el || !c) continue;

        let s = 0;
        let rx = 0;
        let ry = 0;

        if (point) {
          const dx = point.x - c.x;
          const dy = point.y - c.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < FALLOFF) {
            const raw = 1 - dist / FALLOFF;
            s = Math.pow(raw, FALLOFF_CURVE);
            // Tilt away from the cursor: the edge nearest it leans back.
            ry = (dx / FALLOFF) * TILT * s;
            rx = -(dy / FALLOFF) * TILT * s;
          }
        }

        // A tile that was flat and stays flat needs no write at all.
        if (s === 0 && last[i] === 0) continue;
        last[i] = s;

        if (s === 0) {
          el.style.transform = "";
          el.style.setProperty("--s", "0");
          continue;
        }

        el.style.transform =
          `translate3d(0,0,${(LIFT * s).toFixed(2)}px) ` +
          `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) ` +
          `scale(${(1 + GROW * s).toFixed(4)})`;
        el.style.setProperty("--s", s.toFixed(3));
      }
    };

    const schedule = () => {
      if (!frameRef.current) frameRef.current = requestAnimationFrame(paint);
    };

    // will-change is only worth its memory while the grid is actually moving.
    const settle = () => {
      idleRef.current = null;
      stage.classList.remove(styles.live);
    };

    const onMove = (event: MouseEvent) => {
      const b = boundsRef.current;
      if (!b) return;

      const x = event.pageX;
      const y = event.pageY;
      const near =
        x >= b.x1 - FALLOFF &&
        x <= b.x2 + FALLOFF &&
        y >= b.y1 - FALLOFF &&
        y <= b.y2 + FALLOFF;

      if (!near) {
        if (!pointerRef.current) return;
        pointerRef.current = null;
        stage.classList.remove(styles.live);
        schedule();
        return;
      }

      pointerRef.current = { x, y };
      stage.classList.add(styles.live);
      if (idleRef.current) clearTimeout(idleRef.current);
      idleRef.current = setTimeout(settle, SETTLE);
      schedule();
    };

    const onLeave = () => {
      pointerRef.current = null;
      stage.classList.remove(styles.live);
      schedule();
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("blur", onLeave);
    document.addEventListener("mouseleave", onLeave);
    window.addEventListener("scroll", measure, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("blur", onLeave);
      document.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("scroll", measure);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      if (idleRef.current) clearTimeout(idleRef.current);
      frameRef.current = 0;
      pointerRef.current = null;
      stage.classList.remove(styles.live);
      for (const el of tilesRef.current) {
        if (!el) continue;
        el.style.transform = "";
        el.style.setProperty("--s", "0");
      }
      strengthRef.current.fill(0);
    };
  }, [layout.track, still, measure, count]);

  return (
    <div
      ref={stageRef}
      className={`${styles.stage} ${still || !layout.track ? styles.stillStage : ""}`}
      style={{ "--cols": layout.cols, "--rows": layout.rows } as React.CSSProperties}
      aria-hidden="true"
    >
      <span ref={bloomRef} className={styles.bloom} />
      <span ref={monogramRef} className={styles.monogram}>
        <span className={styles.monogramK}>K</span>
        <span className={styles.monogramS}>S</span>
      </span>
      <div className={styles.grid}>
        {Array.from({ length: count }, (_, i) => (
          <div
            key={i}
            className={styles.tile}
            ref={(el) => {
              tilesRef.current[i] = el;
            }}
          >
            <span className={styles.glow} />
            <span className={styles.pane}>
              <span className={styles.sheen} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
