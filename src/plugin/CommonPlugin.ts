import type {ConfigBuilder, ConfigBuilderPlugin, Hooks} from '../ConfigBuilder.js'

export type Options = {}

export class CommonPlugin implements ConfigBuilderPlugin {
  protected options: Options
  constructor(options: Partial<Options> = {}) {
    this.options = options
  }
  apply(builder: ConfigBuilder, hooks: Hooks) {
    hooks.build.tapPromise(CommonPlugin.name, async () => {
      /* eslint-disable @typescript-eslint/prefer-ts-expect-error */
      // @ts-ignore ts(2615)
      builder.setDefault(`output.generatedCode.arrowFunctions`, true)
      builder.setDefault(`output.generatedCode.constBindings`, true)
      builder.setDefault(`output.generatedCode.objectShorthand`, true)
    })
    hooks.buildProduction.tap(CommonPlugin.name, () => {
      builder.setDefault(`output.sourcemap`, `hidden`)
    })
    hooks.buildDevelopment.tap(CommonPlugin.name, () => {
      builder.setDefault(`output.sourcemap`, `hidden`)
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
