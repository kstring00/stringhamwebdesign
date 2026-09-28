import type { Metadata } from "next";

import { pageMeta } from "../data/meta";
import { site } from "../data/site";
import ClosingCta from "../home/ClosingCta";
import CoffeeSlot from "../home/CoffeeSlot";
import { CoffeeCup, CoffeeRing, Rosetta } from "../motifs/Motifs";
import Magnetic from "../motion/Magnetic";
import styles from "../niche.module.css";
import IncludedCup from "./IncludedCup";
import OrderFlow from "./OrderFlow";

export const metadata: Metadata = pageMeta({
  absolute: "Coffee Shop Websites with Online Ordering | Stringham Web Design, Houston Area",
  description: "Websites for independent coffee shops in League City and the Houston area: order ahead through Clover, Toast or Square, found on Google, a menu you can update, and a list for your regulars.",
  path: "/coffee-shops",
  image: "/og/coffee-shops.png",
});

function Arrow() {
  return <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true"><path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.4" /></svg>;
}

export default function CoffeeShopsPage() {
  return (
    <div className="world-coffee">
      <section className={`${styles.hero} tinted`} aria-labelledby="coffee-h1">
        <CoffeeRing className={styles.heroRingA} />
        <CoffeeRing className={styles.heroRingB} />
        <div className={`container ${styles.heroGrid}`}>
          <div className={styles.heroText}>
            <p className="label"><b>01</b> For coffee shops</p>
            <h1 id="coffee-h1" className={`display-l ${styles.h1}`}>Turn a morning stop into a morning routine.</h1>
            <p className={`lede ${styles.lede}`}>Websites for independent coffee shops, with ordering, your menu, and your regulars in one place.</p>
            <div className={styles.actions}>
              <Magnetic><a className={`btn ${styles.btnWorld}`} href="/contact?about=coffee">Start a project <Arrow /></a></Magnetic>
              <Magnetic><a className={`btn btn-secondary ${styles.btnWorldLine}`} href="#concept">See the concept demo</a></Magnetic>
            </div>
          </div>
          <div className={styles.heroArt} aria-hidden="true">
            <CoffeeCup level={0.78} className={styles.heroCup} />
            <Rosetta className={styles.heroRosetta} />
          </div>
        </div>
      </section>

      <IncludedCup />

      <section className={`${styles.section} tinted`} aria-labelledby="flow-title">
        <div className="container">
          <div className={styles.sectionHead}>
            <p className="label"><b>03</b> How ordering works</p>
            <h2 id="flow-title" className="display-m">From a tap to the pickup shelf.</h2>
          </div>
          <OrderFlow />
          <p className={styles.flowPromise} data-reveal>The site never touches cards.</p>
          <p className={styles.flowSmall}>Payments stay inside the point-of-sale system you already trust.</p>
        </div>
      </section>

      <CoffeeSlot index="04" />

      <section className={styles.section} aria-label="Next steps">
        <div className={`container ${styles.actions}`}>
          <Magnetic><a className={`btn ${styles.btnWorld}`} href="/contact?about=coffee">Start a project <Arrow /></a></Magnetic>
          <Magnetic><a className={`btn btn-secondary ${styles.btnWorldLine}`} href="#concept">See the concept demo</a></Magnetic>
          {site.bookingUrl ? <a className={`u ${styles.textLink}`} href={site.bookingUrl} target="_blank" rel="noopener noreferrer">Or book a free 30-minute call</a> : null}
        </div>
      </section>

      <ClosingCta />
    </div>
  );
}
