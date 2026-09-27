"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

import { gsap, prefersReducedMotion } from "./gsap";
import styles from "./PageTransition.module.css";

/**
 * An ink wipe between routes, under 600ms end to end. Internal link clicks
 * are intercepted: the wipe covers the page (260ms), the route changes, and
 * the wipe clears on the new page (300ms). With reduced motion, or for
 * modified clicks, hashes, downloads and external links, nothing intercepts.
 */
export default function PageTransition() {
  const veil = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const pending = useRef(false);

  // Clear the veil whenever a new route has rendered.
  useEffect(() => {
    const el = veil.current;
    if (!el) return;
    if (!pending.current) return;
    pending.current = false;
    window.scrollTo(0, 0);
    gsap.to(el, { yPercent: -100, duration: 0.3, ease: "power3.inOut", onComplete: () => { gsap.set(el, { yPercent: 100 }); } });
  }, [pathname]);

  useEffect(() => {
    const el = veil.current;
    if (!el || prefersReducedMotion()) return;
    gsap.set(el, { yPercent: 100 });
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href") || "";
      if (!href.startsWith("/") || href.startsWith("//") || a.target === "_blank" || a.hasAttribute("download")) return;
      const [path] = href.split("#");
      if (href.includes("#") && (path === "" || path === pathname)) return;
      if (path === pathname) return;
      e.preventDefault();
      pending.current = true;
      gsap.to(el, { yPercent: 0, duration: 0.26, ease: "power3.in", onComplete: () => router.push(href) });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [pathname, router]);

  return <div ref={veil} className={styles.veil} aria-hidden="true" />;
}
