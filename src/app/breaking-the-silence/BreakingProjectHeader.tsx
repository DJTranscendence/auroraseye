import styles from "./page.module.css";

export default function BreakingProjectHeader() {
  return (
    <header className={styles.projectHeader}>
      <div className="container">
        <div className={styles.headerTop}>
          <div className={styles.projectTitle}>Breaking the Silence Project</div>
        </div>
      </div>
    </header>
  );
}
