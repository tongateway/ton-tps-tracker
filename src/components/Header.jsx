import styles from './Header.module.css'

export default function Header() {
  return (
    <header className={styles.header}>
      <span className={styles.brandDot} aria-hidden="true" />
      <h1 className={styles.title}>
        TON <em>TPS</em> Tracker
      </h1>
    </header>
  )
}
