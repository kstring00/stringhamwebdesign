"use client";

import { useId, useState } from "react";

import styles from "./pricing.module.css";

type Item = { q: string; a: string };

/**
 * The same disclosure the process strip uses: a button inside the heading,
 * aria-expanded/aria-controls wired both ways, and a grid-row transition that
 * needs no measured heights. One item open at a time; none open on load so the
 * five questions can be read as a list before any of them is.
 */
/**
 * `glass` renders each question as a frosted panel over whatever sits behind
 * the list — on /pricing that is the photograph. The specular highlight tracks
 * the pointer through two custom properties; nothing here needs JavaScript to
 * be readable, and under reduced motion the highlight simply does not move.
 */
export default function PricingFaq({ items, glass = false }: { items: Item[]; glass?: boolean }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const baseId = useId();

  return (
    <ul className={`${styles.faqList} ${glass ? styles.faqGlass : ""}`}>
      {items.map((item, index) => {
        const open = openIndex === index;
        const buttonId = `${baseId}-q-${index}`;
        const panelId = `${baseId}-a-${index}`;

        return (
          <li
            className={`${styles.faqItem} ${open ? styles.faqOpen : ""}`}
            key={item.q}
            onPointerMove={glass ? (event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              event.currentTarget.style.setProperty("--mx", `${((event.clientX - rect.left) / rect.width) * 100}%`);
              event.currentTarget.style.setProperty("--my", `${((event.clientY - rect.top) / rect.height) * 100}%`);
            } : undefined}
          >
            <h3 className={styles.faqHeading}>
              <button
                aria-controls={panelId}
                aria-expanded={open}
                className={styles.faqTrigger}
                id={buttonId}
                onClick={() => setOpenIndex(open ? null : index)}
                type="button"
              >
                <span className={styles.faqQuestion}>{item.q}</span>
                <span className={styles.faqMarker} aria-hidden="true">
                  <i />
                  <i />
                </span>
              </button>
            </h3>

            <div
              aria-labelledby={buttonId}
              className={styles.faqPanel}
              id={panelId}
              role="region"
            >
              <div className={styles.faqPanelInner}>
                <p>{item.a}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
