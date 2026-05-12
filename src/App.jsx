import Header from './components/Header.jsx'
import { useTonTps } from './hooks/useTonTps.js'

export default function App() {
  const ton = useTonTps()

  return (
    <div>
      <Header />
      <main className="dashboard">
        <section className="tps-card">
          <p className="eyebrow">Live TON throughput</p>
          <strong className="tps-value">{ton.status === 'ready' ? ton.tps : '...'}</strong>
          <span className="tps-label">transactions / second</span>
          <p className={`status ${ton.status}`}>{ton.error || ton.status}</p>
        </section>
        <section className="meta-grid">
          <div>
            <span>Total tx sampled</span>
            <strong>{ton.totalTransactions}</strong>
          </div>
          <div>
            <span>Window</span>
            <strong>{ton.windowSeconds}s</strong>
          </div>
          <div>
            <span>Blocks</span>
            <strong>{ton.sampleCount}</strong>
          </div>
        </section>
      </main>
    </div>
  )
}
