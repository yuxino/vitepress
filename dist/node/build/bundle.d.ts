import { BuildOptions } from './build'
import { SiteConfig } from '../config'
import { BuildResult } from 'vite'
export declare function bundle(
  config: SiteConfig,
  options: BuildOptions
): Promise<[BuildResult, BuildResult, Record<string, string>]>
