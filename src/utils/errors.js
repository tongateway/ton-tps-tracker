export const ERROR_KINDS = {
  RATE_LIMIT: 'rate_limit',
  SERVER: 'server',
  NETWORK: 'network',
  TIMEOUT: 'timeout',
  PARSE: 'parse',
  UNKNOWN: 'unknown',
}

export function classifyError(error) {
  if (!error) {
    return { kind: ERROR_KINDS.UNKNOWN, status: null, message: 'Unknown error' }
  }

  if (typeof error === 'object' && Number.isFinite(error.status)) {
    const status = error.status
    if (status === 408 || status === 504) {
      return { kind: ERROR_KINDS.TIMEOUT, status, message: error.message || `TON RPC timed out (${status})` }
    }
    if (status === 429) {
      return { kind: ERROR_KINDS.RATE_LIMIT, status, message: error.message || 'TON RPC rate limit hit' }
    }
    if (status >= 500) {
      return { kind: ERROR_KINDS.SERVER, status, message: error.message || `TON RPC error ${status}` }
    }
    if (status >= 400) {
      return { kind: ERROR_KINDS.SERVER, status, message: error.message || `TON RPC client error ${status}` }
    }
  }

  const message = error.message || String(error)

  if (error.name === 'AbortError' || /timeout/i.test(message)) {
    return { kind: ERROR_KINDS.TIMEOUT, status: null, message }
  }
  if (error.name === 'TypeError' || /failed to fetch|networkerror|network request failed/i.test(message)) {
    return { kind: ERROR_KINDS.NETWORK, status: null, message }
  }
  if (error.name === 'SyntaxError' || /unexpected token|json/i.test(message)) {
    return { kind: ERROR_KINDS.PARSE, status: null, message }
  }
  return { kind: ERROR_KINDS.UNKNOWN, status: null, message }
}

export function friendlyErrorMessage(classified) {
  const { kind, status } = classified || {}
  switch (kind) {
    case ERROR_KINDS.RATE_LIMIT:
      return 'TON RPC rate limit reached — slowing down and retrying'
    case ERROR_KINDS.SERVER:
      return status ? `TON RPC is unavailable (HTTP ${status}) — retrying` : 'TON RPC is unavailable — retrying'
    case ERROR_KINDS.NETWORK:
      return 'Network connection lost — checking again shortly'
    case ERROR_KINDS.TIMEOUT:
      return 'TON RPC request timed out — retrying'
    case ERROR_KINDS.PARSE:
      return 'Unexpected response from TON RPC — retrying'
    default:
      return 'Connection issue — retrying automatically'
  }
}
