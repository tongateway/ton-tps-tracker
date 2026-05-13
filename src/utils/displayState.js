import { friendlyErrorMessage } from './errors.js'

export function connectionStatus({ status, error, errorKind, attempt, nextRetryMs, updatedAt } = {}) {
  if (status === 'loading') {
    return { tone: 'loading', label: 'Connecting to TON RPC', detail: 'Fetching latest blocks' }
  }
  if (status === 'error') {
    const label = friendlyErrorMessage({ kind: errorKind, message: error })
    const parts = []
    if (Number.isFinite(attempt) && attempt > 0) parts.push(`attempt ${attempt}`)
    if (Number.isFinite(nextRetryMs) && nextRetryMs > 0) {
      parts.push(`retrying in ${Math.round(nextRetryMs / 1000)}s`)
    }
    const detail = parts.length ? parts.join(' · ') : error || 'Temporary TON RPC error'
    return { tone: 'error', label, detail }
  }
  if (status === 'ready') {
    return {
      tone: 'ready',
      label: 'Live connection',
      detail: updatedAt ? `Updated ${new Date(updatedAt).toLocaleTimeString()}` : 'Blocks received',
    }
  }
  return { tone: 'idle', label: 'Waiting', detail: 'No connection attempt yet' }
}

export function formatTps(value) {
  if (!Number.isFinite(Number(value))) return '...'
  return Number(value).toLocaleString(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: Number(value) % 1 === 0 ? 0 : 2,
  })
}
