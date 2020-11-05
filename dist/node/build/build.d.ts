import { BuildConfig as ViteBuildOptions } from 'vite'
export declare type BuildOptions = Pick<
  Partial<ViteBuildOptions>,
  | 'root'
  | 'rollupInputOptions'
  | 'rollupOutputOptions'
  | 'rollupPluginVueOptions'
>
export declare function build(buildOptions?: BuildOptions): Promise<void>
