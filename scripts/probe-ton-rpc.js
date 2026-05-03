#!/usr/bin/env node
//
// probe-ton-rpc.js — connectivity smoke test for the TON RPC providers
// catalogued in docs/ton-rpc-endpoints.md.
//
// Pings each provider's "lightest" endpoint, reports HTTP status +
// latency, and exits 0 iff at least one provider is healthy. No deps,
// runs on stock Node 18+ (uses global fetch).
//
// Usage:
//   node scripts/probe-ton-rpc.js
//   node scripts/probe-ton-rpc.js --json   # machine-readable output

const PROVIDERS = [
  {
    name: 'toncenter v3 /blocks',
    url:  'https://toncenter.com/api/v3/blocks?workchain=-1&limit=1',
    healthy: (r, body) => r.status === 200 && Array.isArray(body.blocks) && body.blocks.length > 0,
  },
  {
    name: 'toncenter v2 getMasterchainInfo',
    url:  'https://toncenter.com/api/v2/getMasterchainInfo',
    healthy: (r, body) => r.status === 200 && body.ok === true,
  },
  {
    name: 'tonapi.io /v2/status',
    url:  'https://tonapi.io/v2/status',
    healthy: (r, body) => r.status === 200 && body.indexing === true,
  },
];

async function probe(p) {
  const t0 = Date.now();
  try {
    const r = await fetch(p.url, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(8000),
    });
    const elapsed = Date.now() - t0;
    let body = null;
    try { body = await r.json(); } catch { /* not JSON */ }
    const ok = body !== null && p.healthy(r, body);
    return { name: p.name, url: p.url, status: r.status, elapsed_ms: elapsed, healthy: ok };
  } catch (e) {
    return { name: p.name, url: p.url, status: 0, elapsed_ms: Date.now() - t0, healthy: false, error: e.message };
  }
}

(async () => {
  const results = await Promise.all(PROVIDERS.map(probe));
  const asJSON = process.argv.includes('--json');
  if (asJSON) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    for (const r of results) {
      const tag = r.healthy ? '✓' : '✗';
      const line = `${tag}  ${r.name.padEnd(38)}  HTTP ${String(r.status).padEnd(3)}  ${r.elapsed_ms}ms`;
      console.log(r.error ? `${line}  (${r.error})` : line);
    }
  }
  const anyHealthy = results.some(r => r.healthy);
  process.exit(anyHealthy ? 0 : 1);
})();
