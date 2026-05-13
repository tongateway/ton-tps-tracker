import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `base: './'` makes built assets reference URLs RELATIVE to index.html, so
// the bundle works at both the repo root (dev `vite preview`) and at a
// subpath like https://agntdev.github.io/<repo>/ (GitHub Pages).
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5173,
  },
})
