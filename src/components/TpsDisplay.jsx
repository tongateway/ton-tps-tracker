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
  const displayedTps = formatTps(status === 'ready' ? tps : Number.NaN)
  const tpsAriaLabel = status === 'ready'
    ? `${displayedTps} transactions per second`
    : 'TPS unavailable — connecting'

  return (
    <section
      className={`tps-card ${connection.tone}`}
      aria-labelledby="tps-card-title"
      aria-live="polite"
      aria-busy={status !== 'ready'}
    >
      <div className="card-header">
        <p className="eyebrow" id="tps-card-title">Live TON throughput</p>
        <span
          className={`connection-dot ${connection.tone}`}
          role="img"
          aria-label={`Connection: ${connection.label}`}
        />
      </div>
      <strong className="tps-value" aria-label={tpsAriaLabel}>{displayedTps}</strong>
      <span className="tps-label" aria-hidden="true">transactions / second</span>
      <p
        className={`status ${connection.tone}`}
        role={connection.tone === 'error' ? 'alert' : 'status'}
      >
        <span>{connection.label}</span>
        <small>{connection.detail}</small>
      </p>
      <dl className="meta-grid">
        <div>
          <dt>Total tx sampled</dt>
          <dd>{totalTransactions}</dd>
        </div>
        <div>
          <dt>Window</dt>
          <dd>{windowSeconds}s</dd>
        </div>
        <div>
          <dt>Blocks</dt>
          <dd>{sampleCount}</dd>
        </div>
      </dl>
    </section>
  )
}
