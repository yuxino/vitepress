import serialized from '@siteData'
import { ref, readonly } from 'vue'
const parse = (data) => readonly(JSON.parse(data))
export const siteDataRef = ref(parse(serialized))
export function useSiteData() {
  return siteDataRef
}
// hmr
if (import.meta.hot) {
  import.meta.hot.acceptDeps('/@siteData', (m) => {
    siteDataRef.value = parse(m.default)
  })
}
