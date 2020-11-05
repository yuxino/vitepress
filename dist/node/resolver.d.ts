import { Resolver } from 'vite'
import { UserConfig } from './config'
export declare const APP_PATH: string
export declare const SHARED_PATH: string
export declare const SITE_DATA_ID = '@siteData'
export declare const SITE_DATA_REQUEST_PATH: string
export declare function createResolver(
  themeDir: string,
  userConfig: UserConfig
): Resolver
