# TON RPC endpoints — research notes (T02)

Snapshot of the public TON RPC providers we evaluated for the TPS-tracker
backend. Picked criteria: free tier sufficient for a few req/s, JSON over
HTTPS (no GraphQL gymnastics), and clear "list recent transactions / get
block" endpoints.

## Providers compared

| Provider           | Base URL                              | Auth     | Free tier               | Strengths                                       |
| ------------------ | ------------------------------------- | -------- | ----------------------- | ----------------------------------------------- |
| **toncenter v2**   | `https://toncenter.com/api/v2`        | API key¹ | 1 req/s w/o key, more w/ | Closest to raw TON node JSON-RPC. Stable.      |
| **toncenter v3**   | `https://toncenter.com/api/v3`        | API key¹ | same                    | New REST shape, easier `/transactions` paging. |
| **TonAPI**         | `https://tonapi.io/v2`                | Bearer²  | 1 req/s, 1k req/day     | Indexed view, decoded jettons / NFTs.          |
| **dton.io GraphQL**| `https://dton.io/graphql`             | none     | generous                | GraphQL only — heavier client.                 |

¹ get a free key at <https://t.me/tonapibot> (toncenter)
² get a free key at <https://tonconsole.com>

## Endpoints we'll use for TPS measurement

For "transactions per second" we need block headers + tx counts over a
short rolling window (last N seconds / blocks). Two viable shapes:

### Option A — toncenter v3 `/blocks`

```
GET https://toncenter.com/api/v3/blocks?workchain=-1&limit=10
```

Returns the last N masterchain blocks with `tx_count` per block. Sum
`tx_count` across the window, divide by elapsed seconds → live TPS.

### Option B — TonAPI `/blockchain/blocks/{block_id}`

```
GET https://tonapi.io/v2/blockchain/blocks/(-1,8000000000000000,123456)
```

Higher-level decoded blocks; more bytes per response. Use only if we
need decoded tx-internals for the dashboard.

### Option C — direct lite-server (`liteclient` over TCP)

Lowest latency (~80ms vs 200-400ms for HTTP), but binary protocol —
needs `tonlibjson` or pure-JS lite-client. Park as v2 optimisation.

## Sanity probe

`scripts/probe-ton-rpc.js` pings each public endpoint above and reports
status + latency. Run with:

```
node scripts/probe-ton-rpc.js
```

It exits 0 if at least one provider responded healthy (so it can be
wired into CI as a smoke test), 1 otherwise.

## Recommendation

Start with **toncenter v3** for the MVP — REST shape matches our needs,
free-tier is enough for a single-page dashboard, and the `tx_count`
field on `/blocks` directly answers the TPS question without follow-up
calls. Add **TonAPI** as a fallback when toncenter rate-limits.
