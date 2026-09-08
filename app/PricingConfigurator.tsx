import styles from "./PricingConfigurator.module.css";

const scopePoints = [
  {
    number: "01",
    title: "Package starting point",
    body: "A clear base keeps the project bounded before we add anything custom.",
  },
  {
    number: "02",
    title: "Add what the business needs",
    body: "Forms, payments, portals, automation, CMS, analytics, and other systems are added only when they belong in the build.",
  },
  {
    number: "03",
    title: "Confirm the final scope",
    body: "We lock the package, add-ons, deliverables, and revision boundaries together on the consultation call before work starts.",
  },
] as const;

export default function PricingConfigurator() {
  return (
    <section className={styles.section} id="scope">
      <div className={styles.inner}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Scope before numbers</p>
            <h2>A starting point, then a tailored scope.</h2>
          </div>
          <p className={styles.intro}>
            I still work from clear package starting points, and add-ons are available
            when the project needs them. The final build is confirmed after we talk —
            not chosen from a public price menu.
          </p>
        </div>

        <div className={styles.logic}>
          {scopePoints.map((point) => (
            <article className={styles.item} key={point.number}>
              <span className={styles.number}>{point.number}</span>
              <div>
                <h3>{point.title}</h3>
                <p>{point.body}</p>
              </div>
            </article>
          ))}
        </div>

        <div className={styles.actionRow}>
          <p>
            Your written plan &amp; quote reflects the scope we agree on during the
            consultation.
          </p>
          <a href="#ai-intake-chat">Start the intake <span aria-hidden="true">→</span></a>
        </div>
      </div>
    </section>
  );
}
