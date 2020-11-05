'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
exports.createServer = void 0
const path_1 = __importDefault(require('path'))
const vite_1 = require('vite')
const config_1 = require('./config')
const markdownToVue_1 = require('./markdownToVue')
const resolver_1 = require('./resolver')
const fs_1 = require('fs')
const debug = require('debug')('vitepress:serve')
const debugHmr = require('debug')('vitepress:hmr')
function createVitePressPlugin({ configPath, site: initialSiteData }) {
  return ({ app, root, watcher, resolver }) => {
    const markdownToVue = markdownToVue_1.createMarkdownToVueRenderFn(root)
    // hot reload .md files as .vue files
    watcher.on('change', async (file) => {
      if (file.endsWith('.md')) {
        debugHmr(`reloading ${file}`)
        const content = await vite_1.cachedRead(null, file)
        const timestamp = Date.now()
        const { pageData, vueSrc } = markdownToVue(
          content.toString(),
          file,
          timestamp,
          // do not inject pageData on HMR
          // it leads to vite to think <script> has changed and reloads the
          // component instead of re-rendering.
          // pageData needs separate HMR logic anyway (see below)
          false
        )
        // notify the client to update page data
        watcher.send({
          type: 'custom',
          id: 'vitepress:pageData',
          customData: {
            path: resolver.fileToRequest(file),
            pageData
          }
        })
        // reload the content component
        watcher.handleVueReload(file, timestamp, vueSrc)
      }
    })
    // hot reload handling for siteData
    // the data is stringified twice so it is sent to the client as a string
    // it is then parsed on the client via JSON.parse() which is faster than
    // parsing the object literal as JavaScript.
    let siteData = initialSiteData
    let stringifiedData = JSON.stringify(JSON.stringify(initialSiteData))
    watcher.add(configPath)
    watcher.on('change', async (file) => {
      if (file === configPath) {
        const newData = await config_1.resolveSiteData(root)
        stringifiedData = JSON.stringify(JSON.stringify(newData))
        if (newData.base !== siteData.base) {
          console.warn(
            `[vitepress]: config.base has changed. Please restart the dev server.`
          )
        }
        siteData = newData
        watcher.handleJSReload(resolver_1.SITE_DATA_REQUEST_PATH)
      }
    })
    // inject Koa middleware
    app.use(async (ctx, next) => {
      // serve siteData (which is a virtual file)
      if (ctx.path === resolver_1.SITE_DATA_REQUEST_PATH) {
        ctx.type = 'js'
        ctx.body = `export default ${stringifiedData}`
        debug(ctx.url)
        return
      }
      // handle .md -> vue transforms
      if (ctx.path.endsWith('.md')) {
        const file = resolver.requestToFile(ctx.path)
        if (!fs_1.existsSync(file)) {
          return next()
        }
        await vite_1.cachedRead(ctx, file)
        // let vite know this is supposed to be treated as vue file
        ctx.vue = true
        const { vueSrc, pageData } = markdownToVue(
          ctx.body,
          file,
          ctx.lastModified.getTime(),
          false
        )
        ctx.body = vueSrc
        debug(ctx.url, ctx.status)
        const pageDataWithLinks = {
          ...pageData,
          // TODO: this doesn't work with locales
          ...getNextAndPrev(siteData.themeConfig, ctx.path)
        }
        await next()
        // make sure this is the main <script> block
        if (!ctx.query.type) {
          // inject pageData to generated script
          ctx.body += `\nexport const __pageData = ${JSON.stringify(
            JSON.stringify(pageDataWithLinks)
          )}`
        }
        return
      }
      await next()
      // serve our index.html after vite history fallback
      if (ctx.url.endsWith('.html')) {
        await vite_1.cachedRead(
          ctx,
          path_1.default.join(resolver_1.APP_PATH, 'index.html')
        )
        ctx.status = 200
      }
    })
  }
}
function getNextAndPrev(themeConfig, pagePath) {
  if (!themeConfig.sidebar) {
    return
  }
  const sidebar = themeConfig.sidebar
  let candidates = []
  Object.keys(sidebar).forEach((k) => {
    if (!pagePath.startsWith(k)) {
      return
    }
    sidebar[k].forEach((sidebarItem) => {
      if (!sidebarItem.children) {
        return
      }
      sidebarItem.children.forEach((candidate) => {
        candidates.push(candidate)
      })
    })
  })
  const path = pagePath.replace(/\.(md|html)$/, '')
  const currentLinkIndex = candidates.findIndex((v) => v.link === path)
  const nextAndPrev = {}
  if (
    themeConfig.nextLinks !== false &&
    currentLinkIndex > -1 &&
    currentLinkIndex < candidates.length - 1
  ) {
    nextAndPrev.next = candidates[currentLinkIndex + 1]
  }
  if (themeConfig.prevLinks !== false && currentLinkIndex > 0) {
    nextAndPrev.next = candidates[currentLinkIndex - 1]
  }
  return nextAndPrev
}
async function createServer(options = {}) {
  const config = await config_1.resolveConfig(options.root)
  return vite_1.createServer({
    ...options,
    configureServer: createVitePressPlugin(config),
    resolvers: [config.resolver]
  })
}
exports.createServer = createServer
//# sourceMappingURL=server.js.map
