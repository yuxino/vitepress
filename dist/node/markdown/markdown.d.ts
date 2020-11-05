import MarkdownIt from 'markdown-it'
import { Header } from '../../../types/shared'
export interface MarkdownOptions extends MarkdownIt.Options {
  lineNumbers?: boolean
  config?: (md: MarkdownIt) => void
  anchor?: {
    permalink?: boolean
    permalinkBefore?: boolean
    permalinkSymbol?: string
  }
  toc?: any
  externalLinks?: Record<string, string>
}
export interface MarkdownParsedData {
  hoistedTags?: string[]
  links?: string[]
  headers?: Header[]
}
export interface MarkdownRenderer {
  __data: MarkdownParsedData
  render: (
    src: string,
    env?: any
  ) => {
    html: string
    data: any
  }
}
export declare const createMarkdownRenderer: (
  options?: MarkdownOptions
) => MarkdownRenderer
