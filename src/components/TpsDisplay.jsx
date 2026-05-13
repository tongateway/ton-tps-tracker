import { memo, useMemo } from 'react'
import { connectionStatus, formatTps } from '../utils/displayState.js'

function TpsDisplay({
  status,
  tps,
  totalTransactions,
  windowSeconds,
  sampleCount,
  error,
  updatedAt,
}) {
  const connection = useMemo(
    () => connectionStatus({ status, error, updatedAt }),
    [status, error, updatedAt],
  )
  const formattedTps = useMemo(
    () => formatTps(status === 'ready' ? tps : Number.NaN),
    [status, tps],
  )

  return (
    <section className={`tps-card ${connection.tone}`} aria-live="polite">
      <div className="card-header">
        <p className="eyebrow">Live TON throughput</p>
        <span className={`connection-dot ${connection.tone}`} />
      </div>
      <strong className="tps-value">{formattedTps}</strong>
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

export default memo(TpsDisplay)
