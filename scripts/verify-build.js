#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = resolve(__dirname, '..', 'dist')

function fail(message) {
  console.error(`✗ ${message}`)
  process.exit(1)
}

let indexHtml
try {
  indexHtml = readFileSync(resolve(distDir, 'index.html'), 'utf8')
} catch (error) {
  fail(`dist/index.html not found — run \`npm run build\` first (${error.message})`)
}

assert.match(indexHtml, /<div id="root">/, 'dist/index.html missing #root mount point')
assert.match(indexHtml, /\.js"/, 'dist/index.html missing bundled script')
assert.match(indexHtml, /\.css"/, 'dist/index.html missing bundled stylesheet')

const assetsDir = resolve(distDir, 'assets')
let assetFiles
try {
  assetFiles = readdirSync(assetsDir)
} catch (error) {
  fail(`dist/assets/ not found (${error.message})`)
}

const jsBundle = assetFiles.find((f) => f.endsWith('.js'))
const cssBundle = assetFiles.find((f) => f.endsWith('.css'))
assert.ok(jsBundle, 'dist/assets/ missing JS bundle')
assert.ok(cssBundle, 'dist/assets/ missing CSS bundle')

const jsStat = statSync(resolve(assetsDir, jsBundle))
const cssStat = statSync(resolve(assetsDir, cssBundle))
assert.ok(jsStat.size > 1024, `JS bundle suspiciously small: ${jsStat.size} bytes`)
assert.ok(cssStat.size > 256, `CSS bundle suspiciously small: ${cssStat.size} bytes`)

const jsContent = readFileSync(resolve(assetsDir, jsBundle), 'utf8')
assert.match(jsContent, /toncenter\.com/, 'JS bundle missing TON RPC endpoint reference')

console.log('✓ dist/index.html references bundled JS+CSS')
console.log(`✓ JS bundle: ${jsBundle} (${jsStat.size} bytes)`)
console.log(`✓ CSS bundle: ${cssBundle} (${cssStat.size} bytes)`)
console.log('✓ Production build verified')
