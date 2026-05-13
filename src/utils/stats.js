export function computeStats(history = []) {
  if (!Array.isArray(history) || history.length === 0) {
    return { avgTps: 0, peakTps: 0, totalTx: 0, windowSeconds: 0, sampleCount: 0 }
  }

  const samples = history
    .filter((entry) => Number.isFinite(entry?.ts) && Number.isFinite(entry?.tps))
    .sort((a, b) => a.ts - b.ts)

  if (samples.length === 0) {
    return { avgTps: 0, peakTps: 0, totalTx: 0, windowSeconds: 0, sampleCount: 0 }
  }

  let peakTps = 0
  let tpsSum = 0
  for (const entry of samples) {
    if (entry.tps > peakTps) peakTps = entry.tps
    tpsSum += entry.tps
  }
  const avgTps = tpsSum / samples.length

  let totalTx = 0
  for (let i = 1; i < samples.length; i += 1) {
    const deltaSeconds = (samples[i].ts - samples[i - 1].ts) / 1000
    if (deltaSeconds > 0) {
      const meanTps = (samples[i].tps + samples[i - 1].tps) / 2
      totalTx += meanTps * deltaSeconds
    }
  }

  const windowSeconds = Math.max(0, (samples[samples.length - 1].ts - samples[0].ts) / 1000)

  return {
    avgTps: Number(avgTps.toFixed(2)),
    peakTps: Number(peakTps.toFixed(2)),
    totalTx: Math.round(totalTx),
    windowSeconds: Math.round(windowSeconds),
    sampleCount: samples.length,
  }
}
