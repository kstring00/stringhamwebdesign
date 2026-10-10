"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/** The field's code is its own chunk, never rendered on the server. */
const BuildField = dynamic(() => import("./BuildField"), { ssr: false });

/** The GrowthGains original, for side-by-side comparison: /?field=blue */
const BLUE = { baseColor: "#8FA5D8", activeColor: "#3568F6", maxAlpha: 0.85 };

/**
 * Mounts the hero's Build Field once the browser is idle after first paint
 * (600 ms at the latest), so it never competes with the headline for LCP.
 * Without JavaScript nothing renders here and the hero is unchanged.
 */
export default function BuildFieldMount({ activeColor }: { activeColor?: string } = {}) {
  const [mode, setMode] = useState<"" | "default" | "blue">("");

  useEffect(() => {
    const start = () => setMode(new URLSearchParams(window.location.search).get("field") === "blue" ? "blue" : "default");
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(start, { timeout: 600 });
      return () => window.cancelIdleCallback(id);
    }
    const t = window.setTimeout(start, 600);
    return () => window.clearTimeout(t);
  }, []);

  if (!mode) return null;
  return mode === "blue" ? <BuildField {...BLUE} /> : <BuildField activeColor={activeColor} />;
}
