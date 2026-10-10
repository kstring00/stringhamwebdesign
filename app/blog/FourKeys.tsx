import styles from "./fourkeys.module.css";

/** The four things a website is made of, in the post's own words. */
const KEYS = [
  { n: 1, name: "Your domain", note: "yourbusiness.com, the address. The most important key.", top: true, icon: "M4 12h10M8 8v8M14 9l4 3-4 3M14 12h6" },
  { n: 2, name: "Your hosting", note: "Where the website actually lives.", top: false, icon: "M4 6h16v5H4zM4 13h16v5H4zM7 8.5h.01M7 15.5h.01" },
  { n: 3, name: "The website itself", note: "The login to edit it, or the files.", top: false, icon: "M3 5h18v14H3zM3 9h18M7 7h.01M10 7h.01" },
  { n: 4, name: "Your Google Business Profile", note: "How you show up on Maps and search.", top: false, icon: "M12 21s-6-5.2-6-10a6 6 0 0 1 12 0c0 4.8-6 10-6 10zM12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" },
];

/**
 * The four keys as a small diagram: four cards, the domain marked as the
 * one that matters most, with a note that email rides on it. The cards fade
 * up one after another as the diagram scrolls in (data-reveal); under
 * reduced motion they're simply there.
 */
export default function FourKeys() {
  return (
    <figure className={styles.keys} aria-label="The four keys: your domain, your hosting, the website itself, and your Google Business Profile" data-reveal-group>
      <ol className={styles.grid}>
        {KEYS.map((k) => (
          <li key={k.n} className={`${styles.key} ${k.top ? styles.top : ""}`} data-reveal>
            <svg className={styles.icon} viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={k.icon} /></svg>
            <span className={styles.n} aria-hidden="true">{k.n}</span>
            <b>{k.name}</b>
            <span className={styles.note}>{k.note}</span>
            {k.top ? <span className={styles.tag}>Get this one back first</span> : null}
          </li>
        ))}
      </ol>
      <figcaption className={styles.caption}>Each key can be in a different place. Get the domain back first; everything else can be rebuilt and pointed at it.</figcaption>
    </figure>
  );
}
