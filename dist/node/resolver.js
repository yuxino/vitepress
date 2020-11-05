'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
exports.createResolver = exports.SITE_DATA_REQUEST_PATH = exports.SITE_DATA_ID = exports.SHARED_PATH = exports.APP_PATH = void 0
const path_1 = __importDefault(require('path'))
exports.APP_PATH = path_1.default.join(__dirname, '../client/app')
exports.SHARED_PATH = path_1.default.join(__dirname, '../client/shared')
// special virtual file
// we can't directly import '/@siteData' becase
// - it's not an actual file so we can't use tsconfig paths to redirect it
// - TS doesn't allow shimming a module that starts with '/'
exports.SITE_DATA_ID = '@siteData'
exports.SITE_DATA_REQUEST_PATH = '/' + exports.SITE_DATA_ID
// this is a path resolver that is passed to vite
// so that we can resolve custom requests that start with /@app or /@theme
// we also need to map file paths back to their public served paths so that
// vite HMR can send the correct update notifications to the client.
function createResolver(themeDir, userConfig) {
  return {
    alias: {
      ...userConfig.alias,
      '/@app/': exports.APP_PATH,
      '/@theme/': themeDir,
      '/@shared/': exports.SHARED_PATH,
      vitepress: '/@app/exports.js',
      [exports.SITE_DATA_ID]: exports.SITE_DATA_REQUEST_PATH
    },
    requestToFile(publicPath) {
      if (publicPath === exports.SITE_DATA_REQUEST_PATH) {
        return exports.SITE_DATA_REQUEST_PATH
      }
    },
    fileToRequest(filePath) {
      if (filePath === exports.SITE_DATA_REQUEST_PATH) {
        return exports.SITE_DATA_REQUEST_PATH
      }
    }
  }
}
exports.createResolver = createResolver
//# sourceMappingURL=resolver.js.map
