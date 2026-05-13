# TON TPS Tracker

Real-time TON blockchain transactions-per-second counter with a live dashboard.

The app polls a public TON RPC for the most recent masterchain blocks, computes throughput from the transaction counts in those blocks, and renders a live counter alongside a rolling 60-second history chart.

Live demo: <https://agntdev.github.io/ton-tps-tracker/>

## Features

- Live TPS counter with connection-state indicator (loading / live / error)
- Rolling 60-second history chart (Chart.js)
- Auto-retry with exponential backoff on RPC failures
- Lightweight: React + Vite, no global state library, ~100 KB gzipped

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
```

Run the unit tests:

```bash
npm test
```

Produce a production bundle:

```bash
npm run build      # output in dist/
npm run preview    # serve dist/ locally
```

## How TPS is calculated

`useTonTps` (in `src/hooks/useTonTps.js`) polls a TON RPC endpoint every `intervalMs` (default 5000 ms) and passes the response through `calculateTps` (in `src/utils/tps.js`).

For the last *N* masterchain blocks returned by the endpoint:

```
tps = sum(tx_count_i) / (gen_utime_last - gen_utime_first)
```

The window size in seconds is reported alongside the counter so the value is auditable. The default endpoint returns the most recent 12 masterchain blocks (typically a ~30-second window).

## TON RPC endpoint

The default endpoint is:

```
https://toncenter.com/api/v3/blocks?workchain=-1&limit=12
```

Notes:

- `workchain=-1` is the **masterchain**. Masterchain blocks reference all shardchain blocks and aggregate per-block transaction counts.
- `limit=12` keeps the window small (~30 s) so the counter responds to live changes.
- No API key is required for the default rate. For higher throughput, request a TONcenter API key and pass it as a query parameter.

To use a different RPC or shardchain, pass an `endpoint` option:

```jsx
const ton = useTonTps({ endpoint: 'https://example.org/api/v3/blocks?...' })
```

`normalizeToncenterBlocks` accepts either `{ blocks: [...] }` or `{ result: [...] }`, and tolerates per-block fields named `seqno`/`seq_no`, `gen_utime`/`utime`/`timestamp`, `tx_count`/`transactions_count`.

See [`docs/ton-rpc-endpoints.md`](docs/ton-rpc-endpoints.md) for endpoint research notes.

## Configuration

`useTonTps` accepts:

| Option       | Default                                    | Description                                |
|--------------|--------------------------------------------|--------------------------------------------|
| `endpoint`   | TONcenter v3 masterchain blocks (limit 12) | RPC URL returning block summaries          |
| `intervalMs` | `5000`                                     | Poll interval                              |
| `fetcher`    | global `fetch`                             | Injectable for tests / custom transport    |

`useTpsHistory(state, windowSeconds = 60)` keeps a rolling window of `{ ts, tps }` samples used by the chart.

## Project layout

```
src/
  App.jsx                       App composition
  main.jsx                      Vite entry
  index.css                     Global styles
  components/
    Header.jsx                  Title bar
    TpsDisplay.jsx              Live counter + connection status
    TpsHistoryChart.jsx         60s history chart (Chart.js)
  hooks/
    useTonTps.js                Polling hook → state machine
    useTpsHistory.js            Rolling-window aggregator
  utils/
    tps.js                      TPS math + RPC normalization
    tpsHistory.js               appendSample + window pruning
    displayState.js             Status → label/tone mapping
scripts/
  test-tps-utils.js             Node test runner for utils
  probe-ton-rpc.js              Manual TON RPC probe
docs/
  ton-rpc-endpoints.md          TON RPC research
tasks/
  T01.md … T12.md               Bounty task specs
```

## Scripts

| Script              | Description                          |
|---------------------|--------------------------------------|
| `npm run dev`       | Start Vite dev server on port 5173   |
| `npm run build`     | Build production bundle to `dist/`   |
| `npm run preview`   | Serve `dist/` locally                |
| `npm test`          | Run utility unit tests (Node assert) |

## Tech stack

- [React 18](https://react.dev/)
- [Vite 5](https://vitejs.dev/)
- [Chart.js 4](https://www.chartjs.org/) via `react-chartjs-2`

## Contributing

This repo is part of the [agnt-gm.ai](https://agnt-gm.ai) bounty platform. Each task in `tasks/T*.md` corresponds to a GitHub issue. Submit a PR with the task slug in the title — for example, `feat: [T07] dark theme`. Only the first valid PR per task is accepted.

## License

MIT
