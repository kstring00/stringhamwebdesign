"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cta, navLinks } from "../data/nav";
import LiquidNavbar, { NimbusIcons, type LiquidNavItem } from "./LiquidNavbar";
import Logo from "./Logo";
import s from "./SiteHeader.module.css";

const ICONS = { home: NimbusIcons.home, work: NimbusIcons.grid, pricing: NimbusIcons.tag, handoff: NimbusIcons.key, checkup: NimbusIcons.pulse, about: NimbusIcons.user } as const;

/** The nav's items: the home icon glows, the rest pop. */
const ITEMS: LiquidNavItem[] = navLinks.map((l) => ({ label: l.label, href: l.href, icon: ICONS[l.key], fx: l.key === "home" ? "glow" : "pop" }));

/** The item for a path: the page itself, or none (the blog, the terms, and so on). */
const pageIndex = (pathname: string) => navLinks.findIndex((l) => !("section" in l) && (l.href === "/" ? pathname === "/" : pathname === l.href || pathname.startsWith(`${l.href}/`)));

/**
 * The site's header: the liquid nav, always at the top of the screen.
 *
 * On the home page, over the hero, it is the pill alone, centered, with no
 * logo beside it (the hero carries the name). Once the hero has scrolled
 * away, and on every other page, the logo sits to its left and the one
 * action to its right (from 900px up; on a phone it stays the pill alone,
 * and the bottom bar carries the call and demo buttons).
 *
 * The drop sits on the current page's item. On the home page it follows the
 * scroll to Pricing and About, which are sections there, not pages; only a
 * real page gets aria-current="page".
 */
export default function SiteHeader() {
  const pathname = usePathname();
  const home = pathname === "/";
  const [past, setPast] = useState(false);
  const [section, setSection] = useState<string | null>(null);

  useEffect(() => {
    if (!home) return;
    const hero = document.querySelector("[data-hero]");
    // Past the hero: its bottom edge has gone under the header.
    const heroIo = hero ? new IntersectionObserver(([e]) => setPast(!e.isIntersecting), { rootMargin: "-76px 0px 0px 0px" }) : null;
    if (hero && heroIo) heroIo.observe(hero);
    // Which home section holds the middle of the screen.
    const inView = new Set<string>();
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) inView.add(e.target.id); else inView.delete(e.target.id); });
      setSection(navLinks.find((l) => "section" in l && inView.has(l.section))?.key ?? null);
    }, { rootMargin: "-45% 0px -45% 0px" });
    navLinks.forEach((l) => { const el = "section" in l ? document.getElementById(l.section) : null; if (el) spy.observe(el); });
    return () => { heroIo?.disconnect(); spy.disconnect(); setPast(false); setSection(null); };
  }, [home]);

  const page = pageIndex(pathname);
  const active = home && section ? navLinks.findIndex((l) => l.key === section) : page;
  const pinned = !home || past;

  return (
    <>
    <header className={s.bar} data-state={pinned ? "pinned" : "hero"} data-site-header>
      <Link className={s.logo} href="/" aria-label="Stringham Web Design, home" tabIndex={pinned ? undefined : -1}>
        <Logo className={s.logoImg} eager />
      </Link>
      <LiquidNavbar className={s.nav} items={ITEMS} active={active} page={page} wake={pathname} tone="dark" sound={false} />
      <Link className={s.cta} href={cta.href} data-track="cta" data-location="header" tabIndex={pinned ? undefined : -1}>
        {cta.nav}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
      </Link>
    </header>
    {/* Every page but the home page starts under the header, not behind it. */}
    {home ? null : <div className={s.spacer} aria-hidden="true" />}
    </>
  );
}
