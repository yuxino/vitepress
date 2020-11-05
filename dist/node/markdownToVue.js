'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
exports.createMarkdownToVueRenderFn = void 0
const path_1 = __importDefault(require('path'))
const gray_matter_1 = __importDefault(require('gray-matter'))
const lru_cache_1 = __importDefault(require('lru-cache'))
const markdown_1 = require('./markdown/markdown')
const parseHeader_1 = require('./utils/parseHeader')
const debug = require('debug')('vitepress:md')
const cache = new lru_cache_1.default({ max: 1024 })
function createMarkdownToVueRenderFn(root, options = {}) {
  const md = markdown_1.createMarkdownRenderer(options)
  return (src, file, lastUpdated, injectData = true) => {
    file = path_1.default.relative(root, file)
    const cached = cache.get(src)
    if (cached) {
      debug(`[cache hit] ${file}`)
      return cached
    }
    const start = Date.now()
    const { content, data: frontmatter } = gray_matter_1.default(src)
    const { html, data } = md.render(content)
    // TODO validate data.links?
    // inject page data
    const pageData = {
      title: inferTitle(frontmatter, content),
      frontmatter,
      headers: data.headers,
      relativePath: file.replace(/\\/g, '/'),
      lastUpdated
    }
    const additionalBlocks = injectData
      ? injectPageData(data.hoistedTags || [], pageData)
      : data.hoistedTags || []
    const vueSrc =
      additionalBlocks.join('\n') + `\n<template><div>${html}</div></template>`
    debug(`[render] ${file} in ${Date.now() - start}ms.`)
    const result = { vueSrc, pageData }
    cache.set(src, result)
    return result
  }
}
exports.createMarkdownToVueRenderFn = createMarkdownToVueRenderFn
const scriptRE = /<\/script>/
const defaultExportRE = /((?:^|\n|;)\s*)export(\s*)default/
const namedDefaultExportRE = /((?:^|\n|;)\s*)export(.+)as(\s*)default/
function injectPageData(tags, data) {
  const code = `\nexport const __pageData = ${JSON.stringify(
    JSON.stringify(data)
  )}`
  const existingScriptIndex = tags.findIndex((tag) => scriptRE.test(tag))
  if (existingScriptIndex > -1) {
    const tagSrc = tags[existingScriptIndex]
    // user has <script> tag inside markdown
    // if it doesn't have export default it will error out on build
    const hasDefaultExport =
      defaultExportRE.test(tagSrc) || namedDefaultExportRE.test(tagSrc)
    tags[existingScriptIndex] = tagSrc.replace(
      scriptRE,
      code + (hasDefaultExport ? `` : `\nexport default{}\n`) + `</script>`
    )
  } else {
    tags.push(`<script>${code}\nexport default {}</script>`)
  }
  return tags
}
const inferTitle = (frontmatter, content) => {
  if (frontmatter.home) {
    return 'Home'
  }
  if (frontmatter.title) {
    return parseHeader_1.deeplyParseHeader(frontmatter.title)
  }
  const match = content.match(/^\s*#+\s+(.*)/m)
  if (match) {
    return parseHeader_1.deeplyParseHeader(match[1].trim())
  }
  return ''
}
//# sourceMappingURL=markdownToVue.js.map
