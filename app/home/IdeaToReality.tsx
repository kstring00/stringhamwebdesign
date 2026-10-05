"use client";

import { useEffect, useRef } from "react";

import { drawStrokes, prepareStrokes } from "../motion/draw";
import { gsap, ScrollTrigger, isFinePointerDesktop, prefersReducedMotion } from "../motion/gsap";
import { hatch, roughArrow, roughCircle, roughLine, roughRect } from "../motifs/sketch";
import sk from "../motifs/sketch.module.css";
import styles from "./idea.module.css";

export const STAGES = [
  { n: "01", name: "Sketch", caption: "It starts as an idea." },
  { n: "02", name: "Plan", caption: "We plan what it needs to do." },
  { n: "03", name: "Build", caption: "I design and build it around you." },
  { n: "04", name: "Launch", caption: "It goes live, and it works." },
] as const;

/* ---------- the wireframe (1200 × 750) ---------- */

const W = 1200, H = 750;
type Box = [number, number, number, number];
const box: { hero: Box; btn: Box; cards: Box[] } = { hero: [660, 120, 460, 310], btn: [80, 370, 190, 54], cards: [[80, 500, 330, 190], [435, 500, 330, 190], [790, 500, 330, 190]] };

/** Stage 1: a pencil wireframe of a café site, one stroke per element. */
function SketchLayer() {
  return (
    <svg className={styles.layerSvg} data-sk viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <g className={sk.pencil}>
        <path data-stroke d={roughLine(0, 72, W, 72, 1)} />
        <path data-stroke d={roughCircle(70, 36, 17, 2)} />
        <path data-stroke d={roughLine(100, 36, 210, 36, 3)} />
        <path data-stroke d={roughLine(900, 36, 960, 36, 4) + roughLine(990, 36, 1050, 36, 5) + roughLine(1080, 36, 1130, 36, 6)} />
        <path data-stroke d={roughLine(80, 165, 590, 165, 7, 1.6)} style={{ strokeWidth: 2.2 }} />
        <path data-stroke d={roughLine(80, 215, 520, 215, 8, 1.6)} style={{ strokeWidth: 2.2 }} />
        <path data-stroke d={roughLine(80, 265, 360, 265, 9, 1.6)} style={{ strokeWidth: 2.2 }} />
        <path data-stroke d={roughLine(80, 315, 440, 315, 10)} />
        <path data-stroke d={roughLine(80, 338, 380, 338, 11)} />
        <path data-stroke d={roughRect(...box.btn, 12, 1.6)} />
        <path data-stroke d={roughRect(...box.hero, 13, 2)} />
        <path data-stroke d={hatch(box.hero[0] + 10, box.hero[1] + 10, box.hero[2] - 20, box.hero[3] - 20, 14, 46)} className={sk.pencilSoft} />
        {box.cards.map((c, i) => (
          <g key={i}>
            <path data-stroke d={roughRect(...c, 20 + i, 1.6)} />
            <path data-stroke d={roughLine(c[0] + 18, c[1] + 120, c[0] + 18 + 150 - i * 20, c[1] + 120, 30 + i)} />
            <path data-stroke d={roughLine(c[0] + 18, c[1] + 150, c[0] + 18 + 220 - i * 30, c[1] + 150, 40 + i)} />
          </g>
        ))}
      </g>
    </svg>
  );
}

/** Stage 2: labels and arrows on the sketch. */
function PlanLayer() {
  return (
    <svg className={styles.layerSvg} data-plan viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
      <g className={sk.ember}>
        <path data-stroke d={roughArrow(1010, 118, 1020, 52, 51)} />
        <path data-stroke d={roughArrow(300, 448, 275, 400, 52)} />
        <path data-stroke d={roughArrow(1040, 480, 985, 435, 53)} />
        <path data-stroke d={roughArrow(700, 730, 900, 700, 54)} />
      </g>
      <g className={sk.note}>
        <text data-note x="965" y="150">Menu</text>
        <text data-note x="300" y="478">Order button</text>
        <text data-note x="1050" y="500">Photos</text>
        <text data-note x="600" y="740">Contact</text>
      </g>
    </svg>
  );
}

/** Stages 3 and 4: the finished site, then the live one. */
function BuiltLayer() {
  return (
    <div className={styles.built} data-built aria-hidden="true">
      <div className={styles.siteNav}>
        <span className={styles.siteLogo}><i />Halfmoon Coffee</span>
        <span className={styles.siteLinks}><b>Menu</b><b>Hours</b><b>Contact</b></span>
      </div>
      <div className={styles.siteHero}>
        <div className={styles.siteCopy}>
          <p className={styles.siteH1}>Slow mornings, fast pickup.</p>
          <p className={styles.siteSub}>Order ahead and it&rsquo;s on the shelf when you walk in.</p>
          <span className={styles.siteBtn}>Order ahead</span>
        </div>
        <div className={styles.sitePhoto}><i /><i /></div>
      </div>
      <div className={styles.siteCards}>
        {["Menu", "Hours & location", "Contact"].map((c, i) => (
          <div className={styles.siteCard} key={c}><span className={styles.cardArt} data-art={i} /><b>{c}</b><span /></div>
        ))}
      </div>
    </div>
  );
}

function PhoneLayer() {
  return (
    <div className={styles.phone} data-phone aria-hidden="true">
      <div className={styles.phoneNav}><i />Halfmoon</div>
      <p className={styles.phoneH1}>Slow mornings, fast pickup.</p>
      <span className={styles.phoneBtn}>Order ahead</span>
      <div className={styles.phonePhoto}><i /></div>
    </div>
  );
}

/**
 * One browser frame with every layer stacked. `stage` (static, for the
 * vertical sequence and reduced motion) picks what CSS shows; without it the
 * frame reads as the finished, live site, and the script drives it.
 */
function Scene({ stage }: { stage?: number }) {
  return (
    <div className={styles.scene} data-scene data-stage={stage} data-cursor="view">
      <div className={styles.device}>
        <div className={styles.bar}>
          <i /><i /><i />
          <span className={styles.url}><svg width="10" height="12" viewBox="0 0 10 12" aria-hidden="true"><path d="M2 5V3.5a3 3 0 0 1 6 0V5" fill="none" stroke="currentColor" strokeWidth="1.2" /><rect x="1" y="5" width="8" height="6" rx="1" fill="currentColor" /></svg><b data-url>halfmooncoffee.com</b></span>
        </div>
        <div className={styles.screen}>
          <SketchLayer />
          <BuiltLayer />
          <PlanLayer />
        </div>
      </div>
      <PhoneLayer />
      <div className={styles.toast} data-toast aria-hidden="true">
        <i />
        <span><b>New order</b>Oat latte · pickup at 8:15</span>
      </div>
    </div>
  );
}

/**
 * Build the four-stage timeline for one scene. Labels mark each stage's
 * start; the whole thing is 4 units long, one per stage.
 */
function buildTimeline(scene: HTMLElement) {
  const sketch = scene.querySelector<SVGSVGElement>("[data-sk]")!;
  const plan = scene.querySelector<SVGSVGElement>("[data-plan]")!;
  const built = scene.querySelector<HTMLElement>("[data-built]")!;
  const phone = scene.querySelector<HTMLElement>("[data-phone]")!;
  const toast = scene.querySelector<HTMLElement>("[data-toast]")!;
  const url = scene.querySelector<HTMLElement>("[data-url]")!;
  const notes = plan.querySelectorAll("[data-note]");
  const skStrokes = prepareStrokes(sketch);
  const planStrokes = prepareStrokes(plan);

  gsap.set(built, { clipPath: "inset(0 0 100% 0)" });
  gsap.set(notes, { autoAlpha: 0, y: 6 });
  gsap.set(plan, { autoAlpha: 1 });
  gsap.set(phone, { xPercent: 40, yPercent: 24, rotate: 6, autoAlpha: 0 });
  gsap.set(toast, { autoAlpha: 0, y: -14, scale: 0.92 });
  gsap.set(url, { autoAlpha: 0 });

  const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });
  tl.addLabel("sketch", 0)
    .add(drawStrokes(skStrokes, { duration: 0.55, stagger: { each: 0.03 }, ease: "power1.inOut" }), 0)
    .addLabel("plan", 1)
    .add(drawStrokes(planStrokes, { duration: 0.28, stagger: 0.14, ease: "power1.inOut" }), 1.05)
    .to(notes, { autoAlpha: 1, y: 0, duration: 0.2, stagger: 0.14 }, 1.15)
    .addLabel("build", 2)
    .to(notes, { autoAlpha: 0, duration: 0.15 }, 2)
    .to(planStrokes, { autoAlpha: 0, duration: 0.15 }, 2)
    .to(built, { clipPath: "inset(0 0 0% 0)", duration: 0.85, ease: "power2.inOut" }, 2.05)
    .to(sketch, { autoAlpha: 0.15, duration: 0.5 }, 2.4)
    .addLabel("launch", 3)
    .to(url, { autoAlpha: 1, duration: 0.2 }, 3.05)
    .to(phone, { xPercent: 0, yPercent: 0, rotate: 0, autoAlpha: 1, duration: 0.6, ease: "power3.out" }, 3.15)
    .to(toast, { autoAlpha: 1, y: 0, scale: 1, duration: 0.3, ease: "back.out(1.8)" }, 3.6)
    .addLabel("end", 4);
  return tl;
}

/**
 * The signature section. On desktop with a fine pointer one browser frame
 * pins while the page scrolls through four stages: a pencil wireframe draws
 * itself, plan labels land on it, the finished site wipes down over the
 * sketch, then the URL goes live, a phone slides in and an order arrives.
 * Touch and reduced motion get the four stages as a vertical sequence (the
 * former animated as each comes into view, the latter static).
 */
export default function IdeaToReality() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const pinned = isFinePointerDesktop();
    el.dataset.mode = pinned ? "pinned" : "stack";
    const ctx = gsap.context(() => {
      if (pinned) {
        const scene = el.querySelector<HTMLElement>("[data-pinned-scene] [data-scene]")!;
        const items = gsap.utils.toArray<HTMLElement>("[data-stage-item]", el);
        const tl = buildTimeline(scene);
        let current = -1;
        const light = (p: number) => {
          const i = Math.min(3, Math.floor(p * 4 + 0.02));
          if (i === current) return;
          current = i;
          items.forEach((it, j) => it.classList.toggle(styles.stageOn, j === i));
        };
        ScrollTrigger.create({
          trigger: el.querySelector("[data-pin]"),
          start: "top top",
          end: "+=340%",
          pin: true,
          scrub: 0.7,
          animation: tl,
          onUpdate: (self) => light(self.progress),
        });
        light(0);
      } else {
        const scenes = gsap.utils.toArray<HTMLElement>("[data-stack] [data-scene]", el);
        scenes.forEach((scene, i) => {
          const tl = buildTimeline(scene);
          tl.seek(STAGES[i].name.toLowerCase());
          ScrollTrigger.create({
            trigger: scene,
            start: "top 75%",
            once: true,
            onEnter: () => tl.tweenTo(i === 3 ? "end" : STAGES[i + 1].name.toLowerCase(), { duration: 1.6, ease: "power1.inOut" }),
          });
        });
      }
    }, el);
    return () => { ctx.revert(); delete el.dataset.mode; };
  }, []);

  return (
    <section className={styles.section} id="idea-to-reality" ref={root} aria-labelledby="idea-title">
      <div className={styles.pinBox} data-pin>
        <div className={`container ${styles.grid}`}>
          <div className={styles.side}>
            <p className="label"><b>01</b> Idea → Reality</p>
            <h2 id="idea-title" className={`display-m ${styles.title}`}>From a sketch to a site that takes orders.</h2>
            <ol className={styles.stages}>
              {STAGES.map((s) => (
                <li className={styles.stage} key={s.n} data-stage-item>
                  <span className={styles.stageN}>{s.n}</span>
                  <span className={styles.stageName}>{s.name}</span>
                  <span className={styles.stageCaption}>{s.caption}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Desktop: one frame, driven by scroll. */}
          <div className={styles.pinnedScene} data-pinned-scene>
            <Scene />
          </div>
        </div>
      </div>

      {/* Touch and reduced motion: the four stages in a column. */}
      <div className={`container ${styles.stack}`} data-stack>
        {STAGES.map((s, i) => (
          <figure className={styles.stackItem} key={s.n}>
            <Scene stage={i} />
            <figcaption className={styles.stackCaption}>
              <span className={styles.stageN}>{s.n}</span>
              <span className={styles.stageName}>{s.name}</span>
              <span className={styles.stageCaption}>{s.caption}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
