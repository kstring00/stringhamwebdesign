import Image from "next/image";

import { CoffeeRing, SteamMark } from "../motifs/Motifs";
import styles from "./home.module.css";

/** Why these two niches, in Kyle's voice, beside a real photo of him. */
export default function WhyBand() {
  return (
    <section className={styles.why} aria-labelledby="why-title">
      <CoffeeRing className={styles.whyRing} />
      <div className="container">
        <div className={styles.whyGrid}>
          <div className={styles.whyText}>
            <p className="label"><b>01</b> Why these two</p>
            <h2 id="why-title" className="sr-only">Why coffee shops and autism clinics</h2>
            <p className={styles.whyLead} data-reveal>
              I&rsquo;ve worked behind a Starbucks counter and inside ABA sessions. Coffee shops and autism clinics run on the same thing: <em>people who come back.</em>
            </p>
            <p className={styles.whyBody} data-reveal>
              A regular who orders the same drink every morning. A family who trusts you with their child every week. I build websites for both.
            </p>
            <p className={styles.whySign} data-reveal><SteamMark className={styles.whyMark} /> Kyle Stringham</p>
          </div>
          <figure className={`frame ${styles.whyPhoto}`} data-reveal>
            <Image src="/about/portrait.webp" alt="Kyle Stringham, looking at the camera with a slight smile" width={760} height={950} sizes="(max-width: 64rem) 80vw, 30vw" />
          </figure>
        </div>
      </div>
    </section>
  );
}
