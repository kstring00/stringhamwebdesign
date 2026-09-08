"use client";

import { useEffect, useId, useRef, useState } from "react";

import ProcessTimesheet from "./ProcessTimesheet";
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
};

export default function ProcessSteps({
  heading = "How this goes.",
  bare = false,
  initialOpen = 0,
  id = "process",
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

            {/* The panel stays in the DOM and collapses to a 0fr grid row, so
                the height animates without measuring pixels. The inner is
                `visibility: hidden` when closed, which keeps the collapsed
                copy out of the accessibility tree and out of the tab order —
                `overflow: hidden` alone would leave it reachable. */}
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

                {/* Step 5 is the timesheet promise. Show the artefact that
                    makes it concrete rather than describing it twice. */}
                {step.number === "05" ? (
                  <div className={styles.artifact}>
                    <ProcessTimesheet />
                  </div>
                ) : null}
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
