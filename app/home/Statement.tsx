import styles from "./home.module.css";

export default function Statement() {
  return (
    <section className={`${styles.statement} ink`} aria-label="A statement">
      <div className="container">
        <p className={`display-m ${styles.statementLine}`} data-reveal>
          No templates. No agency handoffs. Just a site built around how your business actually works.
        </p>
      </div>
    </section>
  );
}
