"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { track } from "../lib/track";
import { Draggable, gsap, prefersReducedMotion } from "../motion/gsap";
import s from "./home.module.css";

export type Slide = {
  key: string;
  name: string;
  chip: string;
  what: string;
  builtFor: string;
  url: string;
  linkLabel: string;
  alt: string;
};

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The work carousel: one screen tall, one project at a time, the next
 * peeking at the edge. Drag or swipe (GSAP Draggable with inertia, snapping
 * to a slide), the prev/next buttons, the project tabs, or the arrow keys
 * with the region focused. A progress bar follows the track; the slide's
 * text staggers in on change and its screenshot drifts a little inside the
 * frame (parallax).
 *
 * Without JavaScript the track is a plain horizontal scroller with snap
 * points, so every slide is reachable. Under reduced motion: no inertia, no
 * parallax, instant moves. Screenshots after the first load lazily.
 */
export default function WorkCarousel({ items }: { items: Slide[] }) {
  const viewport = useRef<HTMLDivElement>(null);
  const trackEl = useRef<HTMLUListElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const goTo = useRef<(i: number, method: string) => void>(() => {});
  const n = items.length;

  useEffect(() => {
    const vp = viewport.current, tr = trackEl.current;
    if (!vp || !tr || n < 2) return;
    const reduced = prefersReducedMotion();
    vp.dataset.js = "1";
    vp.scrollLeft = 0;
    const slides = Array.from(tr.children) as HTMLElement[];
    const images = slides.map((sl) => sl.querySelector<HTMLElement>("img"));
    const step = () => slides[1].offsetLeft - slides[0].offsetLeft;
    const maxX = () => -(n - 1) * step();
    const clampI = (i: number) => Math.max(0, Math.min(n - 1, i));
    let lastTracked = "";

    // The counter, the progress bar and the parallax follow wherever the
    // track is, mid-drag and mid-throw included.
    const sync = () => {
      const x = Number(gsap.getProperty(tr, "x")) || 0;
      const near = clampI(Math.round(-x / step()));
      if (near !== indexRef.current) { indexRef.current = near; setIndex(near); }
      const p = maxX() ? Math.min(1, Math.max(0, x / maxX())) : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${(1 + p * (n - 1)) / n})`;
      if (reduced) return;
      const w = vp.clientWidth;
      slides.forEach((sl, i) => {
        const img = images[i];
        if (!img) return;
        const off = (sl.offsetLeft + x) / w; // 0 = in place, ±1 = a full viewport away
        gsap.set(img, { xPercent: Math.max(-6, Math.min(6, -off * 6)) });
      });
    };

    const settle = (i: number, method: string, animate = true) => {
      i = clampI(i);
      const changed = i !== indexRef.current;
      indexRef.current = i;
      setIndex(i);
      gsap.to(tr, { x: -i * step(), duration: animate && !reduced ? 0.6 : 0, ease: "power3.out", overwrite: "auto", onUpdate: sync, onComplete: sync });
      if (changed && !reduced && animate) {
        const text = slides[i].querySelectorAll<HTMLElement>(`.${s.slideText} > *`);
        gsap.fromTo(text, { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45, ease: "power2.out", stagger: 0.06, delay: 0.1, clearProps: "opacity,visibility,transform" });
      }
      if (changed && method !== lastTracked) { track("carousel_interaction", { method, project: items[i].key }); lastTracked = method; }
    };
    goTo.current = (i, method) => settle(i, method);

    const drag = Draggable.create(tr, {
      type: "x",
      bounds: { minX: maxX(), maxX: 0 },
      edgeResistance: 0.85,
      inertia: !reduced,
      maxDuration: 0.9,
      minDuration: 0.25,
      snap: reduced ? undefined : { x: (x: number) => Math.max(maxX(), Math.min(0, Math.round(x / step()) * step())) },
      onPress() { gsap.killTweensOf(tr); },
      onDrag: sync,
      onThrowUpdate: sync,
      onDragStart() { track("carousel_interaction", { method: "drag", project: items[indexRef.current].key }); lastTracked = "drag"; },
      onDragEnd() {
        // With inertia on, Draggable starts the throw after this and
        // onThrowComplete settles. Without it, snap to the nearest slide now.
        if (reduced) settle(clampI(Math.round(-(Number(gsap.getProperty(tr, "x")) || 0) / step())), "drag");
      },
      onThrowComplete: sync,
    })[0];

    // A link focused in another slide brings that slide in, without the
    // browser scrolling the clipped viewport.
    const onFocus = (e: FocusEvent) => {
      const li = (e.target as HTMLElement).closest<HTMLElement>(`.${s.slide}`);
      if (!li) return;
      vp.scrollLeft = 0;
      settle(slides.indexOf(li), "key", false);
    };
    vp.addEventListener("focusin", onFocus);

    const onResize = () => { drag.applyBounds({ minX: maxX(), maxX: 0 }); gsap.set(tr, { x: -indexRef.current * step() }); sync(); };
    const ro = new ResizeObserver(onResize);
    ro.observe(vp);
    sync();

    return () => { ro.disconnect(); vp.removeEventListener("focusin", onFocus); drag.kill(); gsap.killTweensOf(tr); gsap.set(tr, { clearProps: "x" }); images.forEach((img) => img && gsap.set(img, { clearProps: "transform" })); delete vp.dataset.js; };
  }, [items, n]);

  const onKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") { e.preventDefault(); goTo.current(indexRef.current + 1, "key"); }
    if (e.key === "ArrowLeft") { e.preventDefault(); goTo.current(indexRef.current - 1, "key"); }
    if (e.key === "Home") { e.preventDefault(); goTo.current(0, "key"); }
    if (e.key === "End") { e.preventDefault(); goTo.current(n - 1, "key"); }
  }, [n]);

  return (
    <div className={s.carousel}>
      <div ref={viewport} className={s.viewport} role="region" aria-roledescription="carousel" aria-label="Selected work" tabIndex={0} onKeyDown={onKey}>
        <ul ref={trackEl} className={s.track}>
          {items.map((w, i) => (
            <li key={w.key} className={s.slide} aria-roledescription="slide" aria-label={`${i + 1} of ${n}: ${w.name}`} data-active={i === index || undefined}>
              <div className={s.shot}>
                <div className={s.chrome}><i /><i /><i /><span>{new URL(w.url).host}</span></div>
                <div className={s.shotClip}>
                  <picture>
                    <source type="image/avif" srcSet={`/showcase/${w.key}-desktop.avif`} />
                    <img src={`/showcase/${w.key}-desktop.webp`} alt={w.alt} width={1440} height={900} loading={i === 0 ? "eager" : "lazy"} decoding="async" draggable={false} />
                  </picture>
                </div>
              </div>
              <div className={s.slideText}>
                <p className={s.chip}>{w.chip}</p>
                <h3>{w.name}</h3>
                <p>{w.what}</p>
                <p className={s.builtFor}><b>Built for one action:</b> {w.builtFor}</p>
                <a className={s.demoLink} href={w.url} target="_blank" rel="noopener noreferrer" data-track="demo" data-project={w.name}>
                  {w.linkLabel}<span aria-hidden="true"> &#8599;</span><span className="sr-only"> (opens in a new tab)</span>
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className={s.controls}>
        <div className={s.tabs}>
          {items.map((w, i) => (
            <button key={w.key} type="button" className={s.tab} aria-pressed={i === index} onClick={() => goTo.current(i, "tab")}>
              <span className={s.tabN} aria-hidden="true">{pad(i + 1)}</span>{w.name}
            </button>
          ))}
        </div>
        <div className={s.navButtons}>
          <span className={s.counter} aria-live="polite">{pad(index + 1)} <i>/</i> {pad(n)}</span>
          <button type="button" className={s.arrow} aria-label="Previous project" onClick={() => goTo.current(indexRef.current - 1, "button")} disabled={index === 0}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 9H3M8 4 3 9l5 5" /></svg>
          </button>
          <button type="button" className={s.arrow} aria-label="Next project" onClick={() => goTo.current(indexRef.current + 1, "button")} disabled={index === n - 1}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 9h12M10 4l5 5-5 5" /></svg>
          </button>
        </div>
      </div>
      <div className={s.progress} aria-hidden="true"><span ref={bar} style={{ transform: `scaleX(${1 / n})` }} /></div>
    </div>
  );
}
