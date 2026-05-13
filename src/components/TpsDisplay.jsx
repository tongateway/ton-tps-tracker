import { connectionStatus, formatTps } from '../utils/displayState.js'
import styles from './TpsDisplay.module.css'

export default function TpsDisplay({
  status,
  tps,
  totalTransactions,
  windowSeconds,
  sampleCount,
  error,
  updatedAt,
}) {
  const connection = connectionStatus({ status, error, updatedAt })
  const toneClass = styles[connection.tone] || ''

  return (
    <section className={`${styles.card} ${toneClass}`} aria-live="polite">
      <div className={styles.cardHeader}>
        <p className={styles.eyebrow}>Live TON throughput</p>
        <span className={`${styles.dot} ${toneClass}`} aria-hidden="true" />
      </div>
      <strong className={styles.value}>{formatTps(status === 'ready' ? tps : Number.NaN)}</strong>
      <span className={styles.label}>transactions / second</span>
      <p className={`${styles.status} ${toneClass}`}>
        <span>{connection.label}</span>
        <small>{connection.detail}</small>
      </p>
      <div className={styles.metaGrid}>
        <div className={styles.metaItem}>
          <span>Total tx sampled</span>
          <strong>{totalTransactions}</strong>
        </div>
        <div className={styles.metaItem}>
          <span>Window</span>
          <strong>{windowSeconds}s</strong>
        </div>
        <div className={styles.metaItem}>
          <span>Blocks</span>
          <strong>{sampleCount}</strong>
        </div>
      </div>
    </section>
  )
}
