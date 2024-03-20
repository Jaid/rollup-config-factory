import type {ConfigBuilder, ConfigBuilderPlugin, Hooks} from '../ConfigBuilder.js'

import publishimoPlugin from 'src/plugin/rollupPlugin/publishimo.js'

export class PkgPlugin implements ConfigBuilderPlugin {
  options
  constructor(options?: {}) {
    this.options = {}
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
        ],
      }
      builder.addRollupPlugin(publishimoPlugin, {
        publishimoOptions,
        extend: {
          main: `index.js`,
          type: `module`,
          types: `types.d.ts`,
        },
      })
    })
  }
}
