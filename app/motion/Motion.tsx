"use client";

import { lazy, Suspense, useEffect, useState } from "react";

const Effects = lazy(() => import("./Effects"));

/**
 * Loads the page's optional motion (the scroll-in rise, the buttons' pull)
 * only after the page has loaded and the browser is idle. Nothing a visitor
 * needs depends on it: every page is complete and still without it. Keeping
 * it, and the animation library it uses, out of the first load is what lets
 * the hero's picture and words arrive first.
 */
export default function Motion() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    let idle = 0, timer = 0;
    const go = () => setOn(true);
    const ric = (window as Window & { requestIdleCallback?: Window["requestIdleCallback"] }).requestIdleCallback;
    const whenIdle = () => {
      if (ric) idle = ric(go, { timeout: 2500 });
      else timer = window.setTimeout(go, 600);
    };
    if (document.readyState === "complete") whenIdle();
    else window.addEventListener("load", whenIdle, { once: true });
    return () => {
      window.removeEventListener("load", whenIdle);
      if (idle) window.cancelIdleCallback?.(idle);
      window.clearTimeout(timer);
    };
  }, []);

  return on ? <Suspense fallback={null}><Effects /></Suspense> : null;
}
