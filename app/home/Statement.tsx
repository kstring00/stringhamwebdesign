import styles from "./home.module.css";

export default function Statement() {
  return (
    <section className={`${styles.statement} ink`} aria-label="A statement">
      <div className="container">
        <p className={styles.statementLine} data-reveal>
          You bring the idea. <span className={styles.statementRest}>I handle the rest, and you own all of it.</span>
        </p>
      </div>
    </section>
  );
}
