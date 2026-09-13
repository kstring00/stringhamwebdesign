"use client";

import { useEffect, useRef, useState } from "react";

import { phases, tiers } from "../data/pricing";

/**
 * The mock-up shows the Standard tier, so its figures come from the tier
 * itself: the timeline verbatim, and the page count parsed out of the
 * "Up to N pages" line, so a change to pricing data changes the preview too.
 */
const STANDARD = tiers.find((tier) => tier.id === "standard") ?? tiers[0];
const STANDARD_PAGES = STANDARD.includes.find((line) => /pages/i.test(line))?.match(/\d+/)?.[0] ?? "6";
import styles from "./pricing.module.css";

/**
 * The /pricing hero: a four-slide preview of the client portal, drawn entirely
 * in CSS. No image, no text baked into a picture, no animation library.
 *
 * The chrome — label, project name, progress strip — never swaps. Only the
 * block below the hairline changes, and all four blocks are in the DOM at once,
 * stacked in a single grid cell. That is what fixes the card to the height of
 * its tallest slide: the cell is already as tall as the tallest child, so
 * nothing on the page can shift when the visible one changes.
 *
 * Phase names come from the same `phases` data section 04 renders.
 */

/* Each slide holds for exactly as long as its bar takes to sweep. The bar is a
   CSS animation (see .portalFill in pricing.module.css); the slide advances on
   its animationend, so the two cannot drift apart and a paused bar is a paused
   rotation. 4s is the one number to change. */
export const HOLD_MS = 4000;

type Row = { label: string; value?: string; check?: boolean };

type Slide = {
  /** Index into `phases` — which phase is active on this slide. */
  phase: number;
  label: string;
  kind: "rows" | "preview" | "timesheet" | "checks";
  rows?: Row[];
  entries?: { date: string; task: string; hours: string; overflow?: boolean }[];
};

const SLIDES: Slide[] = [
  {
    phase: 0,
    label: "Scope agreed",
    kind: "rows",
    rows: [
      { label: "Pages", value: STANDARD_PAGES },
      { label: "Booking integration", value: "Included" },
      { label: "Timeline", value: STANDARD.timeline },
      { label: "Deposit", value: "Received, slot reserved" },
    ],
  },
  {
    phase: 1,
    label: "Awaiting your approval",
    kind: "preview",
    rows: [
      { label: "Homepage direction", value: "Ready for review" },
      { label: "Your note", value: "“Love it, warmer on the buttons”" },
    ],
  },
  {
    phase: 2,
    label: "Timesheet",
    kind: "timesheet",
    entries: [
      { date: "Mar 4", task: "Homepage layout and mobile pass", hours: "3.5 hrs" },
      { date: "Mar 6", task: "Booking form wired and tested", hours: "2.0 hrs" },
      { date: "Mar 7", task: "Copy revisions from your notes", hours: "1.5 hrs" },
    ],
  },
  {
    phase: 3,
    label: "Launch checks",
    kind: "checks",
    rows: [
      { label: "Mobile speed", value: "94", check: true },
      { label: "Forms tested and delivering", check: true },
      { label: "Accounts transferred to your name", check: true },
      { label: "Logins and edit walkthrough sent", check: true },
    ],
  },
];

/** The slide shown when someone has asked for reduced motion. */
const STILL = 2;

function Check({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 12 12"
      width="11"
      height="11"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 6.4l2.6 2.6L10 3.2" />
    </svg>
  );
}

export default function PortalPreview() {
  // Server-render the still frame. It is the strongest single slide, it is what
  // reduced motion keeps, and starting there means the first paint is never a
  // frame the rotation would immediately replace.
  const [index, setIndex] = useState(STILL);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [still, setStill] = useState(true);
  const card = useRef<HTMLDivElement>(null);

  // Reduced motion is read once on the client and again if the user changes it.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      setStill(mq.matches);
      if (mq.matches) setIndex(STILL);
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Don't rotate while the card is off-screen — there is a lot of page below
  // this and no reason to burn frames someone cannot see.
  useEffect(() => {
    const el = card.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // No timer. The active phase's bar sweeps from empty to full over HOLD_MS and
  // fires animationend; that is what advances the slide. Pausing sets
  // animation-play-state, which freezes the bar and therefore the rotation.
  const advance = () => {
    if (still) return;
    setIndex((i) => (i + 1) % SLIDES.length);
  };
  const go = (delta: number) => setIndex((i) => (i + delta + SLIDES.length) % SLIDES.length);

  const active = SLIDES[index].phase;
  const halted = paused || !visible;

  return (
    <div className={styles.heroMedia} data-hero="media">
      <div
        className={styles.portal}
        ref={card}
        data-still={still ? "" : undefined}
        data-paused={halted ? "" : undefined}
        style={{ "--hold": `${HOLD_MS}ms` } as React.CSSProperties}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        // Keyboard focus only. A mouse click used to land on a slide and pause
        // the rotation for good, because a click-focused element does not blur
        // until focus moves somewhere else — so the card sat on one slide until
        // you clicked elsewhere on the page. :focus-visible is the difference
        // between someone tabbing in to read and someone tapping the card.
        onFocusCapture={(event) => {
          if (event.target instanceof Element && event.target.matches(":focus-visible")) {
            setPaused(true);
          }
        }}
        onBlurCapture={() => setPaused(false)}
      >
        {/* Chrome. Real text, announced: this is the one claim in the card that
            is about the service rather than about an invented project. */}
        <div className={styles.portalHead}>
          <p className={styles.portalLabel}>Client portal</p>
          <p className={styles.portalProject}>Harbor Dental — Standard build</p>
        </div>

        {/* The strip is both illustration and control. Each phase name is a
            real button that jumps to its screen, so it is not hidden from
            assistive technology: a screen-reader user gets the same four
            direct jumps a mouse user does. The bars and checks stay
            decorative; the rotating state is carried only by aria-current,
            which describes which screen is showing, not a real project. */}
        <ol className={styles.portalPhases} aria-label="Portal screens">
          {phases.map((phase, i) => (
            <li
              className={styles.portalPhase}
              key={phase.name}
              data-state={i < active ? "done" : i === active ? "active" : "idle"}
            >
              <span className={styles.portalTrack} aria-hidden="true">
                {/* Done: full. Idle: empty. Active: sweeps over --hold, and its
                    end is what moves the sequence on. Only the active bar
                    animates, so only it can fire this. */}
                <span
                  className={styles.portalFill}
                  onAnimationEnd={i === active ? advance : undefined}
                />
              </span>
              <button
                type="button"
                className={styles.portalPhaseName}
                onClick={() => setIndex(SLIDES.findIndex((slide) => slide.phase === i))}
                aria-label={`Show ${phase.name} screen`}
                aria-current={i === active ? "true" : undefined}
              >
                {phase.name}
                {i < active ? <Check className={styles.portalCheck} /> : null}
              </button>
            </li>
          ))}
        </ol>

        {/* The swapping region. Decorative, and every claim it makes appears as
            real text in sections 02 and 04, so it is hidden rather than
            announced — a live region here would read four invented screens at
            a stranger on a loop. */}
        <div className={styles.portalStage} aria-hidden="true" aria-live="off">
          {SLIDES.map((slide, i) => (
            <div
              className={styles.portalSlide}
              key={slide.label}
              data-active={i === index ? "" : undefined}
            >
              <p className={styles.portalStageLabel}>{slide.label}</p>

              {slide.kind === "preview" ? (
                <div className={styles.portalWire}>
                  <span data-wire="head" />
                  <span data-wire="body" />
                  <span data-wire="foot" />
                </div>
              ) : null}

              {slide.kind === "timesheet" ? (
                <ul className={styles.portalEntries}>
                  {slide.entries!.map((entry) => (
                    <li className={styles.portalEntry} key={entry.date}>
                      <span className={styles.portalEntryDate}>{entry.date}</span>
                      <span className={styles.portalEntryTask}>{entry.task}</span>
                      <span className={styles.portalEntryHours}>{entry.hours}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className={styles.portalRows}>
                  {slide.rows!.map((row, r) => (
                    <li
                      className={styles.portalRow}
                      key={row.label}
                      // Four rows do not fit a phone without pushing the hero
                      // button under the fold, so the fourth is dropped there.
                      data-overflow={r === 3 ? "" : undefined}
                    >
                      {row.check ? <Check className={styles.portalRowCheck} /> : null}
                      <span className={styles.portalRowLabel}>{row.label}</span>
                      {row.value ? <span className={styles.portalRowValue}>{row.value}</span> : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Real controls, outside the hidden stage. The labels say what the
            buttons do rather than where they go, since the slides themselves
            are not announced. */}
        <div className={styles.portalNav}>
          <span className={styles.portalNavCount} aria-hidden="true">
            {index + 1} / {SLIDES.length}
          </span>
          <button type="button" className={styles.portalNavButton} onClick={() => go(-1)} aria-label="Previous screen">
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10 3L5 8l5 5" />
            </svg>
          </button>
          <button type="button" className={styles.portalNavButton} onClick={() => go(1)} aria-label="Next screen">
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 3l5 5-5 5" />
            </svg>
          </button>
        </div>
      </div>

      <p className={styles.portalCaption}>What you see while I build.</p>
    </div>
  );
}
