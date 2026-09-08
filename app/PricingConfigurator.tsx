import styles from "./PricingConfigurator.module.css";

const scopePoints = [
  {
    number: "01",
    title: "Start with the right package",
    body: "A clear starting point keeps the project bounded before anything custom is added.",
  },
  {
    number: "02",
    title: "Add only what belongs",
    body: "Forms, payments, portals, automation, CMS, analytics, and other systems are added only when they serve the build.",
  },
  {
    number: "03",
    title: "Confirm the final scope together",
    body: "We lock the package, add-ons, deliverables, and revision boundaries on the consultation call before work starts.",
  },
] as const;

export default function PricingConfigurator() {
  return (
    <section className={styles.section} id="scope">
      <div className={styles.inner}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Scope before numbers</p>
            <h2>Tell me what you&apos;re building. I&apos;ll scope it from there.</h2>
          </div>
          <p className={styles.intro}>
            There is no public price menu to decode. You start with a quote request,
            I review what you actually need, and the final scope is confirmed with you
            before anything is priced or built.
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
            After you submit your quote request, the section directly below shows
            exactly what to expect: consultation, plan &amp; quote, build, then launch.
          </p>
          <a href="#timeline">
            See what happens next <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
