export const DEFAULT_WINDOW_SECONDS = 60

export function appendSample(history, sample, windowSeconds = DEFAULT_WINDOW_SECONDS, now = sample?.ts) {
  if (!sample || !Number.isFinite(sample.ts) || !Number.isFinite(sample.tps)) {
    return history
  }
  const cutoff = now - windowSeconds * 1000
  const next = history.filter((entry) => entry.ts >= cutoff && entry.ts !== sample.ts)
  next.push(sample)
  next.sort((a, b) => a.ts - b.ts)
  return next
}
