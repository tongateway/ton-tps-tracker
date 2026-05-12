import Header from './components/Header.jsx'
import TpsDisplay from './components/TpsDisplay.jsx'
import { useTonTps } from './hooks/useTonTps.js'

export default function App() {
  const ton = useTonTps()

  return (
    <div>
      <Header />
      <main className="dashboard">
        <TpsDisplay {...ton} />
      </main>
    </div>
  )
}
