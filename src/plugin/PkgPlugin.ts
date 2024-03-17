import type {ConfigBuilder, ConfigBuilderPlugin, HookMap} from '../ConfigBuilder.js'
import type {PackageJson} from 'type-fest'

import publishimoPlugin from 'src/plugin/rollupPlugin/publishimo.js'

export type Options = {
  pkg: PackageJson | string
}

export class PkgPlugin implements ConfigBuilderPlugin {
  options: Options
  pkg: PackageJson | undefined
  constructor(options: Partial<Options> = {}) {
    this.options = {
      pkg: `package.json`,
      ...options,
    }
  }
  apply(builder: ConfigBuilder, hooks: HookMap) {
    hooks.buildProduction.tap(PkgPlugin.name, () => {
      const publishimoOptions = {
        pkg: builder.fromContextFolder(`package.json`),
        fetchGithub: false,
        includeFields: [
          `dependencies`,
          `peerDependencies`,
          `peerDependenciesMeta`,
          `optionalDependencies`,
        ],
      }
      builder.addPlugin(publishimoPlugin, {
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
