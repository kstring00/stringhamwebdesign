"use client";

import { useState } from "react";
import TransmissionSubmit, { TransmissionState } from "../TransmissionSubmit";

const states: { label: string; value: TransmissionState | "disabled" }[] = [
  { label: "Idle", value: "idle" },
  { label: "Sending", value: "sending" },
  { label: "Sent", value: "sent" },
  { label: "Error", value: "error" },
  { label: "Disabled", value: "disabled" },
];

export default function TransmissionDemoPage() {
  const [active, setActive] = useState<TransmissionState | "disabled">("idle");

  return (
    <main className="demo-page">
      <style>{`
        .demo-page {
          min-height: 100svh;
          padding: clamp(5rem, 9vw, 8rem) clamp(1rem, 5vw, 5rem);
          background: #f5f0e8;
          color: #0d1b26;
        }

        .demo-inner {
          width: min(100%, 72rem);
          margin: 0 auto;
        }

        .demo-kicker {
          margin: 0 0 .9rem;
          color: #a9833d;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: .63rem;
          font-weight: 760;
          letter-spacing: .18em;
          text-transform: uppercase;
        }

        .demo-title {
          max-width: 10ch;
          margin: 0;
          font-family: Georgia, serif;
          font-size: clamp(3.5rem, 7vw, 7rem);
          font-weight: 400;
          letter-spacing: -.055em;
          line-height: .9;
        }

        .demo-copy {
          max-width: 42rem;
          margin: 1.5rem 0 0;
          color: #5f7180;
          font-size: 1rem;
          line-height: 1.7;
        }

        .demo-controls {
          display: flex;
          flex-wrap: wrap;
          gap: .55rem;
          margin-top: 2rem;
        }

        .demo-control {
          min-height: 44px;
          border: 1px solid rgba(13,27,38,.22);
          border-radius: 999px;
          padding: .7rem 1rem;
          background: transparent;
          color: #0d1b26;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: .6rem;
          font-weight: 760;
          letter-spacing: .11em;
          text-transform: uppercase;
          cursor: pointer;
        }

        .demo-control[data-active="true"] {
          border-color: #c9a227;
          background: #0d1b26;
          color: #f5f0e8;
        }

        .demo-control:focus-visible {
          outline: 3px solid #c9a227;
          outline-offset: 2px;
        }

        .demo-stage {
          margin-top: clamp(2.5rem, 6vw, 5rem);
          padding: clamp(1.25rem, 4vw, 3rem);
          border: 1px solid rgba(13,27,38,.12);
          background: rgba(255,255,255,.22);
        }

        .demo-stage-label {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1rem;
          color: #7b7b74;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: .56rem;
          font-weight: 720;
          letter-spacing: .13em;
          text-transform: uppercase;
        }

        .demo-button-wrap {
          width: min(100%, 34rem);
        }

        .demo-isolations {
          margin-top: clamp(3.5rem, 7vw, 6rem);
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem;
        }

        .demo-card {
          min-width: 0;
          padding: 1.25rem;
          border: 1px solid rgba(13,27,38,.1);
          background: rgba(255,255,255,.16);
        }

        .demo-card-label {
          margin: 0 0 .8rem;
          color: #8f743d;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: .54rem;
          font-weight: 760;
          letter-spacing: .15em;
          text-transform: uppercase;
        }

        @media (max-width: 46rem) {
          .demo-isolations {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="demo-inner">
        <p className="demo-kicker">Transmission instrument / component study</p>
        <h1 className="demo-title">Send the signal.</h1>
        <p className="demo-copy">
          A project-intake submit control treated like an instrument: carrier pulse,
          scan sweep, segmented transmission meter, confirmation rule, and a failed
          transmission state with retry.
        </p>

        <div className="demo-controls" aria-label="Preview transmission states">
          {states.map((item) => (
            <button
              className="demo-control"
              data-active={active === item.value}
              key={item.value}
              type="button"
              onClick={() => setActive(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <section className="demo-stage" aria-label="Active state preview">
          <div className="demo-stage-label">
            <span>Active preview</span>
            <span>{active.toUpperCase()}</span>
          </div>
          <div className="demo-button-wrap">
            <TransmissionSubmit
              controlledState={active === "disabled" ? "idle" : active}
              disabled={active === "disabled"}
            />
          </div>
        </section>

        <section className="demo-isolations" aria-label="All transmission states">
          <div className="demo-card">
            <p className="demo-card-label">Idle</p>
            <TransmissionSubmit controlledState="idle" />
          </div>
          <div className="demo-card">
            <p className="demo-card-label">Sending</p>
            <TransmissionSubmit controlledState="sending" />
          </div>
          <div className="demo-card">
            <p className="demo-card-label">Sent</p>
            <TransmissionSubmit controlledState="sent" />
          </div>
          <div className="demo-card">
            <p className="demo-card-label">Failed transmission</p>
            <TransmissionSubmit controlledState="error" />
          </div>
          <div className="demo-card">
            <p className="demo-card-label">Disabled</p>
            <TransmissionSubmit controlledState="idle" disabled />
          </div>
          <div className="demo-card">
            <p className="demo-card-label">Live sequence</p>
            <TransmissionSubmit
              onTransmit={() =>
                new Promise<void>((resolve) => window.setTimeout(resolve, 2200))
              }
            />
          </div>
        </section>
      </div>
    </main>
  );
}
