'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
exports.resolveSiteData = exports.resolveUserConfig = exports.resolveConfig = void 0
const path_1 = __importDefault(require('path'))
const fs_extra_1 = __importDefault(require('fs-extra'))
const chalk_1 = __importDefault(require('chalk'))
const globby_1 = __importDefault(require('globby'))
const resolver_1 = require('./resolver')
var config_1 = require('./shared/config')
Object.defineProperty(exports, 'resolveSiteDataByRoute', {
  enumerable: true,
  get: function () {
    return config_1.resolveSiteDataByRoute
  }
})
const debug = require('debug')('vitepress:config')
const resolve = (root, file) => path_1.default.resolve(root, `.vitepress`, file)
async function resolveConfig(root = process.cwd()) {
  const userConfig = await resolveUserConfig(root)
  const site = await resolveSiteData(root)
  // resolve theme path
  const userThemeDir = resolve(root, 'theme')
  const themeDir = (await fs_extra_1.default.pathExists(userThemeDir))
    ? userThemeDir
    : path_1.default.join(__dirname, '../client/theme-default')
  const config = {
    root,
    site,
    themeDir,
    pages: await globby_1.default(['**.md'], {
      cwd: root,
      ignore: ['node_modules']
    }),
    configPath: resolve(root, 'config.js'),
    outDir: resolve(root, 'dist'),
    tempDir: path_1.default.resolve(resolver_1.APP_PATH, 'temp'),
    resolver: resolver_1.createResolver(themeDir, userConfig)
  }
  return config
}
exports.resolveConfig = resolveConfig
async function resolveUserConfig(root) {
  // load user config
  const configPath = resolve(root, 'config.js')
  const hasUserConfig = await fs_extra_1.default.pathExists(configPath)
  // always delete cache first before loading config
  delete require.cache[configPath]
  const userConfig = hasUserConfig ? require(configPath) : {}
  if (hasUserConfig) {
    debug(`loaded config at ${chalk_1.default.yellow(configPath)}`)
  } else {
    debug(`no config file found.`)
  }
  return userConfig
}
exports.resolveUserConfig = resolveUserConfig
async function resolveSiteData(root) {
  const userConfig = await resolveUserConfig(root)
  return {
    lang: userConfig.lang || 'en-US',
    title: userConfig.title || 'VitePress',
    description: userConfig.description || 'A VitePress site',
    base: userConfig.base ? userConfig.base.replace(/([^/])$/, '$1/') : '/',
    head: userConfig.head || [],
    themeConfig: userConfig.themeConfig || {},
    locales: userConfig.locales || {}
  }
}
exports.resolveSiteData = resolveSiteData
//# sourceMappingURL=config.js.map
