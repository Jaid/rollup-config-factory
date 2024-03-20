import type {ConfigBuilder, ConfigBuilderPlugin, Hooks} from '../ConfigBuilder.js'
import type {Options as TerserPluginOptions} from '@rollup/plugin-terser'
import type {InputOptions} from 'zeug/types'

import terserPlugin from '@rollup/plugin-terser'
import * as lodash from 'lodash-es'

type TerserOptions = import('terser').MinifyOptions
type Options = InputOptions<{
  defaultsType: typeof defaultOptions
  optionalOptions: {
    terserOptions: TerserOptions
    terserPluginOptions: TerserPluginOptions
  }
}>

const outputEcmaVersion: TerserOptions['ecma'] = 2020
const defaultTerserOptions: TerserOptions = {
  module: true,
  ecma: outputEcmaVersion,
  compress: {
    passes: 100,
    unsafe_comps: true,
    unsafe_math: true,
    unsafe_regexp: true,
    unsafe_undefined: true,
    booleans_as_integers: true,
    unsafe_Function: true,
    unsafe_methods: true,
    unsafe_proto: true,
    ecma: outputEcmaVersion,
  },
  format: {
    ecma: outputEcmaVersion,
    semicolons: false,
    wrap_func_args: false,
  },
}
const aggressiveTerserOptionsAdditions: TerserOptions = {
  compress: {
    keep_fargs: false,
    hoist_funs: true,
    pure_new: true,
    unsafe_arrows: true,
  },
}
const defaultOptions = {
  terserPreset: `default` as ('aggressive' | 'default'),
}
const map = new Map<Options['defaultsType']['terserPreset'], TerserOptions>([
  [`default`, defaultTerserOptions],
  [`aggressive`, lodash.defaultsDeep(aggressiveTerserOptionsAdditions, defaultTerserOptions)],
])
export class MinifyPlugin implements ConfigBuilderPlugin {
  options: Options['merged']
  #getTerserOptionsPreset = () => {
    return map.get(this.options.terserPreset) ?? defaultTerserOptions
  }
  #makeTerserOptions = () => {
    const preset = this.#getTerserOptionsPreset()
    if (this.options.terserOptions === undefined) {
      return preset
    }
    const options: TerserOptions = {
      ...preset,
      ...this.options.terserOptions,
    }
    return options
  }
  #makeTerserPluginOptions = (): TerserPluginOptions => {
    const options: TerserPluginOptions = this.#makeTerserOptions()
    if (this.options.terserPluginOptions === undefined) {
      return options
    }
    return {
      ...options,
      ...this.options.terserPluginOptions,
    }
  }
  constructor(options: Options['parameter'] = {}) {
    this.options = {
      ...defaultOptions,
      ...options,
    }
  }
  apply(builder: ConfigBuilder, hooks: Hooks) {
    hooks.buildProduction.tapPromise(MinifyPlugin.name, async () => {
      const pluginOptions = this.#makeTerserPluginOptions()
      /* eslint-disable @typescript-eslint/prefer-ts-expect-error */
      // @ts-ignore ts(2345)
      builder.addRollupPlugin(terserPlugin, pluginOptions)
    })
  }
}
