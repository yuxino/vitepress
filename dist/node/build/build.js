'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
exports.build = void 0
const fs_extra_1 = __importDefault(require('fs-extra'))
const bundle_1 = require('./bundle')
const config_1 = require('../config')
const render_1 = require('./render')
async function build(buildOptions = {}) {
  process.env.NODE_ENV = 'production'
  const siteConfig = await config_1.resolveConfig(buildOptions.root)
  try {
    const [clientResult, , pageToHashMap] = await bundle_1.bundle(
      siteConfig,
      buildOptions
    )
    console.log('rendering pages...')
    const appChunk = clientResult.assets.find(
      (chunk) =>
        chunk.type === 'chunk' && chunk.fileName.match(/^app\.\w+\.js$/)
    )
    const cssChunk = clientResult.assets.find(
      (chunk) => chunk.type === 'asset' && chunk.fileName.endsWith('.css')
    )
    Object.keys(pageToHashMap).forEach((key) => {
      if (!pageToHashMap[key.toLocaleLowerCase()]) {
        pageToHashMap[key.toLocaleLowerCase()] = pageToHashMap[key]
      }
    })
    // We embed the hash map string into each page directly so that it doesn't
    // alter the main chunk's hash on every build. It's also embedded as a
    // string and JSON.parsed from the client because it's faster than embedding
    // as JS object literal.
    const hashMapStirng = JSON.stringify(JSON.stringify(pageToHashMap))
    for (const page of siteConfig.pages) {
      await render_1.renderPage(
        siteConfig,
        page,
        clientResult,
        appChunk,
        cssChunk,
        pageToHashMap,
        hashMapStirng
      )
    }
  } finally {
    await fs_extra_1.default.remove(siteConfig.tempDir)
  }
  console.log('done.')
}
exports.build = build
//# sourceMappingURL=build.js.map
