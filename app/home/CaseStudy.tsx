"use client";

import { useEffect, useRef } from "react";

import { caseStudy } from "../data/caseStudy";
import Magnetic from "../motion/Magnetic";
import { gsap, ScrollTrigger, isFinePointerDesktop, prefersReducedMotion } from "../motion/gsap";
import styles from "./home.module.css";

function Arrow() {
  return (
    <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
      <path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

const src = (key: string, size: "desktop" | "mobile", ext: "avif" | "webp") => `/common-ground/${key}-${size}.${ext}`;

/** A real capture, AVIF with a WebP fallback. `art` swaps in the phone
    capture below 48rem and the desktop one above it. */
function Shot({ k, alt, art }: { k: string; alt: string; art: boolean }) {
  return (
    <picture>
      {art ? <source media="(max-width: 47.99rem)" type="image/avif" srcSet={src(k, "mobile", "avif")} /> : null}
      {art ? <source media="(max-width: 47.99rem)" type="image/webp" srcSet={src(k, "mobile", "webp")} /> : null}
      <source type="image/avif" srcSet={src(k, "desktop", "avif")} />
      <img src={src(k, "desktop", "webp")} alt={alt} width={1600} height={1000} loading="lazy" decoding="async" />
    </picture>
  );
}

/**
 * The signature moment. On desktop with a fine pointer a large browser
 * frame pins while the page scrolls, and steps through the real screens
 * (home, the six paths, "I feel overwhelmed") with a gentle scale and
 * crossfade while the caption beside it changes. On touch it is a vertical
 * stack of screens with the site's usual reveal; with reduced motion, a
 * static stack. Without JS it reads the same as the stack.
 */
export default function CaseStudy() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion() || !isFinePointerDesktop()) return;
    el.dataset.pinned = "";
    const ctx = gsap.context(() => {
      const stage = el.querySelector<HTMLElement>("[data-stage]")!;
      const device = el.querySelector<HTMLElement>("[data-device]")!;
      const layers = gsap.utils.toArray<HTMLElement>("[data-layer]", el);
      const steps = gsap.utils.toArray<HTMLElement>("[data-walk-step]", el);

      // The frame holds still while the captions scroll past it.
      ScrollTrigger.create({ trigger: stage, start: "center center", endTrigger: steps[steps.length - 1], end: "center center", pin: true, pinSpacing: false });
      // It settles into place as it arrives.
      gsap.fromTo(device, { scale: 0.9 }, { scale: 1, ease: "none", scrollTrigger: { trigger: stage, start: "top bottom", end: "center center", scrub: true } });

      let current = -1;
      const show = (i: number) => {
        if (i === current) return;
        current = i;
        layers.forEach((layer, j) => {
          gsap.to(layer, { autoAlpha: j === i ? 1 : 0, scale: j === i ? 1 : 1.035, duration: 0.7, ease: "power2.out", overwrite: true });
        });
        steps.forEach((step, j) => step.classList.toggle(styles.walkActive, j === i));
      };
      gsap.set(layers, { autoAlpha: 0, scale: 1.035 });
      steps.forEach((step, i) => {
        ScrollTrigger.create({ trigger: step, start: "top 55%", end: "bottom 55%", onEnter: () => show(i), onEnterBack: () => show(i) });
      });
      show(0);
    }, el);
    return () => { ctx.revert(); delete el.dataset.pinned; ScrollTrigger.refresh(); };
  }, []);

  const { screens } = caseStudy;

  return (
    <section className={`${styles.case} world-clinic tinted`} id="common-ground" ref={root} aria-labelledby="case-title">
      <div className="container">
        <div className={styles.caseHead}>
          <p className="label"><b>02</b> {caseStudy.label}</p>
          <h2 id="case-title" className="display-l">{caseStudy.title}</h2>
        </div>

        <dl className={styles.caseFacts} data-reveal-group>
          <div data-reveal>
            <dt>The problem</dt>
            <dd>{caseStudy.problem}</dd>
          </div>
          <div data-reveal>
            <dt>What I built</dt>
            <dd>{caseStudy.built}</dd>
          </div>
        </dl>

        <div className={styles.walk}>
          {/* Desktop only: one frame, three layered screens. Hidden (and so
              never fetched) until the script turns pinning on. */}
          <div className={styles.stage} data-stage>
            <div className={styles.device} data-device data-cursor="view">
              <div className={styles.deviceBar} aria-hidden="true"><i /><i /><i /><span>commongroundautism.org</span></div>
              <div className={styles.screen}>
                {screens.map((s) => (
                  <div className={styles.layer} data-layer key={s.key}>
                    <Shot k={s.key} alt={s.alt} art={false} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <ol className={styles.walkSteps}>
            {screens.map((s, i) => (
              <li className={styles.walkStep} key={s.key} data-walk-step>
                <figure className={styles.walkFigure} data-reveal>
                  <div className={styles.walkShot} data-cursor="view">
                    <Shot k={s.key} alt={s.alt} art />
                  </div>
                  <figcaption className={styles.walkCaption}>
                    <span className={styles.walkN}>{String(i + 1).padStart(2, "0")}</span>
                    <span className={styles.walkText}>{s.caption}</span>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ol>
        </div>

        <div className={styles.caseEnd} data-reveal>
          <p className={styles.outcome}>{caseStudy.outcome}</p>
          <div className={styles.caseActions}>
            <Magnetic>
              <a className="btn btn-ember" href={caseStudy.demoUrl} target="_blank" rel="noopener noreferrer" data-cursor="grow">
                See the live demo <Arrow /><span className="sr-only"> (opens in a new tab)</span>
              </a>
            </Magnetic>
            <Magnetic>
              <a className="btn btn-secondary" href="/family-resource-hub" data-cursor="grow">For clinics</a>
            </Magnetic>
          </div>
        </div>
      </div>
    </section>
  );
}
