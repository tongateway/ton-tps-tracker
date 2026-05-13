import { useMemo, useRef } from 'react'
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { DEFAULT_WINDOW_SECONDS } from '../utils/tpsHistory.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

const ACCENT = '#67e8f9'
const ACCENT_SOFT = 'rgba(103, 232, 249, 0.18)'
const GRID = 'rgba(148, 163, 184, 0.18)'
const AXIS_LABEL = '#93c5fd'

function formatOffset(seconds) {
  if (seconds === 0) return 'now'
  return `-${seconds}s`
}

export default function TpsHistoryChart({ history, windowSeconds = DEFAULT_WINDOW_SECONDS }) {
  const chartRef = useRef(null)

  const data = useMemo(() => {
    const now = history.length ? history[history.length - 1].ts : Date.now()
    const labels = history.map((entry) => formatOffset(Math.round((now - entry.ts) / 1000)))
    return {
      labels,
      datasets: [
        {
          label: 'TPS',
          data: history.map((entry) => entry.tps),
          borderColor: ACCENT,
          backgroundColor: ACCENT_SOFT,
          borderWidth: 2,
          fill: true,
          tension: 0.35,
          pointRadius: history.length > 24 ? 0 : 3,
          pointBackgroundColor: ACCENT,
          pointBorderColor: ACCENT,
        },
      ],
    }
  }, [history])

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 250 },
      interaction: { mode: 'nearest', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(7, 17, 31, 0.92)',
          borderColor: 'rgba(45, 212, 191, 0.4)',
          borderWidth: 1,
          titleColor: AXIS_LABEL,
          bodyColor: '#edf6ff',
          callbacks: {
            label: (ctx) => `${ctx.parsed.y.toLocaleString(undefined, { maximumFractionDigits: 2 })} tx/s`,
          },
        },
      },
      scales: {
        x: {
          grid: { color: GRID, drawTicks: false },
          ticks: { color: AXIS_LABEL, maxRotation: 0, autoSkipPadding: 16 },
          border: { display: false },
        },
        y: {
          beginAtZero: true,
          grid: { color: GRID, drawTicks: false },
          ticks: { color: AXIS_LABEL, precision: 0 },
          border: { display: false },
        },
      },
    }),
    [],
  )

  const isEmpty = history.length === 0

  return (
    <section className="tps-chart-card" aria-label={`TPS over the last ${windowSeconds} seconds`}>
      <div className="card-header">
        <p className="eyebrow">History · last {windowSeconds}s</p>
        <span className="chart-sample-count">{history.length} sample{history.length === 1 ? '' : 's'}</span>
      </div>
      <div className="chart-canvas">
        {isEmpty ? (
          <p className="chart-empty">Collecting samples…</p>
        ) : (
          <Line ref={chartRef} data={data} options={options} />
        )}
      </div>
    </section>
  )
}
