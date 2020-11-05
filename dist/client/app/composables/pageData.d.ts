import { InjectionKey, Ref } from 'vue'
import { PageData } from '../../../../types/shared'
export declare type PageDataRef = Ref<PageData>
export declare const pageDataSymbol: InjectionKey<PageDataRef>
export declare function usePageData(): PageDataRef
