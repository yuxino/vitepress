import { MarkdownOptions } from './markdown/markdown'
import { PageData } from '../../types/shared'
interface MarkdownCompileResult {
  vueSrc: string
  pageData: PageData
}
export declare function createMarkdownToVueRenderFn(
  root: string,
  options?: MarkdownOptions
): (
  src: string,
  file: string,
  lastUpdated: number,
  injectData?: boolean
) => MarkdownCompileResult
export {}
