"use client";

import { useState } from "react";

import styles from "./order.module.css";

/*
 * Concept: order ahead in three taps. A fictional café ("Morning Ritual
 * Coffee (concept)"), generic line-drawn drinks, no prices, no real
 * business names or logos. Tap a drink, tap a size, tap Order ahead.
 */

const DRINKS = [
  { key: "latte", name: "Latte", note: "Espresso, steamed milk" },
  { key: "cold", name: "Cold brew", note: "Slow-steeped, over ice" },
  { key: "cortado", name: "Cortado", note: "Equal parts, small glass" },
  { key: "chai", name: "Chai", note: "Spiced, with oat milk" },
] as const;
type DrinkKey = (typeof DRINKS)[number]["key"];

const SIZES = ["Small", "Medium", "Large"] as const;
type Size = (typeof SIZES)[number];

function DrinkArt({ kind }: { kind: DrinkKey }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 48 48" width="40" height="40" aria-hidden="true" focusable="false">
      {kind === "latte" ? (<><path {...common} d="M10 16h26l-3 22a3 3 0 0 1-3 3H16a3 3 0 0 1-3-3z" /><path {...common} d="M36 21c6 0 6 9 0 9" /><path {...common} d="M19 24c2-3 4 0 4 0s2-3 4 0" /></>) : null}
      {kind === "cold" ? (<><path {...common} d="M14 10h20l-2.5 30a3 3 0 0 1-3 2.6h-9a3 3 0 0 1-3-2.6z" /><path {...common} d="M26 4l-3 14" /><rect x="18" y="22" width="6" height="6" rx="1.5" {...common} /><rect x="24" y="28" width="5" height="5" rx="1.5" {...common} /></>) : null}
      {kind === "cortado" ? (<><path {...common} d="M15 18h18l-2 18a3 3 0 0 1-3 2.6h-8a3 3 0 0 1-3-2.6z" /><path {...common} d="M16 26h16" /></>) : null}
      {kind === "chai" ? (<><path {...common} d="M11 18h24v14a8 8 0 0 1-8 8h-8a8 8 0 0 1-8-8z" /><path {...common} d="M35 22c5 0 5 8 0 8" /><path {...common} d="M18 12c-2-3 2-4 0-7M26 12c-2-3 2-4 0-7" /></>) : null}
    </svg>
  );
}

export default function OrderMock() {
  const [drink, setDrink] = useState<DrinkKey | null>(null);
  const [size, setSize] = useState<Size | null>(null);
  const [placed, setPlaced] = useState(false);
  const chosen = DRINKS.find((d) => d.key === drink);

  const reset = () => { setDrink(null); setSize(null); setPlaced(false); };

  return (
    <div className={styles.phone} data-cursor="view">
      <div className={styles.bar}>
        <span className={styles.brand}>Morning Ritual Coffee <em>(concept)</em></span>
        <span className={styles.steps} aria-hidden="true">
          <i data-on={drink ? "" : undefined} /><i data-on={size ? "" : undefined} /><i data-on={placed ? "" : undefined} />
        </span>
      </div>

      {placed && chosen && size ? (
        <div className={styles.done} role="status" aria-live="polite">
          <p className={styles.doneKicker}>Order in</p>
          <p className={styles.doneTitle}>Ready in 10 min</p>
          <p className={styles.doneLine}>{size} {chosen.name.toLowerCase()}. Grab it from the pickup shelf, no line.</p>
          <button type="button" className={styles.again} onClick={reset}>Start over</button>
        </div>
      ) : (
        <div className={styles.body}>
          <fieldset className={styles.group}>
            <legend>1. Pick a drink</legend>
            <div className={styles.drinks}>
              {DRINKS.map((d) => (
                <button key={d.key} type="button" className={styles.drink} aria-pressed={drink === d.key} onClick={() => setDrink(d.key)}>
                  <DrinkArt kind={d.key} />
                  <span className={styles.drinkName}>{d.name}</span>
                  <span className={styles.drinkNote}>{d.note}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className={styles.group} disabled={!drink}>
            <legend>2. Pick a size</legend>
            <div className={styles.sizes}>
              {SIZES.map((s) => (
                <button key={s} type="button" className={styles.size} aria-pressed={size === s} onClick={() => setSize(s)}>{s}</button>
              ))}
            </div>
          </fieldset>

          <button type="button" className={styles.order} disabled={!drink || !size} onClick={() => setPlaced(true)}>
            3. Order ahead
          </button>
        </div>
      )}
    </div>
  );
}
