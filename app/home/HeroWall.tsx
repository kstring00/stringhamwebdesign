"use client";

import { useEffect, useRef } from "react";

import { kindLabel, type Work } from "../data/work";
import s from "./herowall.module.css";

type Tile = { key: string; name: string; short: string; label: string; href: string; shape: "desktop" | "mobile"; alt: string; w: number; h: number };

/** The thumbnails (public/showcase/thumbs, from scripts/make-thumbs.js), 520px wide. */
const THUMB = { desktop: { w: 520, h: 325 }, mobile: { w: 520, h: 934 } };
/** A 1×1 transparent GIF: what an eager column tile "loads" on phones, where the columns are display: none. */
const BLANK = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
/** The phone layout's breakpoint; the same number as herowall.module.css. */
const PHONE = "(max-width: 44.99rem)";

/**
 * Every project as a desktop tile, and as a phone tile when it has a phone
 * capture, alternating the two shapes so no row of the wall lines up.
 */
/** Phone tiles only for projects with a real phone capture. */
const phoneTiles = (work: Work[]) => work.filter((w) => w.alt.mobile).map((w): Tile => ({ key: w.key, name: w.name, short: w.shortName ?? w.name, label: kindLabel[w.kind].label, href: `/work#${w.key}`, shape: "mobile", alt: w.alt.mobile!, ...THUMB.mobile }));

function tiles(work: Work[]): Tile[] {
  const d = work.map((w): Tile => ({ key: w.key, name: w.name, short: w.shortName ?? w.name, label: kindLabel[w.kind].label, href: `/work#${w.key}`, shape: "desktop", alt: w.alt.desktop, ...THUMB.desktop }));
  const m = phoneTiles(work);
  const out: Tile[] = [];
  // Each desktop tile, then the next phone capture round (each phone once).
  d.forEach((tile, i) => { out.push(tile); if (i < m.length) out.push(m[(i + 1) % m.length]); });
  return out;
}

/** Round-robin into columns. */
const split = <T,>(items: T[], cols: number) => Array.from({ length: cols }, (_, c) => items.filter((_, i) => i % cols === c));

function Frame({ t, first, eager }: { t: Tile; first: boolean; eager: boolean }) {
  return (
    <a
      className={`${s.tile} ${t.shape === "mobile" ? s.phone : s.desktop}`}
      href={t.href}
      aria-hidden={first ? undefined : "true"}
      tabIndex={first ? undefined : -1}
      aria-label={first ? `${t.name}: ${t.label}. See it on the work page.` : undefined}
      data-track="cta"
      data-location="hero-wall"
      data-project={t.key}
    >
      {t.shape === "desktop" ? (
        <span className={s.chrome} aria-hidden="true"><i /><i /><i /><span className={s.chromeName}>{t.short}</span></span>
      ) : (
        <span className={s.notch} aria-hidden="true" />
      )}
      <picture>
        {/* An eager tile sits in the columns, which phones never show: there it resolves to a blank pixel instead of a download. */}
        {eager ? <source media={PHONE} srcSet={BLANK} /> : null}
        <source type="image/avif" srcSet={`/showcase/thumbs/${t.key}-${t.shape}.avif`} />
        <img src={`/showcase/thumbs/${t.key}-${t.shape}.webp`} alt={first ? t.alt : ""} width={t.w} height={t.h} loading={eager ? "eager" : "lazy"} decoding="async" draggable={false} />
      </picture>
      {/* The honest kind, from work.ts, as a badge over the capture. */}
      <span className={s.kind} aria-hidden="true">{t.label}</span>
      {t.shape === "mobile" ? <span className={s.phoneLabel} aria-hidden="true">{t.short}</span> : null}
    </a>
  );
}

/**
 * The hero's work wall: the real projects as small browser and phone
 * frames, in three columns that drift in a slow seamless loop (up, down,
 * up; CSS transforms on a duplicated track), fading out at the top and
 * bottom. Two columns on tablets, one sideways-drifting row on phones.
 * Hover or keyboard focus pauses it, it stops while the hero is off
 * screen, and under reduced motion it's a still grid. Only the first copy
 * of each tile is a real link to assistive tech; the loop copies are
 * hidden from it. The phone row uses the phone captures only: each is
 * smaller on screen than the headline, so the headline stays the page's
 * largest paint (LCP) whatever the screen height.
 */
export default function HeroWall({ work }: { work: Work[] }) {
  const root = useRef<HTMLDivElement>(null);

  // Off screen, the animation stops (nothing to see, nothing to spend).
  useEffect(() => {
    const el = root.current;
    const hero = el?.closest("section");
    if (!el || !hero) return;
    const io = new IntersectionObserver(([e]) => { el.dataset.paused = e.isIntersecting ? "" : "1"; });
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  const all = tiles(work);
  const cols = split(all, 3);
  const seen = new Set<string>();
  const firstOf = (t: Tile) => { const id = `${t.key}-${t.shape}`; if (seen.has(id)) return false; seen.add(id); return true; };
  let eagerLeft = 2;
  const eager = () => eagerLeft-- > 0;

  return (
    <div ref={root} className={s.wall} data-field-clear>
      {/* Desktop and tablet: columns. Each track is two identical halves, so a -50% loop is seamless. */}
      <div className={s.cols}>
        {cols.map((col, c) => {
          const half = Array.from({ length: Math.ceil(3 / Math.max(1, col.length)) }, () => col).flat();
          return (
            <div key={c} className={s.col} style={{ "--dur": `${[52, 60, 46][c]}s` } as React.CSSProperties} data-dir={c === 1 ? "down" : "up"}>
              <div className={s.track}>
                {[...half, ...half].map((t, i) => <Frame key={`${t.key}-${t.shape}-${i}`} t={t} first={firstOf(t)} eager={c === 0 && i < 2 && eager()} />)}
              </div>
            </div>
          );
        })}
      </div>
      {/* Phones: one row of the phone captures, drifting sideways (display: none elsewhere, so its images never load there). Each half is the set twice, so it's wider than any phone. */}
      <div className={s.row} aria-hidden="true">
        <div className={s.rowTrack}>
          {(() => { const half = [...phoneTiles(work), ...phoneTiles(work)]; return [...half, ...half].map((t, i) => <Frame key={`row-${t.key}-${i}`} t={t} first={false} eager={false} />); })()}
        </div>
      </div>
    </div>
  );
}
