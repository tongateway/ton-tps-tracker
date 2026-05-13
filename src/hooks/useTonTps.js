import { useCallback, useEffect, useRef, useState } from 'react'
import { calculateTps, normalizeToncenterBlocks, retryDelay } from '../utils/tps.js'
import { classifyError } from '../utils/errors.js'

const DEFAULT_ENDPOINT = 'https://toncenter.com/api/v3/blocks?workchain=-1&limit=12'
const DEFAULT_TIMEOUT_MS = 12_000

class HttpError extends Error {
  constructor(status, statusText) {
    super(`TON RPC returned HTTP ${status}${statusText ? ` (${statusText})` : ''}`)
    this.status = status
    this.statusText = statusText
    this.name = 'HttpError'
  }
}

export function useTonTps({
  endpoint = DEFAULT_ENDPOINT,
  intervalMs = 5000,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  fetcher = fetch,
} = {}) {
  const [state, setState] = useState({
    status: 'loading',
    tps: 0,
    totalTransactions: 0,
    windowSeconds: 0,
    sampleCount: 0,
    error: null,
    errorKind: null,
    attempt: 0,
    nextRetryMs: 0,
    updatedAt: null,
  })
  const attemptRef = useRef(0)
  const timerRef = useRef(null)
  const cancelledRef = useRef(false)

  const load = useCallback(async () => {
    let controller
    let timeoutHandle
    if (typeof AbortController !== 'undefined' && timeoutMs > 0) {
      controller = new AbortController()
      timeoutHandle = setTimeout(() => controller.abort(), timeoutMs)
    }
    try {
      const response = await fetcher(endpoint, {
        headers: { Accept: 'application/json' },
        signal: controller?.signal,
      })
      if (!response.ok) {
        throw new HttpError(response.status, response.statusText)
      }
      const body = await response.json()
      const result = calculateTps(normalizeToncenterBlocks(body))
      attemptRef.current = 0
      if (!cancelledRef.current) {
        setState({
          status: 'ready',
          error: null,
          errorKind: null,
          attempt: 0,
          nextRetryMs: 0,
          updatedAt: new Date().toISOString(),
          ...result,
        })
      }
    } catch (error) {
      const attempt = attemptRef.current
      attemptRef.current += 1
      const classified = classifyError(error)
      const delay = retryDelay(attempt)
      if (!cancelledRef.current) {
        setState((current) => ({
          ...current,
          status: 'error',
          error: classified.message,
          errorKind: classified.kind,
          attempt: attempt + 1,
          nextRetryMs: delay,
        }))
      }
      window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(load, delay)
    } finally {
      if (timeoutHandle) clearTimeout(timeoutHandle)
    }
  }, [endpoint, fetcher, timeoutMs])

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

  const retryNow = useCallback(() => {
    window.clearTimeout(timerRef.current)
    load()
  }, [load])

  return { ...state, retryNow }
}
