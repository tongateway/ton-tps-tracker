#!/usr/bin/env node
import assert from 'node:assert/strict'

import {
  calculateTps,
  normalizeToncenterBlocks,
  retryDelay,
} from '../src/utils/tps.js'

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

console.log('tps utility tests passed')
