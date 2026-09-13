"use client";

import { useEffect } from "react";

/**
 * Finishes the browser's own scroll to a #hash on a fresh page load.
 *
 * The site sets scroll-behavior: smooth, so on a load like /#pricing the
 * browser starts a smooth scroll toward the target and hydration interrupts
 * it a few pixels in — the page ends up at the top with the hash in the URL
 * and nothing to show for it. This matters because /pricing now redirects
 * to /#pricing, so every old link and search result depends on it.
 *
 * Once the window has loaded and layout has settled, this scrolls to the
 * hash target instantly (the reader has not scrolled yet, so there is
 * nothing to animate from), honouring the target's scroll-margin-top. It
 * does nothing when there is no hash, when the target does not exist, or if
 * the reader has already scrolled, and it never runs on a hashchange —
 * in-page links are the browser's job and work.
 */
export default function HashScroll() {
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;

    let cancelled = false;
    let raf = 0;

    const jump = () => {
      if (cancelled) return;
      const target = document.getElementById(decodeURIComponent(hash));
      if (!target) return;
      // Two frames: one for hydration to commit, one for fonts and images
      // above the target to take their final size.
      raf = requestAnimationFrame(() => {
        raf = requestAnimationFrame(() => {
          if (cancelled) return;
          target.scrollIntoView({ behavior: "auto", block: "start" });
        });
      });
    };

    if (document.readyState === "complete") jump();
    else window.addEventListener("load", jump, { once: true });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("load", jump);
    };
  }, []);

  return null;
}
