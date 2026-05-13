#!/usr/bin/env node
import assert from 'node:assert/strict'

import {
  calculateTps,
  normalizeToncenterBlocks,
  retryDelay,
} from '../src/utils/tps.js'
import { connectionStatus, formatTps } from '../src/utils/displayState.js'
import { appendSample, DEFAULT_WINDOW_SECONDS } from '../src/utils/tpsHistory.js'
import { classifyError, friendlyErrorMessage, ERROR_KINDS } from '../src/utils/errors.js'

const blocks = [
  { seqno: 3, gen_utime: 130, tx_count: 40 },
  { seqno: 1, gen_utime: 100, tx_count: 20 },
  { seqno: 2, gen_utime: 115, tx_count: 30 },
]

assert.deepEqual(calculateTps(blocks), {
  tps: 3,
  totalTransactions: 90,
  windowSeconds: 30,
  sampleCount: 3,
})

assert.deepEqual(normalizeToncenterBlocks({ blocks: [{ seqno: 4, gen_utime: 140, tx_count: 10 }] }), [
  { seqno: 4, timestamp: 140, txCount: 10 },
])

assert.equal(retryDelay(0), 1000)
assert.equal(retryDelay(3), 8000)
assert.equal(retryDelay(10), 15000)

assert.equal(formatTps(1234.567), '1,234.57')
assert.equal(formatTps(Number.NaN), '...')
assert.deepEqual(connectionStatus({ status: 'loading' }), {
  tone: 'loading',
  label: 'Connecting to TON RPC',
  detail: 'Fetching latest blocks',
})
assert.equal(connectionStatus({ status: 'error', error: 'HTTP 429' }).tone, 'error')
assert.equal(connectionStatus({ status: 'ready', updatedAt: '2026-05-12T19:30:00Z' }).tone, 'ready')

// tpsHistory.appendSample
assert.equal(DEFAULT_WINDOW_SECONDS, 60)

const t0 = 1_700_000_000_000
const h1 = appendSample([], { ts: t0, tps: 5 })
assert.deepEqual(h1, [{ ts: t0, tps: 5 }])

const h2 = appendSample(h1, { ts: t0 + 5000, tps: 6 })
assert.deepEqual(h2, [
  { ts: t0, tps: 5 },
  { ts: t0 + 5000, tps: 6 },
])

// drops samples outside the window
const h3 = appendSample(h2, { ts: t0 + 65000, tps: 7 }, 60)
assert.deepEqual(h3, [
  { ts: t0 + 5000, tps: 6 },
  { ts: t0 + 65000, tps: 7 },
])

// dedupes by timestamp (replaces with latest)
const h4 = appendSample(h2, { ts: t0 + 5000, tps: 9 })
assert.deepEqual(h4, [
  { ts: t0, tps: 5 },
  { ts: t0 + 5000, tps: 9 },
])

// ignores invalid samples
assert.equal(appendSample(h1, null), h1)
assert.equal(appendSample(h1, { ts: Number.NaN, tps: 1 }), h1)
assert.equal(appendSample(h1, { ts: t0, tps: Number.NaN }), h1)

// error classification
assert.equal(classifyError({ status: 429, message: 'rate' }).kind, ERROR_KINDS.RATE_LIMIT)
assert.equal(classifyError({ status: 503 }).kind, ERROR_KINDS.SERVER)
assert.equal(classifyError({ status: 504 }).kind, ERROR_KINDS.TIMEOUT)
assert.equal(classifyError({ name: 'AbortError', message: 'timeout' }).kind, ERROR_KINDS.TIMEOUT)
assert.equal(classifyError({ name: 'TypeError', message: 'Failed to fetch' }).kind, ERROR_KINDS.NETWORK)
assert.equal(classifyError({ name: 'SyntaxError', message: 'Unexpected token' }).kind, ERROR_KINDS.PARSE)
assert.equal(classifyError(null).kind, ERROR_KINDS.UNKNOWN)

assert.match(friendlyErrorMessage({ kind: ERROR_KINDS.RATE_LIMIT }), /rate limit/i)
assert.match(friendlyErrorMessage({ kind: ERROR_KINDS.NETWORK }), /network/i)
assert.match(friendlyErrorMessage({ kind: ERROR_KINDS.SERVER, status: 503 }), /503/)

// connectionStatus error path with new fields
const errStatus = connectionStatus({
  status: 'error',
  error: 'HTTP 429',
  errorKind: ERROR_KINDS.RATE_LIMIT,
  attempt: 2,
  nextRetryMs: 4000,
})
assert.equal(errStatus.tone, 'error')
assert.match(errStatus.label, /rate limit/i)
assert.match(errStatus.detail, /attempt 2/)
assert.match(errStatus.detail, /retrying in 4s/)

console.log('tps utility tests passed')
