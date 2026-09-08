"use client";

import {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import AIIntakeSection from "./AIIntakeSection";
import ProcessTimesheet from "./ProcessTimesheet";
import styles from "./TimelineShowcase.module.css";

const steps = [
  {
    nav: "Consultation",
    name: "Consultation",
    closesOn: "Agreed scope",
    copy: null,
  },
  {
    nav: "Plan & quote",
    name: "Plan & quote",
    closesOn: "Approved direction",
    copy:
      "You get a written plan before any work starts — what I'm building, what I'm not, the agreed project scope, and how many revision rounds are included.",
  },
  {
    nav: "Build",
    name: "Build",
    closesOn: "Revisions used",
    copy:
      "Every ten hours of work, you get my actual timesheet — date, task, plain-language description of what I did, hours logged. Your project stays fixed to the approved quote. The log is there so you can see exactly where the time went.",
  },
  {
    nav: "Launch",
    name: "Launch & handoff",
    closesOn: "Handoff",
    copy:
      "The site goes live and it's yours. Repo access, domain, analytics — all transferred. No hostage situations.",
  },
] as const;

const consultationSteps = [
  {
    number: "01a",
    title: "Send the basics",
    body:
      "About 2 minutes. Name, email, and what your business does. Enough for me to know whether I'm the right fit before either of us spends real time.",
    emphasized: false,
  },
  {
    number: "01b",
    title: "The intake conversation",
    body:
      "About 10 minutes, whenever suits you. The AI consultant asks one question at a time, follows your answers, and organizes everything into a clear project brief.",
    emphasized: false,
  },
  {
    number: "01c",
    title: "Consultation call",
    body:
      "30 to 60 minutes, with me. We go through your brief together, I ask what a form can't, and we look at your current site and materials. We confirm the right package, add-ons, and final scope before I send the written quote. No obligation on either side.",
    emphasized: true,
  },
] as const;

const proposalIncluded = [
  "Five-page responsive website",
  "Custom visual system",
  "Contact + booking integration",
] as const;

const proposalExcluded = [
  "Ongoing copywriting",
  "Paid third-party subscriptions",
] as const;

const handoffItems = [
  "Repository access transferred",
  "Domain connected and verified",
  "Analytics installed",
  "60-day bug warranty begins",
  "Care plan optional, cancel anytime",
] as const;

function GoldCheck({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path d="M5 12.5 9.5 17 19 7.5" />
    </svg>
  );
}

function ProposalArtifact() {
  return (
    <article className={styles.proposal} aria-label="Example project proposal">
      <header className={styles.proposalHeader}>
        <div>
          <span className={styles.documentEyebrow}>Project proposal</span>
          <h4>Project Name</h4>
        </div>
        <span className={styles.proposalDate}>MM / DD / YYYY</span>
      </header>

      <div className={styles.proposalRule} aria-hidden="true" />

      <section className={styles.proposalSection}>
        <h5>Included</h5>
        <div className={styles.documentList}>
          {proposalIncluded.map((item, index) => (
            <div
              className={styles.proposalLine}
              style={{ transitionDelay: `${index * 80}ms` }}
              key={item}
            >
              <GoldCheck className={styles.proposalCheck} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.proposalSection}>
        <h5>Not included</h5>
        <div className={`${styles.documentList} ${styles.excludedList}`}>
          {proposalExcluded.map((item, index) => (
            <div
              className={styles.proposalLine}
              style={{
                transitionDelay: `${(index + proposalIncluded.length) * 80}ms`,
              }}
              key={item}
            >
              <span className={styles.excludedMark} aria-hidden="true">
                —
              </span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      <footer className={styles.proposalFooter}>
        <div className={styles.proposalLine} style={{ transitionDelay: "400ms" }}>
          <span>Project scope</span>
          <strong>Confirmed after consultation</strong>
        </div>
        <div className={styles.proposalLine} style={{ transitionDelay: "480ms" }}>
          <span>Revision rounds included</span>
          <strong>3 rounds</strong>
        </div>
      </footer>
    </article>
  );
}

function HandoffArtifact() {
  return (
    <article className={styles.handoff} aria-label="Launch handoff checklist">
      <header className={styles.handoffHeader}>
        <div>
          <span className={styles.documentEyebrow}>Final handoff</span>
          <h4>Everything leaves with you.</h4>
        </div>
        <span className={styles.handoffStatus}>Ready to transfer</span>
      </header>

      <div className={styles.handoffList}>
        {handoffItems.map((item, index) => (
          <div
            className={styles.handoffRow}
            style={{ transitionDelay: `${index * 80}ms` }}
            key={item}
          >
            <GoldCheck className={styles.handoffCheck} />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

function ConsultationSequence() {
  return (
    <div className={styles.consultationSteps}>
      {consultationSteps.map((item) => (
        <div
          className={`${styles.consultationStep} ${
            item.emphasized ? styles.consultationCall : ""
          }`}
          key={item.number}
        >
          <span className={styles.consultationNumber}>{item.number}</span>
          <div>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TimelineShowcase() {
  const [activeStep, setActiveStep] = useState(0);
  const [outgoingStep, setOutgoingStep] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [incomingReady, setIncomingReady] = useState(true);
  const [panelHeight, setPanelHeight] = useState<number | null>(null);
  const [entered, setEntered] = useState(false);
  const [entryDraw, setEntryDraw] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const sectionRef = useRef<HTMLElement | null>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabShellRef = useRef<HTMLDivElement | null>(null);
  const transitionTimer = useRef<number | null>(null);
  const entryTimer = useRef<number | null>(null);
  const frameOne = useRef<number | null>(null);
  const frameTwo = useRef<number | null>(null);

  const clearTransitionWork = () => {
    if (transitionTimer.current !== null) {
      window.clearTimeout(transitionTimer.current);
      transitionTimer.current = null;
    }
    if (frameOne.current !== null) {
      window.cancelAnimationFrame(frameOne.current);
      frameOne.current = null;
    }
    if (frameTwo.current !== null) {
      window.cancelAnimationFrame(frameTwo.current);
      frameTwo.current = null;
    }
  };

  const selectStep = (nextStep: number) => {
    if (nextStep === activeStep) return;

    clearTransitionWork();
    setEntered(true);
    setOutgoingStep(activeStep);
    setActiveStep(nextStep);
    setTransitioning(true);

    if (reducedMotion) {
      setIncomingReady(true);
      transitionTimer.current = window.setTimeout(() => {
        setTransitioning(false);
        setOutgoingStep(null);
        transitionTimer.current = null;
      }, 0);
      return;
    }

    setIncomingReady(false);
    frameOne.current = window.requestAnimationFrame(() => {
      frameTwo.current = window.requestAnimationFrame(() => {
        setIncomingReady(true);
        frameOne.current = null;
        frameTwo.current = null;
      });
    });

    transitionTimer.current = window.setTimeout(() => {
      setTransitioning(false);
      setOutgoingStep(null);
      transitionTimer.current = null;
    }, 620);
  };

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(query.matches);

    updatePreference();
    query.addEventListener?.("change", updatePreference);

    return () => query.removeEventListener?.("change", updatePreference);
  }, []);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node || entered) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || entry.intersectionRatio < 0.4) return;

        setEntryDraw(true);
        setEntered(true);
        observer.disconnect();

        entryTimer.current = window.setTimeout(() => {
          setEntryDraw(false);
          entryTimer.current = null;
        }, 950);
      },
      { threshold: [0.4] },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [entered]);

  useEffect(() => {
    return () => {
      clearTransitionWork();
      if (entryTimer.current !== null) window.clearTimeout(entryTimer.current);
    };
  }, []);

  useLayoutEffect(() => {
    const panel = panelRefs.current[activeStep];
    if (!panel) return;

    const updateHeight = () => {
      const nextHeight = panel.getBoundingClientRect().height;
      if (nextHeight > 0) setPanelHeight(nextHeight);
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(panel);

    return () => observer.disconnect();
  }, [activeStep, incomingReady]);

  useEffect(() => {
    const shell = tabShellRef.current;
    const tab = tabRefs.current[activeStep];
    if (!shell || !tab || window.innerWidth >= 768) return;

    const left = tab.offsetLeft - shell.clientWidth / 2 + tab.offsetWidth / 2;
    shell.scrollTo({ left, behavior: "auto" });
  }, [activeStep]);

  const handleTabKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let nextIndex = index;

    if (event.key === "ArrowRight") {
      nextIndex = (index + 1) % steps.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (index - 1 + steps.length) % steps.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = steps.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    selectStep(nextIndex);
    tabRefs.current[nextIndex]?.focus();
  };

  const startProject = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    selectStep(0);

    window.setTimeout(
      () => document.getElementById("ai-intake-chat")?.scrollIntoView({ block: "center" }),
      reducedMotion ? 0 : 650,
    );
  };

  const progress = entered ? (activeStep + 1) / steps.length : 0;

  return (
    <section
      className={`${styles.timeline} ${entered ? styles.entered : ""} ${
        entryDraw ? styles.entryDraw : ""
      }`}
      id="timeline"
      ref={sectionRef}
    >
      <div className={styles.stepperInner}>
        <div className={styles.tabShell} ref={tabShellRef}>
          <div className={styles.tabList} role="tablist" aria-label="Project process">
            {steps.map((step, index) => {
              const isActive = activeStep === index;
              const isOutgoing = transitioning && outgoingStep === index;

              return (
                <button
                  className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
                  id={`process-tab-${index + 1}`}
                  key={step.name}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`process-panel-${index + 1}`}
                  tabIndex={isActive ? 0 : -1}
                  ref={(node) => {
                    tabRefs.current[index] = node;
                  }}
                  onClick={() => selectStep(index)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                >
                  <span
                    className={`${styles.tabNumberClip} ${
                      isActive && transitioning ? styles.numberIncoming : ""
                    } ${isOutgoing ? styles.numberOutgoing : ""}`}
                  >
                    <span className={styles.tabNumber}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </span>
                  <span>{step.nav}</span>
                </button>
              );
            })}
          </div>

          <div className={styles.progressTrack} aria-hidden="true">
            <span
              className={styles.progressFill}
              style={{ transform: `scaleX(${progress})` }}
            />
          </div>
        </div>

        <div
          className={styles.panelViewport}
          style={panelHeight ? { height: `${panelHeight}px` } : undefined}
        >
          {steps.map((step, index) => {
            const isActive = activeStep === index;
            const isExiting = transitioning && outgoingStep === index;

            let panelState = styles.panelIdle;
            if (isActive) {
              panelState = `${styles.panelActive} ${
                incomingReady ? styles.panelArrived : styles.panelEntering
              }`;
            } else if (isExiting) {
              panelState = styles.panelExiting;
            }

            return (
              <div
                className={`${styles.panel} ${panelState}`}
                id={`process-panel-${index + 1}`}
                key={step.name}
                role="tabpanel"
                aria-labelledby={`process-tab-${index + 1}`}
                aria-hidden={!isActive}
                tabIndex={isActive ? 0 : -1}
                ref={(node) => {
                  panelRefs.current[index] = node;
                }}
              >
                <div className={styles.panelCopy}>
                  <div className={styles.panelCopyInner}>
                    <div className={`${styles.settleItem} ${styles.settleHeading}`}>
                      <span
                        className={`${styles.panelNumberClip} ${
                          isActive && transitioning ? styles.numberIncoming : ""
                        } ${isExiting ? styles.numberOutgoing : ""}`}
                      >
                        <span className={styles.panelStepNumber}>
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </span>
                      <h2>{step.name}</h2>
                    </div>

                    <p
                      className={`${styles.closeCondition} ${styles.settleItem} ${styles.settleClose}`}
                    >
                      Closes on: <strong>{step.closesOn}</strong>
                    </p>

                    <div className={`${styles.settleItem} ${styles.settleBody}`}>
                      {index === 0 ? (
                        <ConsultationSequence />
                      ) : (
                        <p className={styles.bodyCopy}>{step.copy}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.artifactPanel}>
                  <div
                    className={`${styles.artifactInner} ${styles.settleItem} ${styles.settleArtifact}`}
                  >
                    {index === 0 && (
                      <div className={styles.intakeEmbed}>
                        <AIIntakeSection />
                      </div>
                    )}
                    {index === 1 && <ProposalArtifact />}
                    {index === 2 && (isActive || isExiting) && <ProcessTimesheet />}
                    {index === 3 && <HandoffArtifact />}
                  </div>
                </div>

                <div
                  className={`${styles.advanceControl} ${styles.settleItem} ${styles.settleAdvance}`}
                >
                  {index < steps.length - 1 ? (
                    <button type="button" onClick={() => selectStep(index + 1)}>
                      Next step <span aria-hidden="true">→</span>
                    </button>
                  ) : (
                    <a href="#ai-intake-chat" onClick={startProject}>
                      Start a project <span aria-hidden="true">→</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
