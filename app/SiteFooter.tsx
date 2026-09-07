import styles from "./SiteFooter.module.css";

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span>Stringham Web Design</span>
        <a href="/portal">Client portal</a>
      </div>
    </footer>
  );
}
