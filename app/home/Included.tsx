"use client";

import { useSyncExternalStore, type ReactNode } from "react";

const query = "(min-width: 64rem)";
const subscribe = (cb: () => void) => { const mq = window.matchMedia(query); mq.addEventListener("change", cb); return () => mq.removeEventListener("change", cb); };

/**
 * A price card's "what's included" list. Always open on desktop and without
 * JavaScript; on phones, only the first card's list is open and the others
 * sit behind a native summary, so the three cards stay short.
 */
export default function Included({ open, children }: { open: boolean; children: ReactNode }) {
  const wide = useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => true);
  return (
    <details open={wide || open}>
      <summary>What&rsquo;s included</summary>
      {children}
    </details>
  );
}
