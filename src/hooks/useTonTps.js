import { useCallback, useEffect, useRef, useState } from 'react'
import { calculateTps, normalizeToncenterBlocks, retryDelay } from '../utils/tps.js'

const DEFAULT_ENDPOINT = 'https://toncenter.com/api/v3/blocks?workchain=-1&limit=12'

export function useTonTps({
  endpoint = DEFAULT_ENDPOINT,
  intervalMs = 5000,
  fetcher = fetch,
} = {}) {
  const [state, setState] = useState({
    status: 'loading',
    tps: 0,
    totalTransactions: 0,
    windowSeconds: 0,
    sampleCount: 0,
    error: null,
    updatedAt: null,
  })
  const attemptRef = useRef(0)
  const timerRef = useRef(null)
  const cancelledRef = useRef(false)

  const load = useCallback(async () => {
    try {
      const response = await fetcher(endpoint, {
        headers: { Accept: 'application/json' },
      })
      if (!response.ok) {
        throw new Error(`TON RPC returned HTTP ${response.status}`)
      }
      const body = await response.json()
      const result = calculateTps(normalizeToncenterBlocks(body))
      attemptRef.current = 0
      if (!cancelledRef.current) {
        setState({
          status: 'ready',
          error: null,
          updatedAt: new Date().toISOString(),
          ...result,
        })
      }
    } catch (error) {
      const attempt = attemptRef.current
      attemptRef.current += 1
      if (!cancelledRef.current) {
        setState((current) => ({
          ...current,
          status: 'error',
          error: error.message,
        }))
      }
      window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(load, retryDelay(attempt))
    }
  }, [endpoint, fetcher])

  useEffect(() => {
    cancelledRef.current = false
    load()
    const interval = window.setInterval(load, intervalMs)
    return () => {
      cancelledRef.current = true
      window.clearInterval(interval)
      window.clearTimeout(timerRef.current)
    }
  }, [intervalMs, load])

  return state
}
