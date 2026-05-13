import { useEffect, useState } from 'react'
import { appendSample, DEFAULT_WINDOW_SECONDS } from '../utils/tpsHistory.js'

export function useTpsHistory({ status, tps, updatedAt }, windowSeconds = DEFAULT_WINDOW_SECONDS) {
  const [history, setHistory] = useState([])

  useEffect(() => {
    if (status !== 'ready' || !updatedAt) return
    const ts = Date.parse(updatedAt)
    if (!Number.isFinite(ts)) return
    setHistory((prev) => appendSample(prev, { ts, tps }, windowSeconds, ts))
  }, [status, tps, updatedAt, windowSeconds])

  return history
}
