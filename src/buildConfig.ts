import {ConfigBuilder} from './ConfigBuilder.js'

export const buildConfig = async (options?: ConstructorParameters<typeof ConfigBuilder>[0]) => {
  const configBuilder = new ConfigBuilder(options)
  const rollupConfig = await configBuilder.build()
  return rollupConfig
}
