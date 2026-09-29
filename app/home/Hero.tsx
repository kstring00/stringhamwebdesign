"use client";

import { useEffect, useRef } from "react";

import { cta } from "../data/nav";
import { ideas } from "../data/services";
import { studioLine } from "../data/site";
import Magnetic from "../motion/Magnetic";
import { drawStrokes, prepareStrokes } from "../motion/draw";
import { gsap, ScrollSmoother, isFinePointerDesktop, prefersReducedMotion, whenIdle } from "../motion/gsap";
import { roughRect } from "../motifs/sketch";
import sk from "../motifs/sketch.module.css";
import styles from "./hero.module.css";

function Arrow() {
  return (
    <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
      <path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

const WORDS_BEFORE = ["Turn", "your"];
const WORDS_AFTER = ["into", "something", "real."];
const ROTATE_EVERY = 3.4;

/**
 * The hero. "Turn your [idea] into something real." Each word rises out of
 * its own mask (under 1.2s in all), and the bracketed word swaps slowly
 * through the list in app/data/services.ts. Behind the headline, faint
 * pencil column guides and a rough sketched rectangle draw themselves, then
 * resolve into one clean frame: the motif for the whole site, stated once.
 * Readable at once without JS; with reduced motion nothing moves and the
 * word stays on "idea". Phones skip the word masks (the headline is the
 * largest paint) and only fade the lines around it.
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const desktop = isFinePointerDesktop();
    const ctx = gsap.context(() => {
      const words = gsap.utils.toArray<HTMLElement>("[data-word]", el);
      const rest = el.querySelectorAll("[data-hero]");
      if (desktop) {
        gsap.set(words, { yPercent: 110 });
        const intro = () => {
          gsap.timeline({ defaults: { ease: "power4.out" } })
            .to(words, { yPercent: 0, duration: 0.85, stagger: 0.07 }, 0.05)
            .from(rest, { autoAlpha: 0, y: 16, duration: 0.7, stagger: 0.08 }, 0.45);
        };
        if (document.fonts?.status === "loaded") intro(); else document.fonts?.ready.then(intro);
      } else {
        // Phones: the headline and subline are the largest paints, so they
        // show at once; only the buttons ease in.
        gsap.from(el.querySelectorAll("[data-hero-btn]"), { autoAlpha: 0, y: 10, duration: 0.5, stagger: 0.08, delay: 0.15 });
      }

      // The rotating word: masked swap, slow, forever.
      const rot = el.querySelector<HTMLElement>("[data-rot]")!;
      const list = gsap.utils.toArray<HTMLElement>("[data-rot-word]", rot);
      let i = 0;
      const swap = () => {
        const from = list[i];
        i = (i + 1) % list.length;
        const to = list[i];
        gsap.set(to, { yPercent: 110, visibility: "visible" });
        gsap.timeline({ defaults: { duration: 0.8, ease: "power3.inOut" } })
          .to(rot, { width: to.offsetWidth }, 0)
          .to(from, { yPercent: -110 }, 0)
          .to(to, { yPercent: 0 }, 0.06)
          .set(from, { visibility: "hidden" });
      };
      const startRot = () => { gsap.set(rot, { width: list[0].offsetWidth }); gsap.delayedCall(ROTATE_EVERY, function loop() { swap(); gsap.delayedCall(ROTATE_EVERY, loop); }); };
      if (document.fonts?.status === "loaded") startRot(); else document.fonts?.ready.then(startRot);
      // Keep the width honest if the viewport changes.
      const onResize = () => gsap.set(rot, { width: list[i].offsetWidth });
      window.addEventListener("resize", onResize);

      // The sketch: guides, then the rough rectangle, then the clean frame.
      const guides = el.querySelector<SVGSVGElement>("[data-guides]")!;
      const rough = el.querySelector<SVGSVGElement>("[data-rough]")!;
      const clean = el.querySelector<HTMLElement>("[data-clean]")!;
      const gStrokes = prepareStrokes(guides);
      const rStrokes = prepareStrokes(rough);
      gsap.set(clean, { autoAlpha: 0 });
      const cancel = whenIdle(() => {
        gsap.timeline({ delay: desktop ? 0.2 : 0.4 })
          .add(drawStrokes(gStrokes, { duration: 1.4, stagger: 0.035, ease: "power2.out" }))
          .add(drawStrokes(rStrokes, { duration: 0.55, stagger: 0.32, ease: "power1.inOut" }), "-=1.1")
          .to(rough, { autoAlpha: 0, duration: 0.9, ease: "power2.inOut" }, "+=0.35")
          .to(clean, { autoAlpha: 1, duration: 0.9, ease: "power2.inOut" }, "<")
          .from(clean.querySelectorAll("i"), { scale: 0, duration: 0.5, ease: "back.out(2)", stagger: 0.05 }, "<0.3");
      }, 1600);
      return () => { cancel(); window.removeEventListener("resize", onResize); };
    }, el);
    return () => ctx.revert();
  }, []);

  const onHow = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const s = ScrollSmoother.get();
    const target = document.getElementById("idea-to-reality");
    if (!s || !target) return;
    e.preventDefault();
    s.scrollTo(target, true, "top top");
  };

  return (
    <section className={styles.hero} ref={root} aria-labelledby="hero-title">
      {/* Column guides, like a layout grid drawn by hand. */}
      <svg className={styles.guides} data-guides viewBox="0 0 1200 800" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        {Array.from({ length: 11 }, (_, i) => <line key={i} className={sk.pencilSoft} data-stroke x1={100 * (i + 1)} y1={i % 2 ? 40 : 0} x2={100 * (i + 1)} y2={i % 3 ? 800 : 760} />)}
        <line className={sk.pencilSoft} data-stroke x1="0" y1="560" x2="1200" y2="560" />
      </svg>

      <div className={`container ${styles.inner}`}>
        <p className={styles.eyebrow} data-hero>{studioLine}</p>

        <div className={styles.frameBox}>
          <svg className={styles.rough} data-rough viewBox="0 0 1000 400" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            <path className={sk.pencil} data-stroke d={roughRect(12, 12, 976, 376, 3, 2.2)} />
            <path className={sk.pencil} data-stroke d={roughRect(18, 17, 964, 366, 9, 1.4)} style={{ opacity: 0.55 }} />
          </svg>
          <span className={styles.clean} data-clean aria-hidden="true"><i /><i /><i /><i /></span>

          <h1 id="hero-title" className={styles.title}>
            {WORDS_BEFORE.map((w) => <span key={w}><span className={styles.w}><span className={styles.wi} data-word>{w}</span></span>{" "}</span>)}
            <span className={styles.w}>
              <span className={styles.wi} data-word>
                <span className="sr-only">idea</span>
                <span className={styles.rot} data-rot aria-hidden="true">
                  {ideas.map((word, i) => <span className={`${styles.rotWord} ${i === 0 ? styles.rotFirst : ""}`} data-rot-word key={word}>{word}</span>)}
                </span>
              </span>
            </span>
            {WORDS_AFTER.map((w) => <span key={w}>{" "}<span className={styles.w}><span className={styles.wi} data-word>{w}</span></span></span>)}
          </h1>
        </div>

        <p className={styles.sub} data-hero>Websites, online ordering, booking, payments, and everything else you need to launch and grow. Built by me, owned by you.</p>
        <div className={styles.actions} data-hero>
          <Magnetic><a className="btn" href={cta.href} data-cursor="grow" data-hero-btn>{cta.label} <Arrow /></a></Magnetic>
          <Magnetic><a className="btn btn-secondary" href="#idea-to-reality" onClick={onHow} data-cursor="grow" data-hero-btn>See how it works</a></Magnetic>
        </div>
      </div>
    </section>
  );
}
