#!/usr/bin/env node
import assert from 'node:assert/strict'

import {
  calculateTps,
  normalizeToncenterBlocks,
  retryDelay,
} from '../src/utils/tps.js'
import { connectionStatus, formatTps } from '../src/utils/displayState.js'
import { appendSample, DEFAULT_WINDOW_SECONDS } from '../src/utils/tpsHistory.js'
import { computeStats } from '../src/utils/stats.js'

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
assert.equal(connectionStatus({ status: 'error', error: 'HTTP 429' }).label, 'RPC retrying')
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

// computeStats
assert.deepEqual(computeStats([]), {
  avgTps: 0, peakTps: 0, totalTx: 0, windowSeconds: 0, sampleCount: 0,
})

const statsT0 = 1_700_000_000_000
const statsHistory = [
  { ts: statsT0, tps: 4 },
  { ts: statsT0 + 5000, tps: 8 },
  { ts: statsT0 + 10000, tps: 6 },
]
const stats = computeStats(statsHistory)
assert.equal(stats.avgTps, 6)
assert.equal(stats.peakTps, 8)
assert.equal(stats.windowSeconds, 10)
assert.equal(stats.sampleCount, 3)
// trapezoid: ((4+8)/2)*5 + ((8+6)/2)*5 = 30 + 35 = 65
assert.equal(stats.totalTx, 65)

// ignores invalid samples
assert.deepEqual(computeStats([{ ts: 'bad', tps: 1 }, { ts: 1, tps: 'bad' }]), {
  avgTps: 0, peakTps: 0, totalTx: 0, windowSeconds: 0, sampleCount: 0,
})

console.log('tps utility tests passed')
