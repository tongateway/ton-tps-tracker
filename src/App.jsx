import Header from './components/Header.jsx'
import TpsDisplay from './components/TpsDisplay.jsx'
import TpsHistoryChart from './components/TpsHistoryChart.jsx'
import { useTonTps } from './hooks/useTonTps.js'
import { useTpsHistory } from './hooks/useTpsHistory.js'

export default function App() {
  const ton = useTonTps()
  const history = useTpsHistory(ton)

  return (
    <div>
      <Header />
      <main className="dashboard">
        <TpsDisplay {...ton} />
        <TpsHistoryChart history={history} />
      </main>
    </div>
  )
}
