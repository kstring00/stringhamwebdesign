import { cta } from "../data/nav";
import Magnetic from "../motion/Magnetic";
import styles from "./home.module.css";

export default function ClosingCta({ line = "Let's build yours." }: { line?: string }) {
  return (
    <section className={`${styles.closing} ink`} aria-labelledby="closing-title">
      <div className="container">
        <h2 id="closing-title" className={`display-xl ${styles.closingLine}`} data-reveal>{line}</h2>
        <div data-reveal>
          <Magnetic>
            <a className="btn" href={cta.href}>
              {cta.label}
              <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true"><path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.4" /></svg>
            </a>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
