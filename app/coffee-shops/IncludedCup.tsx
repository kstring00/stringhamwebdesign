"use client";

import { useEffect, useRef } from "react";

import { CoffeeCup, type CupHandle } from "../motifs/Motifs";
import { gsap, ScrollTrigger, isFinePointerDesktop, prefersReducedMotion } from "../motion/gsap";
import styles from "../niche.module.css";

const INCLUDED = [
  { title: "Order ahead", body: "that connects to the system you already use: Clover, Toast, or Square." },
  { title: "Found on Google,", body: "so “coffee near me” searches land on you with the right hours and locations." },
  { title: "A menu you can update", body: "without calling anyone." },
  { title: "Events and seasonal drops", body: "with a home of their own, like DJ nights, new flavors, and pop-ups." },
  { title: "An email and text list,", body: "so regulars hear first." },
];

/**
 * What's included, as a numbered editorial list beside a big line-drawn
 * cup. The cup fills as the list scrolls past (its level is the scroll
 * progress) and steams once it's full. Desktop pins the cup beside the
 * list; phones keep it in a slim sticky strip above the list. With reduced
 * motion the cup is simply full and steaming.
 */
export default function IncludedCup() {
  const root = useRef<HTMLElement>(null);
  const cup = useRef<CupHandle>(null);

  useEffect(() => {
    const el = root.current;
    const fill = cup.current?.fill;
    const steam = cup.current?.steam;
    if (!el || !fill || !steam || prefersReducedMotion()) return;
    el.dataset.animate = "";
    const list = el.querySelector<HTMLElement>("[data-list]")!;
    const stage = el.querySelector<HTMLElement>("[data-cupstage]")!;
    const items = gsap.utils.toArray<HTMLElement>("[data-item]", el);
    const ctx = gsap.context(() => {
      gsap.set(fill, { scaleY: 0.02 });
      gsap.set(steam, { autoAlpha: 0 });
      const full = (p: number) => {
        gsap.to(steam, { autoAlpha: p > 0.97 ? 1 : 0, duration: 0.5, overwrite: true });
        items.forEach((item, i) => item.classList.toggle(styles.itemOn, p >= i / items.length));
      };
      gsap.to(fill, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: { trigger: list, start: "top 60%", end: "bottom 55%", scrub: 0.4, onUpdate: (self) => full(self.progress) },
      });
      if (isFinePointerDesktop()) {
        ScrollTrigger.create({ trigger: stage, start: "center center", endTrigger: list, end: "bottom center", pin: true, pinSpacing: false });
      }
      full(0);
    }, el);
    return () => { ctx.revert(); delete el.dataset.animate; items.forEach((i) => i.classList.remove(styles.itemOn)); };
  }, []);

  return (
    <section className={styles.section} ref={root} aria-labelledby="included-title">
      <div className="container">
        <div className={styles.sectionHead}>
          <p className="label"><b>02</b> What&rsquo;s included</p>
          <h2 id="included-title" className="display-m">Everything a morning regular needs.</h2>
        </div>
        <div className={styles.included}>
          <div className={styles.cupStage} data-cupstage>
            <CoffeeCup ref={cup} level={1} className={styles.bigCup} />
          </div>
          <ol className={styles.list} data-list>
            {INCLUDED.map((item, i) => (
              <li className={styles.item} key={item.title} data-item>
                <span className={styles.itemN}>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className={styles.itemTitle}>{item.title}</h3>
                  <p className={styles.itemBody}>{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
