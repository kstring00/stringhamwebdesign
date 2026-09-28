import { casaMatcha } from "../data/casaMatcha";
import { SHOW_CASA_MATCHA } from "../data/flags";
import { CoffeeRing } from "../motifs/Motifs";
import styles from "./home.module.css";

// The marker Kyle's unwritten Casa Matcha fields start with.
const MARK = "TO" + "DO";
import OrderMock from "./OrderMock";

/** A field Kyle hasn't written yet (it still starts with the marker) renders as a dashed box. */
function Unwritten({ text, as: Tag = "p", className }: { text: string; as?: "p" | "h2"; className?: string }) {
  return text.startsWith(MARK) ? <Tag className={`${styles.unwritten} ${className ?? ""}`}>{text}</Tag> : <Tag className={className}>{text}</Tag>;
}

/**
 * The homepage coffee slot. With SHOW_CASA_MATCHA off (the default) it is a
 * clearly labeled concept: a small order-ahead flow for a fictional café.
 * With it on, the Casa Matcha case study, whose copy shows as a dashed box
 * until Kyle writes it.
 */
export default function CoffeeSlot({ index = "03" }: { index?: string }) {
  if (SHOW_CASA_MATCHA) {
    return (
      <section className={`${styles.coffeeSlot} world-coffee tinted`} id="coffee-project" aria-labelledby="coffee-title">
        <div className="container">
          <p className="label"><b>{index}</b> {casaMatcha.label}</p>
          <Unwritten as="h2" text={casaMatcha.title} className={`display-l ${styles.coffeeTitle}`} />
          <Unwritten text={casaMatcha.problem} />
          <Unwritten text={casaMatcha.built} />
          <Unwritten text={casaMatcha.outcome} />
          {casaMatcha.screens.length === 0 ? <p className={styles.unwritten}>{MARK}: add real Casa Matcha screens (see app/data/casaMatcha.ts).</p> : null}
        </div>
      </section>
    );
  }

  return (
    <section className={`${styles.coffeeSlot} world-coffee tinted`} id="concept" aria-labelledby="coffee-title">
      <CoffeeRing className={styles.slotRing} />
      <div className="container">
        <div className={styles.coffeeGrid}>
          <div className={styles.coffeeText}>
            <p className="label"><b>{index}</b> Featured concept · Coffee shops</p>
            <h2 id="coffee-title" className={`display-l ${styles.coffeeTitle}`}>Concept: order ahead in three taps.</h2>
            <p className={styles.coffeeLine} data-reveal>Pick a drink, pick a size, and it&rsquo;s waiting on the shelf when you walk in. Try it.</p>
            <p className={styles.conceptNote} data-reveal>This is a concept, not a client project. Morning Ritual Coffee is a made-up café.</p>
          </div>
          <div className={styles.coffeeDemo} data-reveal>
            <OrderMock />
          </div>
        </div>
      </div>
    </section>
  );
}
