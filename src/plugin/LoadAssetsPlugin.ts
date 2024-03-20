import type {ConfigBuilder, ConfigBuilderPlugin, Hooks} from '../ConfigBuilder.js'
import type {InputOptions} from 'zeug/types'

import jsonPlugin from '@rollup/plugin-json'
import yamlPlugin from '@rollup/plugin-yaml'

/* eslint-disable @typescript-eslint/prefer-ts-expect-error */
// @ts-ignore ts(2339)
type JsonPluginOptions = NonNullable<Parameters<typeof jsonPlugin['default']>[0]>
/* eslint-disable @typescript-eslint/prefer-ts-expect-error */
// @ts-ignore ts(2339)
type YamlPluginOptions = NonNullable<Parameters<typeof yamlPlugin['default']>[0]>

export type Options = InputOptions<{
  readonly defaultsType: typeof defaultOptions
  readonly optionalOptions: {
    yamlOptions: false | YamlPluginOptions
  }
}>

const defaultOptions = {
  jsonOptions: {
    preferConst: true,
    indent: `  `,
  } as false | JsonPluginOptions | undefined,
}

export class LoadAssetsPlugin implements ConfigBuilderPlugin {
  protected options: Options['merged']
  constructor(options: Options['parameter'] = {}) {
    this.options = {
      ...defaultOptions,
      ...options,
    }
  }
  apply(builder: ConfigBuilder, hooks: Hooks) {
    hooks.build.tap(LoadAssetsPlugin.name, () => {
      if (this.options.jsonOptions !== false) {
      /* eslint-disable @typescript-eslint/prefer-ts-expect-error */
      // @ts-ignore ts(2345)
        builder.addRollupPlugin(jsonPlugin, this.options.jsonOptions)
      }
      if (this.options.yamlOptions !== false) {
      /* eslint-disable @typescript-eslint/prefer-ts-expect-error */
      // @ts-ignore ts(2345)
        builder.addRollupPlugin(yamlPlugin, this.options.yamlOptions)
      }
    })
  }
}
