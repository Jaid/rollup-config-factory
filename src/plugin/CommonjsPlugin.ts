import type {ConfigBuilder, ConfigBuilderPlugin, Hooks} from '../ConfigBuilder.js'

import commonjsPlugin from '@rollup/plugin-commonjs'

export type Options = {}

export class CommonjsPlugin implements ConfigBuilderPlugin {
  protected options: Options
  constructor(options: Partial<Options> = {}) {
    this.options = options
  }
  apply(builder: ConfigBuilder, hooks: Hooks) {
    hooks.build.tap(CommonjsPlugin.name, () => {
      /* eslint-disable @typescript-eslint/prefer-ts-expect-error */
      // @ts-ignore ts(2345)
      builder.addRollupPlugin(commonjsPlugin)
    })
  }
}
