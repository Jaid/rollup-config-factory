import type {ConfigBuilder, ConfigBuilderPlugin, Hooks} from '../ConfigBuilder.js'
import type sucrasePlugin from '@rollup/plugin-sucrase'
import type swcPlugin from '@rollup/plugin-swc'
import type typescriptPlugin from '@rollup/plugin-typescript'
import type {InputOptions} from 'more-types'
import type dtsPlugin from 'rollup-plugin-dts'
import type tsPlugin from 'rollup-plugin-ts'
import type {PackageJson, TsConfigJson} from 'type-fest'

import {nodeResolve as nodeResolvePlugin} from '@rollup/plugin-node-resolve'
import {type CompilerOptions} from 'typescript'

import {addExportToPkg} from 'lib/addExportToPkg.js'
import dtsBundleGeneratorPlugin from 'src/rollupPlugin/dts-bundle-generator.js'

/* eslint-disable @typescript-eslint/prefer-ts-expect-error */
// @ts-ignore ts(2339)
type SwcPluginOptions = NonNullable<Parameters<typeof swcPlugin['default']>[0]>
/* eslint-disable @typescript-eslint/prefer-ts-expect-error */
// @ts-ignore ts(2339)
type SucrasePluginOptions = NonNullable<Parameters<typeof sucrasePlugin['default']>[0]>
/* eslint-disable @typescript-eslint/prefer-ts-expect-error */
// @ts-ignore ts(2339)
type TypescriptPluginOptions = NonNullable<Parameters<typeof typescriptPlugin['default']>[0]>
type NodeResolveOptions = NonNullable<Parameters<typeof nodeResolvePlugin>[0]>
type TsPluginOptions = NonNullable<Parameters<typeof tsPlugin>[0]>
type DtsPluginOptions = NonNullable<Parameters<typeof dtsPlugin>[0]>
type DtsBundleGeneratorPluginOptions = NonNullable<Parameters<typeof dtsBundleGeneratorPlugin>[0]>

export type Options = InputOptions<{
  defaultsType: typeof defaultOptions
  optionalOptions: {
    env: "development" | "production"
  }
}>

const defaultOptions = {
  compiler: `typescript` as "rollup-plugin-ts" | "sucrase" | "swc" | "typescript",
  rewriteEntry: true,
  declarationEmitter: `dts-bundle-generator` as "dts-bundle-generator" | "rollup-plugin-dts" | false | undefined,
  declarationOnlyForProduction: true,
  declarationFile: `lib.d.ts`,
}

export class TypescriptPlugin implements ConfigBuilderPlugin {
  protected options: Options['merged']
  protected pkg: PackageJson | undefined
  protected tsconfig: TsConfigJson | undefined
  #builder: ConfigBuilder
  constructor(options: Options['parameter'] = {}) {
    this.options = {
      ...defaultOptions,
      ...options,
    }
  }
  apply(builder: ConfigBuilder, hooks: Hooks) {
    this.#builder = builder
    hooks.build.tapPromise(TypescriptPlugin.name, async () => {
      const resolverOptions: NodeResolveOptions = {
        extensions: [`.js`, `.ts`],
      }
      builder.addRollupPlugin(nodeResolvePlugin, resolverOptions)
      await this.#addCompilerPlugin()
    })
    hooks.finalizeConfig.tapPromise(TypescriptPlugin.name, async config => {
      if (!this.options.rewriteEntry) {
        return config
      }
      if (typeof config.input === `string`) {
        if (config.input.endsWith(`.js`)) {
          /* eslint-disable @typescript-eslint/prefer-ts-expect-error */
          // @ts-ignore ts(2615)
          builder.set(`input`, `${config.input.slice(0, -3)}.ts`)
        }
      } else {
        builder.setDefault(`input`, builder.fromContextFolder(`src/index.ts`))
      }
      return config
    })
    /* eslint-disable @typescript-eslint/prefer-ts-expect-error */
    // @ts-ignore ts(2615)
    hooks.processPkg.tap(TypescriptPlugin.name, pkg => {
      if (this.options.declarationOnlyForProduction && !this.#builder.isProduction) {
        return pkg
      }
      const pkgModified = addExportToPkg(pkg, `./${this.options.declarationFile}`, `types`)
      return {
        ...pkgModified,
        types: this.options.declarationFile,
      }
    })
    hooks.buildProduction.tapPromise(TypescriptPlugin.name, async () => {
      await this.#addDtsEmitterPlugin()
    })
    hooks.buildDevelopment.tapPromise(TypescriptPlugin.name, async () => {
      if (!this.options.declarationOnlyForProduction) {
        await this.#addDtsEmitterPlugin()
      }
    })
  }
  async #addCompilerPlugin() {
    if (this.options.compiler === `rollup-plugin-ts`) {
      await this.#addTsPlugin()
    } else if (this.options.compiler === `sucrase`) {
      await this.#addSucrasePlugin()
    } else if (this.options.compiler === `swc`) {
      await this.#addSwcPlugin()
    } else {
      await this.#addTypescriptPlugin()
    }
  }
  async #addDtsBundleGeneratorPlugin() {
    const options = this.#getDtsBundleGeneratorPluginOptions()
    this.#builder.addRollupPlugin(dtsBundleGeneratorPlugin, options)
  }
  async #addDtsEmitterPlugin() {
    if (this.options.declarationEmitter === `dts-bundle-generator`) {
      await this.#addDtsBundleGeneratorPlugin()
    } else if (this.options.declarationEmitter === `rollup-plugin-dts`) {
      await this.#addDtsPlugin()
    }
  }
  async #addDtsPlugin() {
    const {default: dtsPlugin} = await import(`rollup-plugin-dts`)
    const options = this.#getDtsPluginOptions()
    this.#builder.addRollupPlugin(dtsPlugin, options)
  }
  async #addSucrasePlugin() {
    const {default: sucrasePlugin} = await import(`@rollup/plugin-sucrase`)
    const options = this.#getSucrasePluginOptions()
    /* eslint-disable @typescript-eslint/prefer-ts-expect-error */
    // @ts-ignore ts(2615)
    this.#builder.addRollupPlugin(sucrasePlugin, options)
  }
  async #addSwcPlugin() {
    const {default: swcPlugin} = await import(`@rollup/plugin-swc`)
    const options = this.#getSwcPluginOptions()
    /* eslint-disable @typescript-eslint/prefer-ts-expect-error */
    // @ts-ignore ts(2615)
    this.#builder.addRollupPlugin(swcPlugin, options)
  }
  async #addTsPlugin() {
    const {default: tsPlugin} = await import(`rollup-plugin-ts`)
    const options = this.#getTsPluginOptions()
    this.#builder.addRollupPlugin(tsPlugin, options)
  }
  async #addTypescriptPlugin() {
    const {default: typescriptPlugin} = await import(`@rollup/plugin-typescript`)
    const options = this.#getTypescriptPluginOptions()
    /* eslint-disable @typescript-eslint/prefer-ts-expect-error */
    // @ts-ignore ts(2615)
    this.#builder.addRollupPlugin(typescriptPlugin, options)
  }
  #getDtsBundleGeneratorPluginOptions() {
    const pluginOptions: DtsBundleGeneratorPluginOptions = {
      tsConfigFile: this.#builder.fromContextFolder(`tsconfig.json`),
      outputFile: this.options.declarationFile,
    }
    return pluginOptions
  }
  #getDtsPluginOptions() {
    const compilerOptions = this.#getTypescriptCompilerOptions()
    const pluginOptions: DtsPluginOptions = {
      respectExternal: false,
      compilerOptions: {
        ...compilerOptions,
        declaration: true,
      },
    } as DtsPluginOptions
    return pluginOptions
  }
  #getSucrasePluginOptions() {
    const pluginOptions: SucrasePluginOptions = {
      production: this.#builder.isProduction,
      exclude: [`node_modules/**`],
      transforms: [`typescript`],
    }
    return pluginOptions
  }
  #getSwcPluginOptions() {
    const pluginOptions: SwcPluginOptions = {
      swc: {
        root: this.#builder.contextFolder,
        cwd: this.#builder.contextFolder,
        envName: this.#builder.isProduction ? `production` : `development`,
        sourceMaps: true,
        jsc: {
          parser: {
            syntax: `typescript`,
            tsx: true,
            dynamicImport: true,
            decorators: true,
          },
          baseUrl: this.#builder.contextFolder,
          paths: this.#builder.tsconfig?.compilerOptions?.paths,
          transform: {
            legacyDecorator: true,
            decoratorMetadata: true,
          },
          target: `es2022`,
          keepClassNames: true,
        },
      },
    }
    return pluginOptions
  }
  #getTsPluginOptions() {
    const compilerOptions = this.#getTypescriptCompilerOptions()
    const pluginOptions: TsPluginOptions = {
      tsconfig: {
        fileName: this.#builder.fromContextFolder(`tsconfig.json`),
        hook: (loadedConfig: CompilerOptions) => {
          // @ts-expect-error
          const tsConfig: CompilerOptions = {
            ...loadedConfig,
            ...compilerOptions,
          }
          return tsConfig
        },
      },
      transpileOnly: true,
      transpiler: `typescript`,
      cwd: this.#builder.contextFolder,
      browserslist: false,
    }
    return pluginOptions
  }
  #getTypescriptCompilerOptions(): TsConfigJson['compilerOptions'] {
    return {
      module: `esnext`,
      moduleResolution: `bundler`,
      target: `es2022`,
      skipLibCheck: true,
      outDir: this.#builder.fromOutputFolder(`ts`),
      rootDir: this.#builder.contextFolder,
      baseUrl: this.#builder.contextFolder,
      strict: false,
      composite: false,
      declaration: false,
    }
  }
  #getTypescriptOptions(): TsConfigJson {
    const compilerOptions = this.#getTypescriptCompilerOptions()
    return {
      compilerOptions: {
        ...compilerOptions,
      },
    }
  }
  #getTypescriptPluginOptions(): TypescriptPluginOptions {
    const typescriptOptions = this.#getTypescriptOptions()
    return {
      ...typescriptOptions,
      tsconfig: this.#builder.fromContextFolder(`tsconfig.json`),
      cacheDir: this.#builder.fromContextFolder(`temp`, `.rollup_cache`),
    }
  }
}
