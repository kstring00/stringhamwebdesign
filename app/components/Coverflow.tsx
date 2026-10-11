"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { kindLabel, type WorkKind } from "../data/work";
import { track } from "../lib/track";
import { Draggable, gsap, prefersReducedMotion } from "../motion/gsap";
import s from "./coverflow.module.css";

export type CoverItem = {
  key: string;
  name: string;
  kind: WorkKind;
  stage: string;
  type?: string;
  what: string;
  builtFor?: string;
  built: string[];
  href?: string;
  linkLabel: string;
  alt: string;
};

/**
 * How far apart the cards sit (fraction of a card's width) and how far the
 * side ones turn. Each side card swings back on its outer edge, so that
 * edge stays level with the centre card and the inner edge recedes: the
 * cards face in, like the inside of a ring.
 */
// With the perspective at 2.3 card widths (coverflow.module.css), this
// spacing leaves the receding inner edges just clear of the centre card.
const SPACING = 1.05;
const ROTATE = 40;
/** sin(ROTATE) / 2: how far back a card sits so its outer edge stays at the front. */
const BACK = Math.sin((ROTATE * Math.PI) / 180) / 2;

/** Wrap an offset into [-n/2, n/2), so the carousel loops. */
function wrap(o: number, n: number) {
  return ((((o + n / 2) % n) + n) % n) - n / 2;
}

/**
 * Where a card sits for a given offset from the centre (0 = centre, ±1 =
 * the neighbours, fractional while dragging): the centre card flat, the
 * neighbours turned to face the centre (the "inverted" coverflow), anything
 * further faded out. Depth is a fraction of the card width (--w), so the
 * same pose works at every size, on the server and in the browser.
 */
function pose(o: number) {
  const a = Math.abs(o);
  const turn = Math.max(-1, Math.min(1, o));
  const back = Math.min(a, 1) * BACK + Math.max(a - 1, 0) * 0.25;
  const opacity = a <= 1.25 ? 1 : Math.max(0, 1 - (a - 1.25) / 0.5);
  return {
    transform: `translateX(${(o * SPACING * 100).toFixed(3)}%) translateZ(calc(var(--w) * ${(-back).toFixed(4)})) rotateY(${(-turn * ROTATE).toFixed(2)}deg)`,
    opacity,
    zIndex: 100 - Math.round(a * 10),
    shade: Math.min(a, 1) * 0.22,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The selected-work carousel, shared by the home page and /partners: the
 * projects as browser-framed screenshots in a 3D coverflow, the centred
 * one flat and forward, its neighbours turned in on either side. Drag or
 * swipe, the arrows, the dots, a tap on a side card, or the arrow keys with
 * the carousel focused; it loops. Underneath, the centred project's label,
 * what it is and what was built, swapped with a short fade as it changes.
 *
 * Without JavaScript the first project sits centred with its text below.
 * Under reduced motion every move is instant. GSAP only (Draggable for the
 * drag); one number, the position, drives every card.
 */
export default function Coverflow({ items, label, accent = "business" }: { items: CoverItem[]; label: string; accent?: "business" | "partners" }) {
  const n = items.length;
  const stage = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLLIElement | null)[]>([]);
  const details = useRef<HTMLDivElement>(null);
  const pos = useRef({ v: 0 });
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const goTo = useRef<(i: number, method: string) => void>(() => {});
  const lastMethod = useRef("");

  // Paint every card for the current position.
  const layout = useCallback(() => {
    const p = pos.current.v;
    cards.current.forEach((el, i) => {
      if (!el) return;
      const o = wrap(i - p, n);
      const q = pose(o);
      el.style.transform = q.transform;
      el.style.opacity = String(q.opacity);
      el.style.zIndex = String(q.zIndex);
      el.style.setProperty("--shade", q.shade.toFixed(3));
      el.style.setProperty("--side", o < 0 ? "-1" : "1");
      el.style.visibility = q.opacity <= 0.01 ? "hidden" : "visible";
    });
    const i = ((Math.round(p) % n) + n) % n;
    if (i !== indexRef.current) { indexRef.current = i; setIndex(i); }
  }, [n]);

  useEffect(() => {
    const el = stage.current;
    const state = pos.current;
    if (!el || n < 2) return;
    const reduced = prefersReducedMotion();
    el.dataset.js = "1";
    layout();

    const note = (method: string) => {
      if (method === lastMethod.current) return;
      lastMethod.current = method;
      track("carousel_interaction", { method, project: items[indexRef.current]?.key ?? "" });
    };

    const settle = (target: number, method: string) => {
      note(method);
      gsap.to(pos.current, { v: target, duration: reduced ? 0 : 0.65, ease: "power3.out", overwrite: true, onUpdate: layout, onComplete: layout });
    };
    // The shortest way round to slide i.
    goTo.current = (i, method) => {
      const p = pos.current.v;
      const here = ((Math.round(p) % n) + n) % n;
      let d = i - here;
      if (d > n / 2) d -= n;
      if (d < -n / 2) d += n;
      settle(Math.round(p) + d, method);
    };

    // Drag: a proxy element follows the pointer; the position follows the proxy.
    const proxy = document.createElement("div");
    let start = 0, startX = 0, lastX = 0, lastT = 0, vel = 0, dragged = false;
    const cardW = () => (cards.current[0]?.offsetWidth || 1) * SPACING;
    const drag = Draggable.create(proxy, {
      trigger: el,
      type: "x",
      minimumMovement: 6,
      allowNativeTouchScrolling: true,
      onPress() { gsap.killTweensOf(pos.current); start = pos.current.v; startX = this.x; lastX = this.x; lastT = performance.now(); vel = 0; dragged = false; },
      onDragStart() { dragged = true; note("drag"); },
      onDrag() {
        const now = performance.now();
        vel = (this.x - lastX) / Math.max(1, now - lastT);
        lastX = this.x; lastT = now;
        pos.current.v = start - (this.x - startX) / cardW();
        layout();
      },
      onDragEnd() {
        // A flick carries on a little; then it settles on the nearest card.
        const fling = reduced ? 0 : -vel * 180 / cardW();
        settle(Math.round(pos.current.v + Math.max(-1.5, Math.min(1.5, fling))), "drag");
      },
    })[0];

    // A tap (not a drag) on a side card brings it to the centre.
    const onTap = (e: MouseEvent) => {
      if (dragged) return;
      const li = (e.target as HTMLElement).closest<HTMLElement>("[data-i]");
      if (li) { const i = Number(li.dataset.i); if (i !== indexRef.current) goTo.current(i, "card"); }
    };
    el.addEventListener("click", onTap);

    const ro = new ResizeObserver(layout);
    ro.observe(el);
    return () => { ro.disconnect(); el.removeEventListener("click", onTap); drag.kill(); gsap.killTweensOf(state); delete el.dataset.js; };
  }, [items, n, layout]);

  // The text underneath fades over when the centred project changes.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (prefersReducedMotion()) return;
    const panel = details.current?.querySelector<HTMLElement>(`[data-panel="${index}"]`);
    if (!panel) return;
    gsap.fromTo(panel.querySelectorAll(":scope > * > *"), { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45, ease: "power2.out", stagger: 0.04, clearProps: "opacity,visibility,transform" });
  }, [index]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") { e.preventDefault(); goTo.current((indexRef.current + 1) % n, "key"); }
    if (e.key === "ArrowLeft") { e.preventDefault(); goTo.current((indexRef.current - 1 + n) % n, "key"); }
  };

  return (
    <div className={s.root} data-accent={accent}>
      <div ref={stage} className={s.stage} role="region" aria-roledescription="carousel" aria-label={label} tabIndex={0} onKeyDown={onKey}>
        <ul className={s.track}>
          {items.map((w, i) => {
            const q = pose(wrap(i, n));
            return (
              <li
                key={w.key}
                ref={(el) => { cards.current[i] = el; }}
                className={s.card}
                data-i={i}
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${n}: ${w.name}`}
                aria-hidden={i !== index || undefined}
                style={{ transform: q.transform, opacity: q.opacity, zIndex: q.zIndex, visibility: q.opacity <= 0.01 ? "hidden" : "visible", "--shade": q.shade, "--side": wrap(i, n) < 0 ? -1 : 1 } as React.CSSProperties}
              >
                <div className={s.chrome} aria-hidden="true"><i /><i /><i /><span>{w.href ? new URL(w.href).host : w.name}</span></div>
                <div className={s.shot}>
                  <picture>
                    <source type="image/avif" srcSet={`/showcase/${w.key}-desktop.avif`} />
                    <img src={`/showcase/${w.key}-desktop.webp`} alt={w.alt} width={1440} height={900} loading={i === 0 ? "eager" : "lazy"} decoding="async" draggable={false} />
                  </picture>
                </div>
                <span className={s.shade} aria-hidden="true" />
              </li>
            );
          })}
        </ul>
        <button type="button" className={`${s.arrow} ${s.prev}`} aria-label="Previous project" onClick={() => goTo.current((indexRef.current - 1 + n) % n, "button")}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12.5 4.5 7 10l5.5 5.5" /></svg>
        </button>
        <button type="button" className={`${s.arrow} ${s.next}`} aria-label="Next project" onClick={() => goTo.current((indexRef.current + 1) % n, "button")}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7.5 4.5 13 10l-5.5 5.5" /></svg>
        </button>
      </div>

      <div className={s.dots} role="group" aria-label="Choose a project">
        {items.map((w, i) => (
          <button key={w.key} type="button" className={s.dot} aria-label={`Show ${w.name}`} aria-pressed={i === index} onClick={() => goTo.current(i, "dot")}><span /></button>
        ))}
        <span className={s.counter} aria-live="polite">{pad(index + 1)} <i>/</i> {pad(n)}<span className="sr-only">: {items[index]?.name}</span></span>
      </div>

      {/* All the panels share one grid cell, so the height never jumps; only the centred one shows. */}
      <div ref={details} className={s.details}>
        {items.map((w, i) => (
          <div key={w.key} className={s.panel} data-panel={i} aria-hidden={i !== index || undefined} inert={i !== index || undefined} data-on={i === index || undefined}>
            <div className={s.lead}>
              <p className={s.meta}>
                <span className={`${s.kind} ${s[`kind_${w.kind.replace("-", "_")}`] ?? ""}`}>{kindLabel[w.kind].label}</span>
                <span>{w.stage}</span>
              </p>
              <h3 className={s.name}>{w.name}</h3>
              {w.type ? <p className={s.type}>{w.type}</p> : null}
              <p className={s.what}>{w.what}</p>
              {w.builtFor ? <p className={s.builtFor}><b>Built for one action:</b> {w.builtFor}</p> : null}
              {w.href ? (
                <a className={s.link} href={w.href} target="_blank" rel="noopener noreferrer" data-track="demo" data-project={w.name} tabIndex={i === index ? undefined : -1}>
                  {w.linkLabel}<span aria-hidden="true"> &#8599;</span><span className="sr-only"> (opens in a new tab)</span>
                </a>
              ) : null}
            </div>
            <div className={s.builtCol}>
              <p className={s.builtLabel}>What I built</p>
              <ul className={s.built}>{w.built.map((b) => <li key={b}>{b}</li>)}</ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
