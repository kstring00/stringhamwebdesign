"use client";

import {
  ButtonHTMLAttributes,
  PointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";

export type TransmissionState = "idle" | "sending" | "sent" | "error";

type TransmissionSubmitProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onClick" | "children"
> & {
  onTransmit?: () => Promise<void> | void;
  controlledState?: TransmissionState;
  errorMessage?: string;
  idleLabel?: string;
  /**
   * What the label resolves to once the meter completes. The intake passes
   * the server-computed reply date here; the default covers callers that do
   * not have one.
   */
  sentLabel?: string;
};

const SEGMENTS = 18;

export default function TransmissionSubmit({
  onTransmit,
  controlledState,
  errorMessage = "Transmission interrupted.",
  idleLabel = "SEND YOUR BUILD",
  sentLabel = "I’ll reply within one business day.",
  disabled,
  type = "button",
  ...buttonProps
}: TransmissionSubmitProps) {
  const [internalState, setInternalState] = useState<TransmissionState>("idle");
  const [progress, setProgress] = useState(0);
  const [confirmationSettled, setConfirmationSettled] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const progressFrameRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const reducedMotionRef = useRef(false);

  const state = controlledState ?? internalState;
  const isBusy = state === "sending";
  const isDisabled = Boolean(disabled) || isBusy || state === "sent";

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      reducedMotionRef.current = query.matches;
    };
    update();
    query.addEventListener?.("change", update);
    return () => query.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    setConfirmationSettled(false);

    if (controlledState === "idle") setProgress(0);
    if (controlledState === "sending") setProgress(64);
    if (controlledState === "error") setProgress(58);
    if (controlledState === "sent") {
      setProgress(100);
      if (reducedMotionRef.current) {
        setConfirmationSettled(true);
      } else {
        const timer = window.setTimeout(() => setConfirmationSettled(true), 820);
        return () => window.clearTimeout(timer);
      }
    }
  }, [controlledState]);

  useEffect(() => {
    if (state !== "sent") return;
    if (reducedMotionRef.current) {
      setConfirmationSettled(true);
      return;
    }
    const timer = window.setTimeout(() => setConfirmationSettled(true), 820);
    return () => window.clearTimeout(timer);
  }, [state]);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      if (progressFrameRef.current !== null) cancelAnimationFrame(progressFrameRef.current);
    };
  }, []);

  function resetMagnet() {
    if (!buttonRef.current) return;
    buttonRef.current.style.setProperty("--tx", "0px");
    buttonRef.current.style.setProperty("--ty", "0px");
  }

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (reducedMotionRef.current || isDisabled) return;
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      button.style.setProperty("--tx", `${(x * 5).toFixed(2)}px`);
      button.style.setProperty("--ty", `${(y * 5).toFixed(2)}px`);
      frameRef.current = null;
    });
  }

  function animateProgressUntilSettled() {
    if (reducedMotionRef.current) {
      setProgress(86);
      return;
    }

    startRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - (startRef.current ?? now);
      const next = Math.min(88, 8 + elapsed / 23);
      setProgress(next);
      if (next < 88) progressFrameRef.current = requestAnimationFrame(tick);
    };

    progressFrameRef.current = requestAnimationFrame(tick);
  }

  async function activate() {
    if (isDisabled) return;

    if (state === "error") {
      setProgress(0);
      setInternalState("idle");
      return;
    }

    if (controlledState) return;

    setConfirmationSettled(false);
    setProgress(reducedMotionRef.current ? 86 : 4);
    setInternalState("sending");
    animateProgressUntilSettled();

    try {
      await onTransmit?.();
      if (progressFrameRef.current !== null) {
        cancelAnimationFrame(progressFrameRef.current);
        progressFrameRef.current = null;
      }
      setProgress(100);
      setInternalState("sent");
    } catch {
      if (progressFrameRef.current !== null) {
        cancelAnimationFrame(progressFrameRef.current);
        progressFrameRef.current = null;
      }
      setProgress((current) => Math.max(46, Math.min(current, 72)));
      setInternalState("error");
    }
  }

  const activeSegments = Math.round((progress / 100) * SEGMENTS);
  const counter = String(Math.round(progress)).padStart(3, "0");

  const liveMessage =
    state === "sending"
      ? "Sending your build."
      : state === "sent"
        ? `Transmission complete. ${sentLabel}`
        : state === "error"
          ? `${errorMessage} Retry available.`
          : "Ready to send your build.";

  return (
    <div className="tx-wrap">
      <style>{`
        .tx-wrap {
          --tx-idle-pulse: 4200ms;
          --tx-hover-sweep: 720ms;
          --tx-arrow: 220ms;
          --tx-magnet: 180ms;
          --tx-collapse: 320ms;
          --tx-meter-step: 90ms;
          --tx-sent-snap: 240ms;
          --tx-confirm: 420ms;
          --tx-ease: cubic-bezier(.22,1,.36,1);
          --tx-navy: #0d1b26;
          --tx-gold: #c9a227;
          --tx-cream: #f7f3ea;
          --tx-error: #b57945;
          width: 100%;
        }

        .tx-button {
          --tx: 0px;
          --ty: 0px;
          position: relative;
          width: 100%;
          min-height: 52px;
          overflow: hidden;
          border: 1px solid rgba(201,162,39,.56);
          border-radius: 2px;
          padding: 0;
          background: var(--tx-navy);
          color: var(--tx-cream);
          cursor: pointer;
          transform: translate3d(var(--tx), var(--ty), 0);
          transition:
            transform var(--tx-magnet) var(--tx-ease),
            border-color 180ms ease,
            opacity 180ms ease;
          isolation: isolate;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }

        .tx-button::before {
          content: "";
          position: absolute;
          z-index: 0;
          inset: 0;
          translate: -125% 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(247,243,234,.02) 22%,
            rgba(247,243,234,.15) 48%,
            rgba(201,162,39,.08) 58%,
            transparent 82%
          );
          pointer-events: none;
        }

        .tx-button::after {
          content: "";
          position: absolute;
          z-index: 3;
          left: 0;
          bottom: 0;
          width: 24%;
          height: 1px;
          opacity: .32;
          background: linear-gradient(90deg, transparent, var(--tx-gold), transparent);
          animation: txCarrier var(--tx-idle-pulse) linear infinite;
          pointer-events: none;
        }

        .tx-button:hover:not(:disabled) {
          border-color: var(--tx-gold);
        }

        .tx-button:hover:not(:disabled)::before {
          animation: txSweep var(--tx-hover-sweep) var(--tx-ease) both;
        }

        .tx-button:focus-visible {
          outline: 3px solid var(--tx-gold);
          outline-offset: 3px;
        }

        .tx-button:disabled {
          cursor: not-allowed;
        }

        .tx-button[data-disabled="true"] {
          opacity: .46;
        }

        .tx-face {
          position: relative;
          z-index: 2;
          min-height: 50px;
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: center;
          gap: 1rem;
          padding: .8rem 1rem .8rem 1.1rem;
        }

        .tx-label {
          justify-self: start;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: .71rem;
          font-weight: 760;
          letter-spacing: .18em;
          line-height: 1;
          text-transform: uppercase;
          white-space: nowrap;
          transform-origin: left center;
          transition:
            transform var(--tx-collapse) var(--tx-ease),
            opacity 160ms ease,
            letter-spacing var(--tx-collapse) var(--tx-ease);
        }

        .tx-arrows {
          position: relative;
          width: 1.65rem;
          height: 1rem;
          color: var(--tx-gold);
        }

        .tx-arrow,
        .tx-arrow-ghost {
          position: absolute;
          top: 50%;
          right: 0;
          translate: 0 -50%;
          font-size: 1rem;
          line-height: 1;
          transition:
            transform var(--tx-arrow) var(--tx-ease),
            opacity var(--tx-arrow) ease;
        }

        .tx-arrow-ghost {
          right: .38rem;
          opacity: 0;
        }

        .tx-button:hover:not(:disabled) .tx-arrow {
          transform: translateX(4px);
        }

        .tx-button:hover:not(:disabled) .tx-arrow-ghost {
          opacity: .36;
          transform: translateX(1px);
        }

        .tx-signal {
          position: absolute;
          z-index: 4;
          inset: 0;
          display: grid;
          align-content: center;
          gap: .38rem;
          padding: .6rem 1.05rem;
          opacity: 0;
          pointer-events: none;
        }

        .tx-counter {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          color: rgba(247,243,234,.62);
          font-size: .52rem;
          font-weight: 700;
          letter-spacing: .14em;
          line-height: 1;
          text-align: right;
        }

        .tx-meter {
          display: grid;
          grid-template-columns: repeat(${SEGMENTS}, minmax(2px, 1fr));
          gap: 3px;
          height: 8px;
        }

        .tx-segment {
          height: 100%;
          background: rgba(201,162,39,.15);
          transform: scaleY(.48);
          transition:
            background var(--tx-meter-step) linear,
            transform var(--tx-meter-step) linear;
        }

        .tx-segment[data-on="true"] {
          background: var(--tx-gold);
          transform: scaleY(1);
        }

        .tx-final-rule {
          position: absolute;
          left: 1.05rem;
          right: 1.05rem;
          top: 50%;
          height: 1px;
          background: var(--tx-gold);
          opacity: 0;
          transform: scaleX(.1);
          transform-origin: center;
        }

        .tx-sent-copy {
          position: absolute;
          z-index: 5;
          inset: 0;
          display: grid;
          place-items: center;
          padding: .5rem 1rem;
          opacity: 0;
          color: var(--tx-cream);
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: .67rem;
          font-weight: 760;
          letter-spacing: .15em;
          line-height: 1.3;
          text-align: center;
          text-transform: uppercase;
        }

        .tx-error-copy {
          position: absolute;
          z-index: 6;
          inset: 0;
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: center;
          gap: 1rem;
          padding: .65rem 1rem .65rem 1.1rem;
          opacity: 0;
          color: var(--tx-cream);
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: .63rem;
          font-weight: 720;
          letter-spacing: .1em;
          line-height: 1.3;
          text-transform: uppercase;
        }

        .tx-error-copy strong {
          color: var(--tx-error);
          font-size: .62rem;
          white-space: nowrap;
        }

        .tx-button[data-state="sending"] .tx-face,
        .tx-button[data-state="sent"] .tx-face,
        .tx-button[data-state="error"] .tx-face {
          opacity: 0;
        }

        .tx-button[data-state="sending"] .tx-signal,
        .tx-button[data-state="error"] .tx-signal {
          opacity: 1;
        }

        .tx-button[data-state="sending"] .tx-label {
          transform: scaleX(.06);
          opacity: 0;
          letter-spacing: 0;
        }

        .tx-button[data-state="sending"]::after,
        .tx-button[data-state="sent"]::after,
        .tx-button[data-state="error"]::after {
          animation: none;
          opacity: 0;
        }

        .tx-button[data-state="error"] {
          border-color: rgba(181,121,69,.8);
        }

        .tx-button[data-state="error"] .tx-segment[data-on="true"] {
          background: var(--tx-error);
        }

        .tx-button[data-state="error"] .tx-counter {
          color: var(--tx-error);
        }

        .tx-button[data-state="error"] .tx-error-copy {
          opacity: 1;
        }

        .tx-button[data-state="error"] .tx-signal {
          opacity: .28;
        }

        .tx-button[data-state="sent"] .tx-final-rule {
          animation: txRule var(--tx-sent-snap) var(--tx-ease) both;
        }

        .tx-button[data-state="sent"] .tx-sent-copy {
          animation: txSentCopy var(--tx-confirm) var(--tx-ease) var(--tx-sent-snap) both;
        }

        .tx-button[data-state="sent"] .tx-sent-copy[data-settled="true"] {
          letter-spacing: .055em;
          text-transform: none;
          font-family: ui-sans-serif, system-ui, sans-serif;
          font-size: .78rem;
          font-weight: 650;
        }

        .tx-button[data-state="sent"] .tx-signal {
          opacity: 0;
        }

        .tx-live {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        @keyframes txCarrier {
          0%, 68% { transform: translateX(-140%); opacity: 0; }
          72% { opacity: .32; }
          92% { opacity: .32; }
          100% { transform: translateX(520%); opacity: 0; }
        }

        @keyframes txSweep {
          from { translate: -125% 0; }
          to { translate: 125% 0; }
        }

        @keyframes txRule {
          0% { opacity: 1; transform: scaleX(.12); }
          100% { opacity: 1; transform: scaleX(1); }
        }

        @keyframes txSentCopy {
          0% { opacity: 0; transform: translateY(4px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @media (prefers-reduced-motion: reduce) {
          .tx-button,
          .tx-button::before,
          .tx-button::after,
          .tx-label,
          .tx-arrow,
          .tx-arrow-ghost,
          .tx-segment,
          .tx-final-rule,
          .tx-sent-copy,
          .tx-error-copy {
            animation: none !important;
            transition: none !important;
            transform: none !important;
            translate: none !important;
          }

          .tx-button[data-state="sent"] .tx-final-rule,
          .tx-button[data-state="sent"] .tx-sent-copy {
            opacity: 1;
          }
        }
      `}</style>

      <button
        {...buttonProps}
        ref={buttonRef}
        type={type}
        className="tx-button"
        data-state={state}
        data-disabled={disabled ? "true" : "false"}
        disabled={Boolean(disabled) || isBusy || state === "sent"}
        aria-busy={isBusy}
        onPointerMove={handlePointerMove}
        onPointerLeave={resetMagnet}
        onBlur={resetMagnet}
        onClick={activate}
      >
        <span className="tx-face" aria-hidden={state !== "idle"}>
          <span className="tx-label">{idleLabel}</span>
          <span className="tx-arrows" aria-hidden="true">
            <span className="tx-arrow-ghost">→</span>
            <span className="tx-arrow">→</span>
          </span>
        </span>

        <span className="tx-signal" aria-hidden={state !== "sending" && state !== "error"}>
          <span className="tx-counter">TX / {counter}</span>
          <span className="tx-meter">
            {Array.from({ length: SEGMENTS }).map((_, index) => (
              <span
                className="tx-segment"
                data-on={index < activeSegments ? "true" : "false"}
                key={index}
              />
            ))}
          </span>
        </span>

        <span className="tx-final-rule" aria-hidden="true" />

        <span
          className="tx-sent-copy"
          data-settled={confirmationSettled ? "true" : "false"}
          aria-hidden={state !== "sent"}
        >
          {confirmationSettled ? sentLabel : "TRANSMITTED"}
        </span>

        <span className="tx-error-copy" aria-hidden={state !== "error"}>
          <span>{errorMessage}</span>
          <strong>RETRY →</strong>
        </span>
      </button>

      <span className="tx-live" aria-live="polite" aria-atomic="true">
        {liveMessage}
      </span>
    </div>
  );
}
