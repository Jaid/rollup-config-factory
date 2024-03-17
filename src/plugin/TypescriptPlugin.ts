import type {ConfigBuilder, ConfigBuilderPlugin, HookMap} from '../ConfigBuilder.js'
import type sucrasePlugin from '@rollup/plugin-sucrase'
import type swcPlugin from '@rollup/plugin-swc'
import type typescriptPlugin from '@rollup/plugin-typescript'
import type {default as dtsPlugin} from 'rollup-plugin-dts'
import type {default as tsPlugin} from 'rollup-plugin-ts'
import type {PackageJson, TsConfigJson} from 'type-fest'
import type {InputOptions} from 'zeug/types'

import {nodeResolve as nodeResolvePlugin} from '@rollup/plugin-node-resolve'
import dtsBundleGeneratorPlugin from 'src/plugin/rollupPlugin/dts-bundle-generator.js'
import {type CompilerOptions} from 'typescript'

type SwcPluginOptions = NonNullable<Parameters<typeof swcPlugin['default']>[0]>
type SucrasePluginOptions = NonNullable<Parameters<typeof sucrasePlugin['default']>[0]>
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
  compiler: `swc` as "rollup-plugin-ts" | "sucrase" | "swc" | "typescript",
  rewriteEntry: true,
  declarationEmitter: `dts-bundle-generator` as "dts-bundle-generator" | "rollup-plugin-dts" | false | undefined,
  declarationOnlyForProduction: true,
}

export class TypescriptPlugin implements ConfigBuilderPlugin {
  protected options: Options['merged']
  protected pkg: PackageJson | undefined
  #builder: ConfigBuilder
  constructor(options: Options['parameter'] = {}) {
    this.options = {
      ...defaultOptions,
      ...options,
    }
  }
  apply(builder: ConfigBuilder, hooks: HookMap) {
    this.#builder = builder
    hooks.build.tapPromise(TypescriptPlugin.name, async () => {
      const resolverOptions: NodeResolveOptions = {
        extensions: [`.js`, `.ts`],
      }
      builder.addPlugin(nodeResolvePlugin, resolverOptions)
      await this.#addCompilerPlugin()
      if (this.options.rewriteEntry) {
        if (builder.has(`input`)) {
          const inputFile = builder.get(`input`) as string
          if (inputFile.endsWith(`.js`)) {
            builder.set(`input`, inputFile.replace(/\.js$/, `.ts`))
          }
        } else {
          builder.setDefault(`input`, builder.fromContextFolder(`src/index.ts`))
        }
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
    this.#builder.addPlugin(dtsBundleGeneratorPlugin, options)
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
    this.#builder.addPlugin(dtsPlugin, options)
  }
  async #addSucrasePlugin() {
    const {default: sucrasePlugin} = await import(`@rollup/plugin-sucrase`)
    const options = this.#getSucrasePluginOptions()
    // @ts-expect-error
    this.#builder.addPlugin(sucrasePlugin, options)
  }
  async #addSwcPlugin() {
    const {default: swcPlugin} = await import(`@rollup/plugin-swc`)
    const options = this.#getSwcPluginOptions()
    // @ts-expect-error
    this.#builder.addPlugin(swcPlugin, options)
  }
  async #addTsPlugin() {
    const {default: tsPlugin} = await import(`rollup-plugin-ts`)
    const options = this.#getTsPluginOptions()
    this.#builder.addPlugin(tsPlugin, options)
  }
  async #addTypescriptPlugin() {
    const {default: typescriptPlugin} = await import(`@rollup/plugin-typescript`)
    const options = this.#getTypescriptPluginOptions()
    // @ts-expect-error
    this.#builder.addPlugin(typescriptPlugin, options)
  }
  #getDtsBundleGeneratorPluginOptions() {
    const pluginOptions: DtsBundleGeneratorPluginOptions = {
      tsConfigFile: this.#builder.fromContextFolder(`tsconfig.json`),
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
    }
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
    const typescriptOptions = this.#getTypescriptOptions()
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
      allowArbitraryExtensions: true,
      module: `esnext`,
      moduleResolution: `bundler`,
      declaration: true,
      target: `es2022`,
      skipLibCheck: true,
      outDir: this.#builder.fromOutputFolder(`types`),
      rootDir: this.#builder.fromContextFolder(`.`),
      strict: false,
    }
  }
  #getTypescriptOptions(): TsConfigJson {
    const compilerOptions = this.#getTypescriptCompilerOptions()
    return {
      compilerOptions: {
        ...compilerOptions,
      },
      // include: [this.#builder.fromContextFolder(`src/**/*`)],
    }
  }
  #getTypescriptPluginOptions(): TypescriptPluginOptions {
    const typescriptOptions = this.#getTypescriptOptions()
    return {
      ...typescriptOptions,
    }
  }
}
