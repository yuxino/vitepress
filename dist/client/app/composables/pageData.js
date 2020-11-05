import { inject } from 'vue'
export const pageDataSymbol = Symbol()
export function usePageData() {
  const data = inject(pageDataSymbol)
  if (!data) {
    throw new Error('usePageData() is called without provider.')
  }
  return data
}
