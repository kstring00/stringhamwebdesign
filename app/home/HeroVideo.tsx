"use client";

import { useEffect, useRef, useState } from "react";

import s from "./hero.module.css";

type Connection = { saveData?: boolean; effectiveType?: string };

/** The three web versions (scripts/hero-media.js). A phone gets the small one; the rest get WebM where it plays, MP4 where it doesn't. */
const SMALL = [{ src: "/hero/hero-loop-720.mp4", type: "video/mp4" }];
const LARGE = [{ src: "/hero/hero-loop.webm", type: "video/webm" }, { src: "/hero/hero-loop.mp4", type: "video/mp4" }];

/**
 * The hero's moving background, laid over the still.
 *
 * Nothing is fetched until the page has loaded what it needs: the element
 * has no source in the HTML. It is given one, and started, when the hero is
 * on screen, and only if the visitor has not asked for less: with reduced
 * motion or data saver on there is no video at all, just the still. It
 * pauses when the hero scrolls away or the tab is hidden, and it gives up
 * quietly (back to the still) if it cannot play.
 *
 * The scene moves for longer than five seconds, so there is a pause and play
 * button. The video itself is decoration: muted, hidden from screen readers
 * and out of the tab order.
 */
export default function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  // "off": the still only (no button). "on": playing. "paused": stopped by the visitor, or the browser would not start it.
  const [state, setState] = useState<"off" | "on" | "paused">("off");
  const [showing, setShowing] = useState(false);
  const stopped = useRef(false);
  const inView = useRef(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const conn = (navigator as Navigator & { connection?: Connection }).connection;
    const saver = Boolean(conn?.saveData) || /(^|-)2g$/.test(conn?.effectiveType || "") || window.matchMedia("(prefers-reduced-data: reduce)").matches;
    if (reduce.matches || saver) return;

    let loaded = false, dead = false;
    const fail = () => { dead = true; v.pause(); setShowing(false); setState("off"); };
    const start = () => {
      if (dead || stopped.current || !inView.current || document.visibilityState !== "visible") return;
      if (!loaded) {
        loaded = true;
        v.muted = true;
        const list = window.matchMedia("(max-width: 700px)").matches ? SMALL : LARGE;
        list.forEach((f, i) => {
          const el = document.createElement("source");
          el.src = f.src; el.type = f.type;
          // Only the last one failing means no version could be played.
          if (i === list.length - 1) el.addEventListener("error", fail);
          v.appendChild(el);
        });
        v.load();
      }
      // A browser that refuses to start it (a phone in low power mode) leaves the still and a play button.
      v.play().then(() => setState("on")).catch(() => { if (!dead) setState("paused"); });
    };
    const onPlaying = () => setShowing(true);
    const onVisibility = () => { if (document.visibilityState === "visible") start(); else v.pause(); };
    const onReduce = () => { if (reduce.matches) fail(); };
    const io = new IntersectionObserver(([e]) => { inView.current = e.isIntersecting; if (e.isIntersecting) start(); else v.pause(); }, { threshold: 0.05 });

    v.addEventListener("playing", onPlaying);
    v.addEventListener("error", fail);
    document.addEventListener("visibilitychange", onVisibility);
    reduce.addEventListener("change", onReduce);
    io.observe(v);
    return () => {
      io.disconnect();
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("error", fail);
      document.removeEventListener("visibilitychange", onVisibility);
      reduce.removeEventListener("change", onReduce);
    };
  }, []);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (state === "on") { stopped.current = true; v.pause(); setState("paused"); }
    else { stopped.current = false; v.play().then(() => setState("on")).catch(() => setState("paused")); }
  };

  return (
    <>
      <video ref={ref} className={`${s.media} ${s.video}`} data-on={showing ? "" : undefined} muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1} disablePictureInPicture disableRemotePlayback data-hero-video />
      {state !== "off" ? (
        <button className={s.pause} type="button" onClick={toggle} aria-label={state === "on" ? "Pause the background video" : "Play the background video"} data-hero-pause>
          {state === "on"
            ? <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><rect x="3.5" y="3" width="3.2" height="10" rx="1" /><rect x="9.3" y="3" width="3.2" height="10" rx="1" /></svg>
            : <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M5 3.2v9.6a.6.6 0 0 0 .92.5l7.4-4.8a.6.6 0 0 0 0-1L5.92 2.7A.6.6 0 0 0 5 3.2Z" /></svg>}
        </button>
      ) : null}
    </>
  );
}
