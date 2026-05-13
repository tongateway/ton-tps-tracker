# Deploying TON TPS Tracker

The project builds a static SPA via Vite. Any static host (GitHub Pages, Netlify, Vercel, Cloudflare Pages) works.

## Production build

```bash
npm install
npm run verify   # runs tests then `vite build`
```

The bundled output is written to `dist/`. Asset paths are rewritten to start with the configured base path (`/ton-tps-tracker/` by default).

### Custom base path

Override the base for a different host path:

```bash
VITE_BASE_PATH=/ npm run build           # serve at site root
VITE_BASE_PATH=/my-fork/ npm run build   # serve at a sub-path
```

## GitHub Pages (recommended)

```bash
npm run deploy
```

`predeploy` runs tests + build, then `gh-pages` pushes `dist/` to the `gh-pages` branch. Enable Pages from that branch under repo Settings → Pages.

## Netlify

- **Build command:** `npm run verify`
- **Publish directory:** `dist`
- Set environment variable `VITE_BASE_PATH=/` so assets resolve at site root.

## Vercel

- **Framework preset:** Vite
- **Build command:** `npm run verify`
- **Output directory:** `dist`
- Set environment variable `VITE_BASE_PATH=/`.

## Verifying the deployed build

After deployment, confirm:

1. The TPS counter renders within ~5 seconds.
2. The history chart populates with at least one sample.
3. The error retry UX appears if the TON RPC is temporarily unreachable (DevTools → Network → block `toncenter.com`).
4. Browser console is free of errors.
