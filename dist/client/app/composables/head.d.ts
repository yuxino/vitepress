import { Ref } from 'vue'
import { PageDataRef } from './pageData'
import { SiteData } from '../../../../types/shared'
export declare function useUpdateHead(
  pageDataRef: PageDataRef,
  siteDataByRouteRef: Ref<SiteData>
): void
