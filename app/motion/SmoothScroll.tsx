"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { ScrollSmoother, ScrollTrigger, isFinePointerDesktop, prefersReducedMotion } from "./gsap";

/**
 * ScrollSmoother on desktop with a fine pointer only. Touch devices keep
 * native scrolling; reduced motion gets none of it. The wrapper/content
 * elements live in the layout so the markup is identical either way.
 */
export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion() || !isFinePointerDesktop()) return;
    const smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.1,
      effects: true,
      normalizeScroll: false,
    });
    // Refresh after fonts and images settle so pinned sections measure right.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh, { once: true });
    document.fonts?.ready.then(refresh);
    return () => {
      window.removeEventListener("load", refresh);
      smoother.kill();
    };
  }, [pathname]);

  return null;
}
