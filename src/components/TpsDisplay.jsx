import { connectionStatus, formatTps } from '../utils/displayState.js'

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

  return (
    <section className={`tps-card ${connection.tone}`} aria-live="polite">
      <div className="card-header">
        <p className="eyebrow">Live TON throughput</p>
        <span className={`connection-dot ${connection.tone}`} />
      </div>
      <strong className="tps-value">{formatTps(status === 'ready' ? tps : Number.NaN)}</strong>
      <span className="tps-label">transactions / second</span>
      <p className={`status ${connection.tone}`}>
        <span>{connection.label}</span>
        <small>{connection.detail}</small>
      </p>
      <div className="meta-grid">
        <div>
          <span>Total tx sampled</span>
          <strong>{totalTransactions}</strong>
        </div>
        <div>
          <span>Window</span>
          <strong>{windowSeconds}s</strong>
        </div>
        <div>
          <span>Blocks</span>
          <strong>{sampleCount}</strong>
        </div>
      </div>
    </section>
  )
}
