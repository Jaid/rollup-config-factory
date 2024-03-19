import type {OutputOptions, Plugin, RollupBuild, RollupOptions, RollupOutput} from 'rollup'
import type {SyncHook} from 'tapable'
import type {Get, PackageJson, Paths, TsConfigJson} from 'type-fest'
import type {InputOptions} from 'zeug/types'

import fs from 'fs-extra'
import * as lodash from 'lodash-es'
import {rollup} from 'rollup'
import {AsyncSeriesHook, AsyncSeriesWaterfallHook, SyncWaterfallHook} from 'tapable'
import * as path from 'zeug/path'

import {debug} from 'lib/debug.js'
import {CommonPlugin} from 'src/plugin/CommonPlugin.js'
import {ExternalsPlugin} from 'src/plugin/ExternalsPlugin.js'
import {MinifyPlugin} from 'src/plugin/MinifyPlugin.js'
import {PkgPlugin} from 'src/plugin/PkgPlugin.js'
import {TypescriptPlugin} from 'src/plugin/TypescriptPlugin.js'

type PluginGenerator = (options?: unknown) => Plugin

// @ts-expect-error
export type Key = Paths<RollupOptions>
export type Options = InputOptions<{
  defaultsType: typeof defaultOptions
  optionalOptions: {
    plugins: Array<ConfigBuilderPlugin>
  }
}>

export interface ConfigBuilderPlugin {
  apply: (configBuilder: ConfigBuilder, hooks: Hooks) => void
}
export const hooks = {
  finalizeOptions: new SyncWaterfallHook<[Options['merged']]>([`options`]),
  init: new AsyncSeriesHook<[ConfigBuilder]>([`configBuilder`]),
  registerPkg: new AsyncSeriesHook<[PackageJson]>([`pkg`]),
  registerTsconfig: new AsyncSeriesHook<[TsConfigJson]>([`tsconfig`]),
  beforeBuild: new AsyncSeriesHook<[]>,
  build: new AsyncSeriesHook<[]>,
  buildDevelopment: new AsyncSeriesHook<[]>,
  buildProduction: new AsyncSeriesHook<[]>,
  buildStatic: new AsyncSeriesHook<[]>,
  buildWatch: new AsyncSeriesHook<[]>,
  afterBuild: new AsyncSeriesHook<[]>,
  finalizeConfig: new AsyncSeriesWaterfallHook<[RollupOptions]>([`config`]),
}
export type Hooks = typeof hooks
const defaultOptions = {
  contextFolder: `.`,
  env: process.env.NODE_ENV ?? `development`,
  outputFolder: `out/package`,
  useDefaultPlugins: true,
  minify: false as "aggressive" | boolean,
  externals: true as boolean,
}
export class ConfigBuilder {
  contextFolder: string
  hooks = new Map<string, AsyncSeriesHook<unknown> | AsyncSeriesWaterfallHook<unknown> | SyncHook<unknown> | SyncWaterfallHook<unknown>>
  options: Options['merged']
  outputFolder: string
  #isProduction: boolean
  #isWatch = false
  #pkg: PackageJson | undefined
  #rollupConfig: RollupOptions = {}
  #tsconfig: TsConfigJson | undefined
  constructor(options: Options['parameter'] = {}) {
    const mergedOptions = {
      ...defaultOptions,
      ...options,
    }
    if (mergedOptions.externals) {
      this.addBuilderPlugin(new ExternalsPlugin)
    }
    if (mergedOptions.useDefaultPlugins) {
      this.addBuilderPlugin(new TypescriptPlugin)
    }
    for (const plugin of mergedOptions.plugins ?? []) {
      this.addBuilderPlugin(plugin)
    }
    if (mergedOptions.minify) {
      const plugin = mergedOptions.minify === `aggressive` ? new MinifyPlugin({terserPreset: `aggressive`}) : new MinifyPlugin
      this.addBuilderPlugin(plugin)
    }
    if (mergedOptions.useDefaultPlugins) {
      this.addBuilderPlugin(new PkgPlugin)
      this.addBuilderPlugin(new CommonPlugin)
    }
    this.options = hooks.finalizeOptions.call(mergedOptions)
    this.#isProduction = this.options.env === `production`
    this.outputFolder = path.resolve(this.options.outputFolder)
    this.contextFolder = path.resolve(this.options.contextFolder)
  }
  get isDevelopment() {
    return !this.#isProduction
  }
  get isProduction() {
    return this.#isProduction
  }
  get isStatic() {
    return !this.#isWatch
  }
  get isWatch() {
    return this.#isWatch
  }
  get pkg() {
    return this.#pkg
  }
  get rollupConfig() {
    return this.#rollupConfig
  }
  get tsconfig() {
    return this.#tsconfig
  }
  addBuilderPlugin(plugin: ConfigBuilderPlugin) {
    plugin.apply(this, hooks)
  }
  addRollupPlugin<T extends PluginGenerator>(plugin: T, options?: Parameters<T>[0]) {
    if (options !== undefined) {
      const createdPlugin = plugin(options)
      debug(`Adding plugin %s with options %O`, createdPlugin.name, options)
      this.append(`plugins`, createdPlugin)
    } else {
      const createdPlugin = plugin()
      debug(`Adding plugin %s`, createdPlugin.name)
      this.append(`plugins`, createdPlugin)
    }
  }
  append(key: Key, value: unknown) {
    const array = this.getEnsuredArray(key)
    array.push(value)
  }
  appendUnique(key: Key, value: unknown) {
    const array = this.getEnsuredArray(key)
    if (!array.includes(value)) {
      array.push(value)
    }
  }
  async build() {
    await hooks.init.promise(this)
    const pkgFile = this.fromContextFolder(`package.json`)
    const pkgExists = await fs.pathExists(pkgFile)
    if (pkgExists) {
      const pkg = await fs.readJson(pkgFile) as PackageJson
      this.#pkg = pkg
      await hooks.registerPkg.promise(pkg)
    }
    const tsconfigFile = this.fromContextFolder(`tsconfig.json`)
    const tsconfigExists = await fs.pathExists(tsconfigFile)
    if (tsconfigExists) {
      const tsconfig = await fs.readJson(tsconfigFile) as TsConfigJson
      this.#tsconfig = tsconfig
      await hooks.registerTsconfig.promise(tsconfig)
    }
    await hooks.beforeBuild.promise()
    if (this.isDevelopment) {
      await hooks.buildDevelopment.promise()
    } else {
      await hooks.buildProduction.promise()
    }
    if (this.isWatch) {
      await hooks.buildWatch.promise()
    } else {
      await hooks.buildStatic.promise()
    }
    await hooks.build.promise()
    this.setDefault(`output.dir`, this.outputFolder)
    this.setDefault(`input`, this.fromContextFolder(`src`, `index.js`))
    await hooks.afterBuild.promise()
    const config = hooks.finalizeConfig.promise(this.#rollupConfig)
    return config
  }
  async compile() {
    let bundle: RollupBuild | undefined
    let output: RollupOutput | undefined
    try {
      bundle = await rollup(this.#rollupConfig)
      const outputOptions = this.#rollupConfig.output as OutputOptions
      output = await bundle.write(outputOptions)
      return {
        bundle,
        output,
      }
    } catch (error) {
      throw error
    } finally {
      await bundle?.close()
    }
  }
  fromContextFolder(...pathSegments: Array<string>) {
    return path.join(this.contextFolder, ...pathSegments)
  }
  fromOutputFolder(...pathSegments: Array<string>) {
    return path.join(this.outputFolder, ...pathSegments)
  }
  get<T extends Key>(key: T): Get<RollupOptions, T> {
    return lodash.get(this.#rollupConfig, key) as Get<RollupOptions, T>
  }
  getEnsuredArray(key: Key) {
    const array = this.get(key) as Array<unknown> | undefined
    if (Array.isArray(array)) {
      return array
    }
    const value = []
    this.set(key, value)
    return value
  }
  has(key: Key) {
    return lodash.has(this.#rollupConfig, key)
  }
  prepend(key: Key, value: unknown) {
    const array = this.getEnsuredArray(key)
    array.unshift(value)
  }
  prependUnique(key: Key, value: unknown) {
    const array = this.getEnsuredArray(key)
    if (!array.includes(value)) {
      array.unshift(value)
    }
  }
  set<T extends Key>(key: T, value: Get<RollupOptions, T>) {
    lodash.set(this.#rollupConfig, key, value)
  }
  setDefault<T extends Key>(key: T, value: Get<RollupOptions, T>) {
    if (!this.has(key)) {
      this.set(key, value)
    }
  }
}
