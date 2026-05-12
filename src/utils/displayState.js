export function connectionStatus({ status, error, updatedAt } = {}) {
  if (status === 'loading') {
    return { tone: 'loading', label: 'Connecting to TON RPC', detail: 'Fetching latest blocks' }
  }
  if (status === 'error') {
    return { tone: 'error', label: 'RPC retrying', detail: error || 'Temporary TON RPC error' }
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
