import type {Plugin} from 'rollup'
import type {InputOptions} from 'zeug/types'

type Options = InputOptions<{
  defaultsType: typeof defaultOptions
  requiredOptions: {
    name: string
  }
}>

const defaultOptions = {
  content: `` as string | Uint8Array,
}

export default function publishimoPlugin(pluginOptions: Options['parameter']): Plugin {
  if (!pluginOptions.name) {
    throw new Error(`option “name” is required for Rollup plugin emit-file`)
  }
  const options: Options['merged'] = {
    ...defaultOptions,
    ...pluginOptions,
  }
  return {
    name: `emit-file`,
    async generateBundle() {
      const source = options.content
      this.emitFile({
        type: `asset`,
        fileName: `package.json`,
        source,
      })
    },
  }
}
