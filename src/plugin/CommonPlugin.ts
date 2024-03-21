import type {ConfigBuilder, ConfigBuilderPlugin, Hooks} from '../ConfigBuilder.js'
import type {RollupOptions} from 'rollup'

import {addExportToPkg} from 'lib/addExportToPkg.js'

type EntryFileNamesFunction = Exclude<Exclude<RollupOptions['output'], Array<any> | undefined>['entryFileNames'], string | undefined>

export type Options = {}

const entryFileNamesProduction: EntryFileNamesFunction = chunkInfo => {
  if (chunkInfo.name === `index`) {
    return `lib.js`
  }
  return `[name].js`
}

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
      builder.setDefault(`output.entryFileNames`, entryFileNamesProduction)
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
    /* eslint-disable @typescript-eslint/prefer-ts-expect-error */
    // @ts-ignore ts(2615)
    hooks.processPkg.tap(CommonPlugin.name, pkg => {
      const pkgWithEsExport = addExportToPkg(pkg, `./lib.js`, `import`)
      const pkgWithDefaultExport = addExportToPkg(pkgWithEsExport, `./lib.js`)
      return pkgWithDefaultExport
    })
  }
}
