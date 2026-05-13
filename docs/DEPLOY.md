# Deploying TON TPS Tracker

The project builds a static SPA via Vite. Any static host works; this repo ships drop-in configs for **Netlify** (`netlify.toml`) and **Vercel** (`vercel.json`), plus a `gh-pages` fallback.

## Production build

```bash
npm install
npm run verify   # tests → vite build → static bundle assertions
```

`verify` runs:

1. `npm test` — unit tests for TPS math, history aggregator, display state.
2. `vite build` — produces `dist/`.
3. `node scripts/verify-build.js` — asserts the bundle is well-formed (HTML mounts `#root`, JS/CSS chunks exist with sane sizes, TON RPC endpoint is reachable from the bundle).

Asset paths are rewritten to the configured base path (`/ton-tps-tracker/` by default).

### Custom base path

```bash
VITE_BASE_PATH=/ npm run build           # serve at site root (Vercel/Netlify default)
VITE_BASE_PATH=/my-fork/ npm run build   # serve at a sub-path (e.g. GitHub Pages on a fork)
```

## Netlify

Shipped config: `netlify.toml`.

```bash
npm run deploy:netlify
```

This runs `verify` first, then `netlify deploy --prod --dir=dist`. The config also handles SPA fallback so client-side refreshes land on `index.html`.

For deploys triggered by Netlify on push, the build command is set automatically by `netlify.toml`:

- **Build command:** `npm run verify`
- **Publish directory:** `dist`
- **Environment:** `NODE_VERSION=20`, `VITE_BASE_PATH=/`

## Vercel

Shipped config: `vercel.json`.

```bash
npm run deploy:vercel
```

This runs `verify` first, then `vercel --prod`. The config:

- Selects the Vite framework preset.
- Forces `VITE_BASE_PATH=/` so assets resolve at site root.
- Adds a catch-all rewrite to `/index.html` for SPA routing.

## GitHub Pages (fallback)

```bash
npm run deploy
```

`predeploy` runs `verify`; `deploy` pushes `dist/` to the `gh-pages` branch via the `gh-pages` package. The default `VITE_BASE_PATH=/ton-tps-tracker/` is correct for this org's Pages URL.

## Verifying the deployed version

After deploy, confirm:

1. The TPS counter renders within ~5 seconds and shows a non-`...` value.
2. The history chart populates with at least one sample.
3. Connection dot shows green ("Live connection") in normal conditions.
4. The error retry UX appears when the TON RPC is unreachable (DevTools → Network → block `toncenter.com`).
5. Browser console is free of errors.
6. Lighthouse: PWA-style basics pass (HTTPS, viewport meta, no JS errors).

`scripts/verify-build.js` runs locally to verify the build before upload; a deploy job's CI should fail loudly if `npm run verify` fails.
