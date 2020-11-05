import { Resolver } from 'vite'
import { SiteData, HeadConfig, LocaleConfig } from '../../types/shared'
export { resolveSiteDataByRoute } from './shared/config'
export interface UserConfig<ThemeConfig = any> {
  lang?: string
  base?: string
  title?: string
  description?: string
  head?: HeadConfig[]
  themeConfig?: ThemeConfig
  locales?: Record<string, LocaleConfig>
  alias?: Record<string, string>
}
export interface SiteConfig<ThemeConfig = any> {
  root: string
  site: SiteData<ThemeConfig>
  configPath: string
  themeDir: string
  outDir: string
  tempDir: string
  resolver: Resolver
  pages: string[]
}
export declare function resolveConfig(root?: string): Promise<SiteConfig>
export declare function resolveUserConfig(
  root: string
): Promise<UserConfig<any>>
export declare function resolveSiteData(root: string): Promise<SiteData>
