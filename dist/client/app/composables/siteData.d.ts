import { Ref } from 'vue'
import { SiteData } from '../../../../types/shared'
export declare type SiteDataRef<T = any> = Ref<SiteData<T>>
export declare const siteDataRef: Ref<SiteData>
export declare function useSiteData<T = any>(): Ref<SiteData<T>>
