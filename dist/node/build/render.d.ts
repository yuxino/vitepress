import { SiteConfig } from '../config'
import { BuildResult } from 'vite'
import { OutputChunk, OutputAsset } from 'rollup'
export declare function renderPage(
  config: SiteConfig,
  page: string, // foo.md
  result: BuildResult,
  appChunk: OutputChunk,
  cssChunk: OutputAsset,
  pageToHashMap: Record<string, string>,
  hashMapStirng: string
): Promise<void>
