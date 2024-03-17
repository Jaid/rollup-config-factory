import type {Plugin, PluginContext} from 'rollup'
import type {Entry, PackageJson} from 'type-fest'
import type {InputOptions} from 'zeug/types'

import {generateDtsBundle} from 'dts-bundle-generator'
import {default as publishimo} from 'publishimo'

type Options = InputOptions<{
  defaultsType: typeof defaultOptions
  optionalOptions: {
    extend: PackageJson
    publishimoOptions: Parameters<typeof publishimo>[0]
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
  pretty: false,
}

export default function publishimoPlugin(pluginOptions: Options['parameter'] = {}): Plugin {
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
      const publishimoResult = await publishimo.default(options.publishimoOptions)
      console.dir(publishimoResult)
      const outputPkg = {
        ...publishimoResult.generatedPkg,
        ...options.extend,
      }
      const json = options.pretty ? JSON.stringify(outputPkg, null, 2) : JSON.stringify(outputPkg)
      this.emitFile({
        type: `asset`,
        fileName: `package.json`,
        source: json,
      })
    },
  }
}
