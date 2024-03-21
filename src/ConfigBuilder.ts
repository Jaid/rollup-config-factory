import type {OutputOptions, Plugin, RollupBuild, RollupOptions, RollupOutput} from 'rollup'
import type {Get, PackageJson, Paths, TsConfigJson} from 'type-fest'
import type {InputOptions} from 'zeug/types'

import fs from 'fs-extra'
import * as lodash from 'lodash-es'
import {rollup} from 'rollup'
import {AsyncSeriesHook, AsyncSeriesWaterfallHook, SyncWaterfallHook} from 'tapable'
import * as path from 'zeug/path'

import {debug} from 'lib/debug.js'
import {normalizePackageData} from 'lib/normalizePackageData.js'
import {CommonjsPlugin} from 'src/plugin/CommonjsPlugin.js'
import {CommonPlugin} from 'src/plugin/CommonPlugin.js'
import {ExternalsPlugin} from 'src/plugin/ExternalsPlugin.js'
import {LoadAssetsPlugin} from 'src/plugin/LoadAssetsPlugin.js'
import {MinifyPlugin} from 'src/plugin/MinifyPlugin.js'
import {PkgPlugin} from 'src/plugin/PkgPlugin.js'
import {TypescriptPlugin} from 'src/plugin/TypescriptPlugin.js'

type PluginGenerator = (options?: unknown) => Plugin

/* eslint-disable @typescript-eslint/prefer-ts-expect-error */
// @ts-ignore ts(2615)
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
export type Hooks = typeof ConfigBuilder.prototype.hooks
const nodeEnv = process.env.NODE_ENV ?? `development`
const defaultOptions = {
  contextFolder: `.`,
  env: nodeEnv,
  outputFolder: `dist/package/${process.env.npm_package_name ?? `default`}/${nodeEnv}`,
  useDefaultPlugins: true,
  minify: false as "aggressive" | boolean,
  externals: `node_modules` as "node_modules" | "pkg" | false | undefined,
}
export class ConfigBuilder {
  contextFolder: string
  hooks = {
    finalizeOptions: new SyncWaterfallHook<[Options['merged']]>([`options`]),
    init: new AsyncSeriesHook<[ConfigBuilder]>([`configBuilder`]),
    processPkg: new AsyncSeriesWaterfallHook<[PackageJson]>([`pkg`]),
    processTsconfig: new AsyncSeriesWaterfallHook<[TsConfigJson]>([`tsconfig`]),
    beforeBuild: new AsyncSeriesHook<[]>,
    build: new AsyncSeriesHook<[]>,
    buildDevelopment: new AsyncSeriesHook<[]>,
    buildProduction: new AsyncSeriesHook<[]>,
    buildStatic: new AsyncSeriesHook<[]>,
    buildWatch: new AsyncSeriesHook<[]>,
    afterBuild: new AsyncSeriesHook<[]>,
    finalizeConfig: new AsyncSeriesWaterfallHook<[RollupOptions]>([`config`]),
  }
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
    if (mergedOptions.useDefaultPlugins) {
      this.addBuilderPlugin(new CommonjsPlugin)
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
      this.addBuilderPlugin(new LoadAssetsPlugin)
      this.addBuilderPlugin(new PkgPlugin)
      this.addBuilderPlugin(new CommonPlugin)
    }
    this.options = this.hooks.finalizeOptions.call(mergedOptions)
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
    plugin.apply(this, this.hooks)
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
    await this.hooks.init.promise(this)
    const processPkgJob = this.#processPkg()
    const processTsconfigJob = this.#processTsconfig()
    await Promise.all([processPkgJob, processTsconfigJob])
    await this.hooks.beforeBuild.promise()
    if (this.isDevelopment) {
      await this.hooks.buildDevelopment.promise()
    } else {
      await this.hooks.buildProduction.promise()
    }
    if (this.isWatch) {
      await this.hooks.buildWatch.promise()
    } else {
      await this.hooks.buildStatic.promise()
    }
    await this.hooks.build.promise()
    this.setDefault(`output.dir`, this.outputFolder)
    this.setDefault(`input`, this.fromContextFolder(`src`, `index.js`))
    await this.hooks.afterBuild.promise()
    const config = this.hooks.finalizeConfig.promise(this.#rollupConfig)
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
  async #processPkg() {
    const file = this.fromContextFolder(`package.json`)
    const fileExists = await fs.pathExists(file)
    if (!fileExists) {
      return
    }
    const pkg = await fs.readJson(file) as PackageJson
    const pkgNormalized = normalizePackageData(pkg)
    const pkgModified = await this.hooks.processPkg.promise(pkgNormalized)
    const pkgModifiedNormalized = normalizePackageData(pkgModified)
    this.#pkg = pkgModifiedNormalized
  }
  async #processTsconfig() {
    const file = this.fromContextFolder(`tsconfig.json`)
    const fileExists = await fs.pathExists(file)
    if (!fileExists) {
      return
    }
    const tsconfig = await fs.readJson(file) as TsConfigJson
    this.#tsconfig = await this.hooks.processTsconfig.promise(tsconfig)
  }
}
