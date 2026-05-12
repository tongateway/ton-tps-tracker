export function calculateTps(blocks = []) {
  const usable = blocks
    .map(normalizeBlock)
    .filter((block) => Number.isFinite(block.timestamp) && Number.isFinite(block.txCount))
    .sort((a, b) => a.timestamp - b.timestamp);

  if (usable.length < 2) {
    return {
      tps: 0,
      totalTransactions: usable[0]?.txCount || 0,
      windowSeconds: 0,
      sampleCount: usable.length,
    };
  }

  const first = usable[0];
  const last = usable[usable.length - 1];
  const windowSeconds = Math.max(1, last.timestamp - first.timestamp);
  const totalTransactions = usable.reduce((sum, block) => sum + block.txCount, 0);

  return {
    tps: Number((totalTransactions / windowSeconds).toFixed(2)),
    totalTransactions,
    windowSeconds,
    sampleCount: usable.length,
  };
}

export function normalizeToncenterBlocks(payload) {
  if (!payload) return [];
  const blocks = Array.isArray(payload.blocks) ? payload.blocks : payload.result || [];
  return blocks.map(normalizeBlock);
}

export function retryDelay(attempt, baseMs = 1000, maxMs = 15000) {
  const safeAttempt = Math.max(0, Number(attempt) || 0);
  return Math.min(maxMs, baseMs * (2 ** safeAttempt));
}

function normalizeBlock(block) {
  return {
    seqno: Number(block.seqno ?? block.seq_no ?? block.id?.seqno ?? 0),
    timestamp: Number(block.gen_utime ?? block.utime ?? block.timestamp),
    txCount: Number(block.tx_count ?? block.transactions_count ?? block.txCount ?? 0),
  };
}
