"use client";

import { useEffect, useRef, useState } from "react";

import { site } from "../data/site";
import styles from "./extras.module.css";

/**
 * The parts of a post that need a script, all optional:
 * - a thin reading-progress line under the header;
 * - a "Copy" button on the email template, which copies its text;
 * - the current step marked in the side list as you read;
 * - on phones, a "Need help? Text me" pill that appears once you're into
 *   the post and steps aside over the closing card (the site's bottom bar
 *   stands down on posts, so there's one thing at the bottom).
 */
export default function PostExtras() {
  const bar = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState<"hidden" | "shown">("hidden");

  // Reading progress.
  useEffect(() => {
    const el = bar.current;
    const article = el?.closest("article");
    if (!el || !article) return;
    let raf = 0;
    const paint = () => {
      raf = 0;
      const r = article.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 1;
      el.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(paint); };
    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
  }, []);

  // Copy button on the email template; the site's bottom bar stands down.
  useEffect(() => {
    document.body.dataset.post = "1";
    const cap = document.querySelector<HTMLElement>("figure.email figcaption");
    const quote = document.querySelector<HTMLElement>("figure.email blockquote");
    let btn: HTMLButtonElement | null = null;
    if (cap && quote && navigator.clipboard) {
      btn = document.createElement("button");
      btn.type = "button";
      btn.className = "copy";
      btn.textContent = "Copy";
      btn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(quote.innerText.trim());
          btn!.textContent = "Copied";
          btn!.dataset.done = "1";
          window.setTimeout(() => { if (btn) { btn.textContent = "Copy"; delete btn.dataset.done; } }, 2000);
        } catch { btn!.textContent = "Select and copy"; }
      });
      cap.appendChild(btn);
    }
    return () => { delete document.body.dataset.post; btn?.remove(); };
  }, []);

  // The current step in the side list, and the phone pill's timing.
  useEffect(() => {
    const steps = Array.from(document.querySelectorAll<HTMLElement>("h2.step"));
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('nav[aria-label="In this post"] a'));
    const mark = (id: string) => links.forEach((a) => { if (a.getAttribute("href") === `#${id}`) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
    const io = new IntersectionObserver((entries) => {
      const top = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (top) mark(top.target.id);
    }, { rootMargin: "-20% 0px -65% 0px" });
    steps.forEach((h) => io.observe(h));

    // The pill: once the first step has reached the middle of the screen,
    // and not while the closing card is in view. Read on scroll, so a jump
    // straight down the page counts too.
    const first = steps[0], cta = document.getElementById("help");
    let raf = 0;
    const place = () => {
      raf = 0;
      const past = first ? first.getBoundingClientRect().top < window.innerHeight * 0.5 : false;
      const over = cta ? cta.getBoundingClientRect().top < window.innerHeight * 0.9 && cta.getBoundingClientRect().bottom > 0 : false;
      setPill(past && !over ? "shown" : "hidden");
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(place); };
    place();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { io.disconnect(); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
  }, []);

  return (
    <>
      <div className={styles.progress} aria-hidden="true"><div ref={bar} /></div>
      <a className={styles.pill} href={site.smsHref} data-track="blog-text" data-state={pill} aria-label={`Need help? Text me at ${site.phone}`}>
        <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 2.5h12a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H6l-3.5 3v-3H2a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
        Need help? Text me
      </a>
    </>
  );
}
