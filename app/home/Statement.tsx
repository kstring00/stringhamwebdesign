"use client";

import { useEffect, useRef } from "react";

import { gsap, prefersReducedMotion } from "../motion/gsap";
import s from "./statement.module.css";

/** The two lines, word by word. Accent words get the green and an underline. */
const LINES: { text: string; accent?: boolean }[][] = [
  [{ text: "Beautiful" }, { text: "gets" }, { text: "them" }, { text: "to" }, { text: "look.", accent: true }],
  [{ text: "Clear" }, { text: "gets" }, { text: "them" }, { text: "to" }, { text: "call.", accent: true }],
];
const ACTIONS = ["a call", "a booking", "an order", "a request"];

/**
 * A statement band between the "lifeless" section and How it works: the
 * idea the whole studio stands on, in big type. As it scrolls through, the
 * words fill in one after another (one CSS variable, --f, scrubbed by
 * ScrollTrigger), and "look" and "call" draw their underlines. Below, the
 * one action a page is built around rolls through calls, bookings, orders
 * and requests.
 *
 * The words are real text at every moment and never drop below 3:1
 * contrast (they move from muted to ink, never to transparent). No JS: the
 * finished state. Reduced motion: finished state, and the rolling word is
 * replaced by the full list.
 */
export default function Statement() {
  const band = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = band.current;
    if (!el || prefersReducedMotion()) return;
    const state = { f: 0 };
    const apply = () => el.style.setProperty("--f", state.f.toFixed(4));
    apply();
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 82%", end: "bottom 58%", scrub: 0.5 } })
      .to(state, { f: 1, ease: "none", duration: 1, onUpdate: apply });
    return () => { tl.scrollTrigger?.kill(); tl.kill(); el.style.removeProperty("--f"); };
  }, []);

  const total = LINES.flat().length;
  let i = 0;
  return (
    <section ref={band} className={s.band} aria-labelledby="statement-title">
      <div className="container">
        <h2 id="statement-title" className={s.statement}>
          {LINES.map((line, l) => (
            <span key={l} className={s.line}>
              {line.map((w) => {
                const at = i++ / total;
                return (
                  <span key={w.text + at} className={`${s.word} ${w.accent ? s.accent : ""}`} style={{ "--s": at.toFixed(3) } as React.CSSProperties}>
                    {w.text}{" "}
                  </span>
                );
              })}
            </span>
          ))}
        </h2>
        <p className={s.sub}>
          That&rsquo;s why every page I build is designed around one action:{" "}
          <span className={s.rot} aria-hidden="true">
            {/* Drawn by CSS (content: attr(data-w)), so the rolling copies stay out of the page text. */}
            <span className={s.rotTrack}>{[...ACTIONS, ACTIONS[0]].map((a, k) => <span key={k} data-w={`${a}.`} />)}</span>
          </span>
          <span className={s.rotStatic}>{ACTIONS.slice(0, -1).join(", ")} or {ACTIONS.at(-1)}.</span>
        </p>
      </div>
    </section>
  );
}
