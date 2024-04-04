import type {ConfigBuilder, ConfigBuilderPlugin, Hooks} from '../ConfigBuilder.js'
import type {InputOptions} from 'more-types'

import publishimoPlugin from 'src/rollupPlugin/publishimo.js'

type Options = InputOptions<{
  defaultsType: typeof defaultOptions
}>

const defaultOptions = {
  includeFields: [
    `dependencies`,
    `peerDependencies`,
    `peerDependenciesMeta`,
    `optionalDependencies`,
    `exports`,
  ],
}

export class PkgPlugin implements ConfigBuilderPlugin {
  options: Options['merged']
  constructor(options: Options['parameter'] = {}) {
    this.options = {
      ...defaultOptions,
      ...options,
    }
  }
  apply(builder: ConfigBuilder, hooks: Hooks) {
    hooks.buildProduction.tap(PkgPlugin.name, () => {
      const publishimoOptions = {
        pkg: builder.pkg,
        fetchGithub: false,
        includeFields: [
          `dependencies`,
          `peerDependencies`,
          `peerDependenciesMeta`,
          `optionalDependencies`,
          `exports`,
        ],
      }
      builder.addRollupPlugin(publishimoPlugin, {
        publishimoOptions,
        extend: {
          type: `module`,
        },
      })
    })
  }
}
