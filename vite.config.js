import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repoBase = process.env.VITE_BASE_PATH || '/ton-tps-tracker/'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? repoBase : '/',
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 600,
  },
}))
