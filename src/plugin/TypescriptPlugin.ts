import type {ConfigBuilder, ConfigBuilderPlugin, HookMap} from '../ConfigBuilder.js'
import type {PackageJson} from 'type-fest'

import nodeResolvePlugin, {type RollupNodeResolveOptions} from '@rollup/plugin-node-resolve'
import sucrasePlugin, {type RollupSucraseOptions} from '@rollup/plugin-sucrase'
import typescriptPlugin, {RollupTypescriptPluginOptions} from '@rollup/plugin-typescript'

export type Options = {
  pkg?: PackageJson | string
}

// const tempTypesFolder = `.types`
// const getTsLoaderOptions = (builder: ConfigBuilder) => {
//   const tsLoaderOptions: Partial<TsLoaderOptions> = {
//     onlyCompileBundledFiles: true,
//   }
//   if (builder.isDevelopment) {
//     tsLoaderOptions.transpileOnly = true
//     tsLoaderOptions.compilerOptions = {
//       inlineSourceMap: true,
//       inlineSources: true,
//     }
//   } else {
//     tsLoaderOptions.compilerOptions = {
//       declaration: true,
//       declarationDir: builder.fromOutputFolder(tempTypesFolder),
//     }
//   }
//   return tsLoaderOptions
// }
export class TypescriptPlugin implements ConfigBuilderPlugin {
  protected options: Options
  protected pkg: PackageJson | undefined
  constructor(options: Partial<Options> = {}) {
    this.options = options
  }
  apply(builder: ConfigBuilder, hooks: HookMap) {
    hooks.build.tapPromise(TypescriptPlugin.name, async () => {
      const resolverOptions: RollupNodeResolveOptions = {
        extensions: [`.js`, `.ts`],
      }
      const sucraseOptions: RollupSucraseOptions = {
        production: builder.isProduction,
        exclude: [`node_modules/**`],
        transforms: [`typescript`],
      }
      builder.addPlugin(nodeResolvePlugin, resolverOptions)
      builder.addPlugin(sucrasePlugin, sucraseOptions)
      if (builder.has(`input`)) {
        const inputFile = builder.get(`input`)
        if (inputFile.endsWith(`.js`)) {
          builder.set(`input`, inputFile.replace(/\.js$/, `.ts`))
        }
      } else {
        builder.setDefault(`input`, builder.fromContextFolder(`src/index.ts`))
      }
    })
    hooks.buildProduction.tap(TypescriptPlugin.name, () => {
      // builder.addPlugin(TypescriptDeclarationPlugin, {
      //   out: builder.fromOutputFolder(tempTypesFolder),
      // })
    })
  }
}
