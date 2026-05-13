import { useMemo } from 'react'
import { computeStats } from '../utils/stats.js'
import { formatTps } from '../utils/displayState.js'

export default function StatsPanel({ history = [], windowSeconds = 60 }) {
  const stats = useMemo(() => computeStats(history), [history])

  return (
    <section className="stats-panel" aria-label={`Aggregate TPS statistics over the last ${windowSeconds} seconds`}>
      <p className="stats-eyebrow">Last {windowSeconds}s overview</p>
      <dl className="stats-grid">
        <div className="stats-item">
          <dt>Average TPS</dt>
          <dd>{formatTps(stats.avgTps)}</dd>
        </div>
        <div className="stats-item">
          <dt>Peak TPS</dt>
          <dd>{formatTps(stats.peakTps)}</dd>
        </div>
        <div className="stats-item">
          <dt>Total transactions</dt>
          <dd>{stats.totalTx.toLocaleString()}</dd>
        </div>
      </dl>
    </section>
  )
}
