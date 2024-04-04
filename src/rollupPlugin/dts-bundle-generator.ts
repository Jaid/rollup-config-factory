import type {InputOptions} from 'more-types'
import type {Plugin, PluginContext} from 'rollup'

import {generateDtsBundle} from 'dts-bundle-generator'

type Options = InputOptions<{
  defaultsType: typeof defaultOptions
  optionalOptions: {
    tsConfigFile: string
  }
}>

const getEntry = (plugin: PluginContext) => {
  for (const id of plugin.getModuleIds()) {
    const moduleInfo = plugin.getModuleInfo(id)
    if (!moduleInfo) {
      continue
    }
    if (!moduleInfo.isEntry) {
      continue
    }
    const isTypescriptRegex = /\.[cm]?tsx?$/
    if (!isTypescriptRegex.test(moduleInfo.id)) {
      continue
    }
    return moduleInfo.id
  }
}
const defaultOptions = {
  sort: true,
  generatorBanner: false,
  inlinedImports: [
    `type-fest`,
    `ts-toolbelt`,
    `ts-essentials`,
    `utility-types`,
    `more-types`,
  ],
  outputFile: `types.d.ts`,
}

export default function dtsBundleGeneratorPlugin(pluginOptions: Options['parameter'] = {}): Plugin {
  const options: Options['merged'] = {
    ...defaultOptions,
    ...pluginOptions,
  }
  return {
    name: `dts-bundle-generator`,
    async generateBundle() {
      const entry = getEntry(this)
      if (!entry) {
        throw new Error(`No entry found, searched in ${[...this.getModuleIds()].length} modules`)
      }
      const generateDtsBundleOptions: Parameters<typeof generateDtsBundle>[1] = {
        preferredConfigPath: options.tsConfigFile,
      }
      const generateDtsBundleEntryOptions: Partial<Parameters<typeof generateDtsBundle>[0][0]> = {
        output: {
          sortNodes: options.sort,
          noBanner: !options.generatorBanner,
          exportReferencedTypes: false,
        },
        libraries: {
          inlinedLibraries: options.inlinedImports,
        },
      }
      const dtsEntry: Parameters<typeof generateDtsBundle>[0][0] = {
        ...generateDtsBundleEntryOptions,
        filePath: entry,
      }
      const dtsOutputs = generateDtsBundle([dtsEntry], generateDtsBundleOptions)
      if (dtsOutputs.length === 0) {
        return
      }
      if (dtsOutputs.length > 1) {
        throw new Error(`Expected only one dts output, but got ${dtsOutputs.length}`)
      }
      this.emitFile({
        type: `asset`,
        fileName: options.outputFile,
        source: dtsOutputs[0],
      })
    },
  }
}
