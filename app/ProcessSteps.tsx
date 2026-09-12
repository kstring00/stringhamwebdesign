"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

import { processIntro, processSteps } from "./data/process";
import styles from "./ProcessSteps.module.css";

type ProcessStepsProps = {
  /** Rendered as the section heading. */
  heading?: string;
  /** Drop the section chrome when the page already supplies its own heading. */
  bare?: boolean;
  /** Which step is open on first render. Null opens none. */
  initialOpen?: number | null;
  id?: string;
  /** Homepage gets the full horizontal process treatment. */
  variant?: "default" | "home";
};

function StaticDove() {
  return (
    <svg
      className={styles.homeDove}
      viewBox="0 0 420 330"
      aria-hidden="true"
      focusable="false"
    >
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="230" cy="163" r="118" stroke="rgba(160,131,72,.22)" strokeWidth="1" />
        <circle cx="230" cy="163" r="82" stroke="rgba(160,131,72,.16)" strokeWidth="1" />

        <path
          d="M244 196c26-5 48-20 64-46 12-20 25-30 42-30 15 0 28 7 35 19-12-2-23 2-31 11-10 11-17 27-23 44-10 26-30 44-59 51-23 6-45 0-61-16 11-8 22-19 33-33Z"
          stroke="#0d1b26"
          strokeWidth="2"
        />
        <path d="M349 120c13-10 29-10 42-2 8 5 14 12 17 21-10-4-20-3-28 3" stroke="#0d1b26" strokeWidth="2" />
        <path d="M407 139l26 8-24 8" stroke="#0d1b26" strokeWidth="2" />
        <circle cx="384" cy="128" r="2.5" fill="#0d1b26" stroke="none" />

        <path d="M252 196c-41-50-66-105-66-177 24 30 47 59 68 91 15 23 27 46 35 69" stroke="#0d1b26" strokeWidth="1.6" />
        <path d="M241 200c-58-36-101-88-122-158 34 27 67 54 94 87 16 19 28 39 37 58" stroke="#a08348" strokeWidth="1.6" />
        <path d="M230 207c-70-19-126-55-164-112 42 18 82 37 116 64 19 15 33 30 44 44" stroke="rgba(66,91,111,.55)" strokeWidth="1.35" />
        <path d="M224 216c-75-1-139-20-194-60 48 2 93 8 132 22 27 10 48 23 62 35" stroke="#a08348" strokeWidth="1.35" />
        <path d="M224 225c-70 18-134 17-198-4 47-10 92-15 133-14 28 1 50 7 65 18" stroke="rgba(66,91,111,.42)" strokeWidth="1.25" />

        <path d="M266 245c-17 31-41 58-73 80 14-31 24-59 29-84" stroke="#0d1b26" strokeWidth="1.6" />
        <path d="M253 246c-29 40-65 68-112 85 24-31 41-60 51-89" stroke="#a08348" strokeWidth="1.5" />
        <path d="M240 242c-41 35-89 54-144 58 33-23 60-47 78-72" stroke="rgba(66,91,111,.5)" strokeWidth="1.3" />
        <path d="M211 229c-41 18-87 26-140 18 40-13 75-29 103-49" stroke="#0d1b26" strokeWidth="1.5" />
        <path d="M217 236c-45 32-96 49-155 49 42-21 78-44 106-72" stroke="#a08348" strokeWidth="1.35" />

        <path d="M431 147c12-9 22-21 29-35" stroke="#a08348" strokeWidth="2" />
        <path d="M449 126c0-12 5-21 14-28 1 11-4 20-14 28Z" fill="#a08348" stroke="none" />
        <path d="M456 116c8-9 16-12 24-11-4 10-12 14-24 11Z" fill="#a08348" stroke="none" />
        <path d="M460 108c0-10 4-18 12-25 2 10-2 19-12 25Z" fill="#a08348" stroke="none" />
      </g>
    </svg>
  );
}

export default function ProcessSteps({
  heading = "How this goes.",
  bare = false,
  initialOpen = 0,
  id = "process",
  variant = "default",
}: ProcessStepsProps) {
  const [openStep, setOpenStep] = useState<number | null>(initialOpen);
  const [entered, setEntered] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const baseId = useId();

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setEntered(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setEntered(true);
      },
      { threshold: 0.12 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const toggle = (index: number) => {
    setOpenStep((current) => (current === index ? null : index));
  };

  const rows = (
    <ol className={styles.steps}>
      {processSteps.map((step, index) => {
        const open = openStep === index;
        const panelId = `${baseId}-panel-${step.number}`;
        const buttonId = `${baseId}-step-${step.number}`;

        return (
          <li
            className={`${styles.step} ${open ? styles.stepOpen : ""}`}
            key={step.number}
            style={{ ["--row" as string]: index }}
          >
            <h3 className={styles.stepHeading}>
              <button
                aria-controls={panelId}
                aria-expanded={open}
                className={styles.trigger}
                id={buttonId}
                onClick={() => toggle(index)}
                type="button"
              >
                <span className={styles.number} aria-hidden="true">
                  {step.number}
                </span>

                <span className={styles.triggerText}>
                  <span className={styles.name}>{step.name}</span>
                  <span className={styles.line}>{step.line}</span>
                </span>

                <span className={styles.marker} aria-hidden="true">
                  <i />
                  <i />
                </span>
              </button>
            </h3>

            <div
              aria-labelledby={buttonId}
              className={styles.panel}
              id={panelId}
              role="region"
            >
              <div className={styles.panelInner}>
                {step.detail.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );

  if (bare) {
    return (
      <div
        className={`${styles.bare} ${entered ? styles.entered : ""}`}
        ref={sectionRef}
      >
        {rows}
      </div>
    );
  }

  if (variant === "home") {
    const activeIndex = openStep ?? 0;
    const active = processSteps[activeIndex];

    const selectStep = (index: number) => setOpenStep(index);
    const moveStep = (delta: number) => {
      const next = (activeIndex + delta + processSteps.length) % processSteps.length;
      setOpenStep(next);
      requestAnimationFrame(() => {
        document.getElementById(`${baseId}-home-tab-${processSteps[next].number}`)?.focus();
      });
    };

    return (
      <section className={styles.homeSection} id={id} aria-labelledby={`${baseId}-home-heading`}>
        <div className={styles.homeInner} ref={sectionRef}>
          <div className={styles.homeHeader}>
            <div className={styles.homeCopy}>
              <p className={styles.homeEyebrow}>Scope before the final number</p>
              <h2 id={`${baseId}-home-heading`}>How this goes.</h2>
              <p className={styles.homeIntro}>{processIntro}</p>

              <div className={styles.homeActions}>
                <Link className={styles.homeCta} href="/quote">
                  Start your quote request <span aria-hidden="true">→</span>
                </Link>
                <span className={styles.homeSignal} aria-hidden="true">
                  scope / quote / build
                </span>
              </div>
            </div>

            <div className={styles.homeDoveWrap}>
              <StaticDove />
            </div>
          </div>

          <div className={styles.homeNavigator}>
            <button
              className={styles.homeArrow}
              type="button"
              aria-label="Previous process step"
              onClick={() => moveStep(-1)}
            >
              ←
            </button>

            <div className={styles.homeTabs} role="tablist" aria-label="Project process steps">
              {processSteps.map((step, index) => {
                const selected = activeIndex === index;
                const tabId = `${baseId}-home-tab-${step.number}`;
                const panelId = `${baseId}-home-panel`;

                return (
                  <button
                    key={step.number}
                    className={`${styles.homeTab} ${selected ? styles.homeTabActive : ""}`}
                    id={tabId}
                    role="tab"
                    aria-selected={selected}
                    aria-controls={panelId}
                    tabIndex={selected ? 0 : -1}
                    type="button"
                    onClick={() => selectStep(index)}
                    onKeyDown={(event) => {
                      if (event.key === "ArrowRight") {
                        event.preventDefault();
                        moveStep(1);
                      } else if (event.key === "ArrowLeft") {
                        event.preventDefault();
                        moveStep(-1);
                      } else if (event.key === "Home") {
                        event.preventDefault();
                        selectStep(0);
                        requestAnimationFrame(() => document.getElementById(`${baseId}-home-tab-01`)?.focus());
                      } else if (event.key === "End") {
                        event.preventDefault();
                        const last = processSteps.length - 1;
                        selectStep(last);
                        requestAnimationFrame(() => document.getElementById(`${baseId}-home-tab-${processSteps[last].number}`)?.focus());
                      }
                    }}
                  >
                    <span className={styles.homeTabNumber}>{step.number}</span>
                    <span className={styles.homeNode} aria-hidden="true" />
                    <span className={styles.homeTabName}>{step.name}</span>
                    <span className={styles.homeTabLine}>{step.line}</span>
                  </button>
                );
              })}
            </div>

            <button
              className={styles.homeArrow}
              type="button"
              aria-label="Next process step"
              onClick={() => moveStep(1)}
            >
              →
            </button>
          </div>

          <div
            className={styles.homeDetail}
            id={`${baseId}-home-panel`}
            role="tabpanel"
            aria-labelledby={`${baseId}-home-tab-${active.number}`}
            tabIndex={0}
          >
            <aside className={styles.homeDetailMeta}>
              <span className={styles.homeDetailLabel}>Step</span>
              <strong>{active.number}</strong>
              <span className={styles.homeDetailRule} aria-hidden="true" />
              <span className={styles.homeDetailName}>{active.name}</span>
            </aside>

            <div className={styles.homeDetailCopy}>
              <h3>{active.line}</h3>
              {active.detail.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <span className={styles.homeDetailCurve} aria-hidden="true" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby={`${baseId}-heading`}
      className={`${styles.section} ${entered ? styles.entered : ""}`}
      id={id}
    >
      <div className={styles.inner} ref={sectionRef}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>The process</p>
          <h2 id={`${baseId}-heading`}>{heading}</h2>
          <p className={styles.intro}>{processIntro}</p>
        </div>

        {rows}
      </div>
    </section>
  );
}
