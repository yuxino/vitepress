'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
exports.renderPage = void 0
const path_1 = __importDefault(require('path'))
const fs_extra_1 = __importDefault(require('fs-extra'))
const config_1 = require('../config')
const escape = require('escape-html')
async function renderPage(
  config,
  page, // foo.md
  result,
  appChunk,
  cssChunk,
  pageToHashMap,
  hashMapStirng
) {
  const { createApp } = require(path_1.default.join(
    config.tempDir,
    `_assets/app.js`
  ))
  const { app, router } = createApp()
  const routePath = `/${page.replace(/\.md$/, '')}`
  const siteData = config_1.resolveSiteDataByRoute(config.site, routePath)
  router.go(routePath)
  // lazy require server-renderer for production build
  const content = await require('@vue/server-renderer').renderToString(app)
  const pageName = page.replace(/\//g, '_')
  // server build doesn't need hash
  const pageServerJsFileName = pageName + '.js'
  // for any initial page load, we only need the lean version of the page js
  // since the static content is already on the page!
  const pageHash = pageToHashMap[pageName]
  const pageClientJsFileName = pageName + `.` + pageHash + '.lean.js'
  // resolve page data so we can render head tags
  const { __pageData } = require(path_1.default.join(
    config.tempDir,
    `_assets`,
    pageServerJsFileName
  ))
  const pageData = JSON.parse(__pageData)
  const assetPath = `${siteData.base}_assets/`
  const preloadLinks = [
    // resolve imports for index.js + page.md.js and inject script tags for
    // them as well so we fetch everything as early as possible without having
    // to wait for entry chunks to parse
    ...resolvePageImports(config, page, result, appChunk),
    pageClientJsFileName,
    appChunk.fileName
  ]
    .map((file) => {
      return `<link rel="modulepreload" href="${assetPath}${file}">`
    })
    .join('\n    ')
  const html = `
<!DOCTYPE html>
<html lang="${siteData.lang}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>
      ${pageData.title ? pageData.title + ` | ` : ``}${siteData.title}
    </title>
    <meta name="description" content="${siteData.description}">
    <link rel="stylesheet" href="${assetPath}${cssChunk.fileName}">
    ${preloadLinks}
    ${renderHead(siteData.head)}
    ${renderHead(pageData.frontmatter.head)}
  </head>
  <body>
    <div id="app">${content}</div>
    <script>__VP_HASH_MAP__ = JSON.parse(${hashMapStirng})</script>
    <script type="module" async src="${assetPath}${appChunk.fileName}"></script>
  </body>
</html>`.trim()
  const htmlFileName = path_1.default.join(
    config.outDir,
    page.replace(/\.md$/, '.html')
  )
  await fs_extra_1.default.ensureDir(path_1.default.dirname(htmlFileName))
  await fs_extra_1.default.writeFile(htmlFileName, html)
}
exports.renderPage = renderPage
function resolvePageImports(config, page, result, indexChunk) {
  // find the page's js chunk and inject script tags for its imports so that
  // they are start fetching as early as possible
  const srcPath = path_1.default.resolve(config.root, page)
  const pageChunk = result.assets.find(
    (chunk) => chunk.type === 'chunk' && chunk.facadeModuleId === srcPath
  )
  return Array.from(new Set([...indexChunk.imports, ...pageChunk.imports]))
}
function renderHead(head) {
  if (!head || !head.length) {
    return ''
  }
  return head
    .map(([tag, attrs = {}, innerHTML = '']) => {
      const openTag = `<${tag}${renderAttrs(attrs)}>`
      if (tag !== 'link' && tag !== 'meta') {
        return `${openTag}${innerHTML}</${tag}>`
      } else {
        return openTag
      }
    })
    .join('\n    ')
}
function renderAttrs(attrs) {
  return Object.keys(attrs)
    .map((key) => {
      return ` ${key}="${escape(attrs[key])}"`
    })
    .join('')
}
//# sourceMappingURL=render.js.map
