"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { headerNav } from "./data/nav";
import styles from "./Header.module.css";

const DELTA = 6;

function Arrow() {
  return (
    <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
      <path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastY = useRef(0);
  const active = pathname.startsWith("/work")
    ? "/work"
    : pathname.startsWith("/portal")
      ? "/portal"
      : pathname === "/about"
        ? "/about"
        : pathname === "/pricing"
          ? "/pricing"
          : pathname === "/"
            ? "/"
            : "";

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    lastY.current = window.scrollY;
    let queued = false;

    const update = () => {
      queued = false;
      const y = window.scrollY;
      const delta = y - lastY.current;

      if (menuOpen || y < 96 || reduced.matches) setHidden(false);
      else if (delta > DELTA) setHidden(true);
      else if (delta < -DELTA) setHidden(false);

      lastY.current = y;
    };

    const onScroll = () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const onFocusCapture = () => setHidden(false);

  const onNavPointerMove = (event: React.PointerEvent<HTMLAnchorElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
    event.currentTarget.style.setProperty("--mouse-x", `${x}%`);
  };

  return (
    <header
      className={`${styles.masthead}${hidden ? ` ${styles.hidden}` : ""}`}
      onFocusCapture={onFocusCapture}
    >
      <div className={styles.bar}>
        <a className={styles.brand} href="/" aria-label="Kyle Stringham, home">
          <span className={styles.monogramShell} aria-hidden="true">
            <span className={styles.doveMark} />
            <span className={styles.monogram}>KS</span>
          </span>
          <span className={styles.brandRule} aria-hidden="true" />
          <span className={styles.brandCopy}>
            <span className={styles.name}>Kyle Stringham</span>
            <span className={styles.role}>Web design &amp; development</span>
          </span>
        </a>

        <nav
          className={`${styles.nav}${menuOpen ? ` ${styles.navOpen}` : ""}`}
          id="site-primary-nav"
          aria-label="Primary navigation"
        >
          <div className={styles.navLinks}>
            {headerNav.map((item) => {
              const isActive = active === item.href;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className={`${styles.navLink}${isActive ? ` ${styles.active}` : ""}`}
                  aria-current={isActive ? "page" : undefined}
                  onPointerMove={onNavPointerMove}
                  onClick={() => setMenuOpen(false)}
                >
                  <span className={styles.navTextWrap}>
                    <span className={styles.navText}>{item.label}</span>
                    <span className={styles.navTextGhost} aria-hidden="true">
                      {item.label}
                    </span>
                  </span>
                </a>
              );
            })}
          </div>

          <a
            href="/portal"
            className={`${styles.portalButton} ${styles.portalMobile}${active === "/portal" ? ` ${styles.portalActive}` : ""}`}
            aria-current={active === "/portal" ? "page" : undefined}
            onClick={() => setMenuOpen(false)}
          >
            Portal
          </a>
        </nav>

        <div className={styles.end}>
          <span className={styles.endRule} aria-hidden="true" />
          <a
            href="/portal"
            className={`${styles.portalButton} ${styles.portalDesktop}${active === "/portal" ? ` ${styles.portalActive}` : ""}`}
            aria-current={active === "/portal" ? "page" : undefined}
          >
            Portal
          </a>
          <a className={styles.getStarted} href="/quote">
            <span>Start a Project</span>
            <span className={styles.arrowShell} aria-hidden="true">
              <Arrow />
            </span>
          </a>
          <button
            className={styles.menuToggle}
            type="button"
            aria-expanded={menuOpen}
            aria-controls="site-primary-nav"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            onClick={() => {
              setHidden(false);
              setMenuOpen((current) => !current);
            }}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
