'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.resolveSiteDataByRoute = void 0
const inBrowser = typeof window !== 'undefined'
function findMatchRoot(route, roots) {
  // first match to the routes with the most deep level.
  roots.sort((a, b) => {
    const levelDelta = b.split('/').length - a.split('/').length
    if (levelDelta !== 0) {
      return levelDelta
    } else {
      return b.length - a.length
    }
  })
  for (const r of roots) {
    if (route.startsWith(r)) return r
  }
  return undefined
}
function resolveLocales(locales, route) {
  const localeRoot = findMatchRoot(route, Object.keys(locales))
  return localeRoot ? locales[localeRoot] : undefined
}
// this merges the locales data to the main data by the route
function resolveSiteDataByRoute(siteData, route) {
  route = cleanRoute(siteData, route)
  const localeData = resolveLocales(siteData.locales || {}, route) || {}
  const localeThemeConfig =
    resolveLocales(
      (siteData.themeConfig && siteData.themeConfig.locales) || {},
      route
    ) || {}
  return {
    ...siteData,
    ...localeData,
    themeConfig: {
      ...siteData.themeConfig,
      ...localeThemeConfig,
      // clean the locales to reduce the bundle size
      locales: {}
    },
    locales: {}
  }
}
exports.resolveSiteDataByRoute = resolveSiteDataByRoute
/**
 * Clean up the route by removing the `base` path if it's set in config.
 */
function cleanRoute(siteData, route) {
  if (!inBrowser) {
    return route
  }
  const base = siteData.base
  const baseWithoutSuffix = base.endsWith('/') ? base.slice(0, -1) : base
  return route.slice(baseWithoutSuffix.length)
}
//# sourceMappingURL=config.js.map
