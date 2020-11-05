'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
exports.bundle = void 0
const path_1 = __importDefault(require('path'))
const slash_1 = __importDefault(require('slash'))
const fs_extra_1 = __importDefault(require('fs-extra'))
const resolver_1 = require('../resolver')
const config_1 = require('../config')
const markdownToVue_1 = require('../markdownToVue')
const vite_1 = require('vite')
const hashRE = /\.(\w+)\.js$/
const staticInjectMarkerRE = /\b(const _hoisted_\d+ = \/\*#__PURE__\*\/createStaticVNode)\("(.*)", (\d+)\)/g
const staticStripRE = /__VP_STATIC_START__.*?__VP_STATIC_END__/g
const staticRestoreRE = /__VP_STATIC_(START|END)__/g
const isPageChunk = (chunk) =>
  !!(
    chunk.type === 'chunk' &&
    chunk.isEntry &&
    chunk.facadeModuleId &&
    chunk.facadeModuleId.endsWith('.md')
  )
// bundles the VitePress app for both client AND server.
async function bundle(config, options) {
  const root = config.root
  const userConfig = await config_1.resolveUserConfig(root)
  const resolver = resolver_1.createResolver(config.themeDir, userConfig)
  const markdownToVue = markdownToVue_1.createMarkdownToVueRenderFn(root)
  let isClientBuild = true
  const pageToHashMap = Object.create(null)
  const VitePressPlugin = {
    name: 'vitepress',
    resolveId(id) {
      if (id === resolver_1.SITE_DATA_REQUEST_PATH) {
        return id
      }
    },
    async load(id) {
      if (id === resolver_1.SITE_DATA_REQUEST_PATH) {
        return `export default ${JSON.stringify(JSON.stringify(config.site))}`
      }
      // compile md into vue src
      if (id.endsWith('.md')) {
        const content = await fs_extra_1.default.readFile(id, 'utf-8')
        // TODO use git timestamp
        const lastUpdated = (await fs_extra_1.default.stat(id)).mtimeMs
        const { vueSrc } = markdownToVue(content, id, lastUpdated)
        return vueSrc
      }
    },
    renderChunk(code, chunk) {
      if (isClientBuild && isPageChunk(chunk)) {
        // For each page chunk, inject marker for start/end of static strings.
        // we do this here because in generateBundle the chunks would have been
        // minified and we won't be able to safely locate the strings.
        // Using a regexp relies on specific output from Vue compiler core,
        // which is a reasonable trade-off considering the massive perf win over
        // a full AST parse.
        code = code.replace(
          staticInjectMarkerRE,
          '$1("__VP_STATIC_START__$2__VP_STATIC_END__", $3)'
        )
        return code
      }
      return null
    },
    generateBundle(_options, bundle) {
      // for each .md entry chunk, adjust its name to its correct path.
      for (const name in bundle) {
        const chunk = bundle[name]
        if (isPageChunk(chunk) && isClientBuild) {
          // record page -> hash relations
          const hash = chunk.fileName.match(hashRE)[1]
          const pageName = chunk.fileName.replace(hashRE, '')
          pageToHashMap[pageName] = hash
          // inject another chunk with the content stripped
          bundle[name + '-lean'] = {
            ...chunk,
            fileName: chunk.fileName.replace(/\.js$/, '.lean.js'),
            code: chunk.code.replace(staticStripRE, ``)
          }
          // remove static markers from orginal code
          chunk.code = chunk.code.replace(staticRestoreRE, '')
        }
      }
    }
  }
  // define custom rollup input
  // this is a multi-entry build - every page is considered an entry chunk
  // the loading is done via filename conversion rules so that the
  // metadata doesn't need to be included in the main chunk.
  const input = {
    app: path_1.default.resolve(resolver_1.APP_PATH, 'index.js')
  }
  config.pages.forEach((file) => {
    // page filename conversion
    // foo/bar.md -> foo_bar.md
    input[slash_1.default(file).replace(/\//g, '_')] = path_1.default.resolve(
      root,
      file
    )
  })
  // resolve options to pass to vite
  const { rollupInputOptions = {}, rollupOutputOptions = {} } = options
  const viteOptions = {
    ...options,
    base: config.site.base,
    resolvers: [resolver],
    outDir: config.outDir,
    // let rollup-plugin-vue compile .md files as well
    rollupPluginVueOptions: {
      include: /\.(vue|md)$/
    },
    rollupInputOptions: {
      ...rollupInputOptions,
      input,
      // important so that each page chunk and the index export things for each
      // other
      preserveEntrySignatures: 'allow-extension',
      plugins: [VitePressPlugin, ...(rollupInputOptions.plugins || [])]
    },
    rollupOutputOptions: {
      ...rollupOutputOptions,
      chunkFileNames: `common-[hash].js`
    },
    silent: !process.env.DEBUG,
    minify: !process.env.DEBUG
  }
  console.log('building client bundle...')
  const clientResult = await vite_1.build(viteOptions)
  console.log('building server bundle...')
  isClientBuild = false
  const serverResult = await vite_1.ssrBuild({
    ...viteOptions,
    outDir: config.tempDir
  })
  return [clientResult[0], serverResult[0], pageToHashMap]
}
exports.bundle = bundle
//# sourceMappingURL=bundle.js.map
