import { SiteData } from '/@types/shared'
export declare function resolveSiteDataByRoute(
  siteData: SiteData,
  route: string
): {
  themeConfig: any
  locales: {}
  lang: string
  title: string
  description: string
  base: string
  head: import('../../../types/shared').HeadConfig[]
}
