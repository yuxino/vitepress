import type { Component, InjectionKey } from 'vue'
export interface Route {
  path: string
  contentComponent: Component | null
}
export interface Router {
  route: Route
  go: (href?: string) => Promise<void>
}
export declare const RouterSymbol: InjectionKey<Router>
export declare function createRouter(
  loadComponent: (route: Route) => Component | Promise<Component>,
  fallbackComponent?: Component
): Router
export declare function useRouter(): Router
export declare function useRoute(): Route
