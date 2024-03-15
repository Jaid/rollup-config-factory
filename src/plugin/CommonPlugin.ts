import type {ConfigBuilder, ConfigBuilderPlugin, HookMap} from '../ConfigBuilder.js'
import type {PackageJson} from 'type-fest'

export type Options = {
  pkg?: PackageJson | string
}

export class CommonPlugin implements ConfigBuilderPlugin {
  protected options: Options
  protected pkg: PackageJson | undefined
  constructor(options: Partial<Options> = {}) {
    this.options = options
  }
  apply(builder: ConfigBuilder, hooks: HookMap) {
    hooks.setDefaultOptions.tap(CommonPlugin.name, defaultOptions => {
      return {
        ...defaultOptions,
        outputFolder: `out/package/{{mode}}`,
      }
    })
    hooks.build.tapPromise(CommonPlugin.name, async () => {
      builder.setDefault(`output.generatedCode.arrowFunctions`, true)
      builder.setDefault(`output.generatedCode.constBindings`, true)
      builder.setDefault(`output.generatedCode.objectShorthand`, true)
    })
    hooks.buildProduction.tap(CommonPlugin.name, () => {
      builder.setDefault(`output.sourcemap`, `hidden`)
    })
    hooks.buildDevelopment.tap(CommonPlugin.name, () => {
      builder.setDefault(`output.sourcemap`, `inline`)
    })
    hooks.finalizeOptions.tap(CommonPlugin.name, options => {
      if (!options.outputFolder.includes(`{{mode}}`)) {
        return options
      }
      const mode = options.env === `production` ? `production` : `development`
      return {
        ...options,
        outputFolder: options.outputFolder.replaceAll(`{{mode}}`, mode),
      }
    })
  }
}
