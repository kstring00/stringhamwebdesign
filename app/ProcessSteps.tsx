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
        {/* The scene sits behind everything: a warm wash in the top-right for the
            doves to read against, the doves themselves screened so their black
            ground drops out, and the valley from /pricing faded into the cream
            along the bottom edge. All decorative. */}
        <div className={styles.homeScene} aria-hidden="true">
          <span className={styles.homeGlow} />
          <img
            className={styles.homeDoves}
            src="/process/doves.webp"
            alt=""
            width="724"
            height="772"
            loading="lazy"
            decoding="async"
          />
          <img
            className={styles.homeRidge}
            src="/pricing/close-forest.webp"
            alt=""
            width="2000"
            height="1333"
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className={styles.homeInner} ref={sectionRef}>
          <div className={styles.homeHeader}>
            <div className={styles.homeCopy}>
              <p className={styles.homeEyebrow}>Scope before the final number</p>
              <h2 id={`${baseId}-home-heading`}>How this goes.</h2>
              <p className={styles.homeIntro}>{processIntro}</p>
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

          {/* One action, at the end, after the seven steps have been read. */}
          <div className={styles.homeActions}>
            <span className={styles.homeSignal} aria-hidden="true">
              scope / quote / build
            </span>
            <Link className={styles.homeCta} href="/quote">
              Start your quote request <span aria-hidden="true">→</span>
            </Link>
            <p className={styles.homeReassure}>
              Seven questions, about five minutes. I reply within one business day.
            </p>
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
