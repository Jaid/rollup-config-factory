import {ConfigBuilder} from './src/ConfigBuilder.js'

const builder = new ConfigBuilder({
  outputFolder: `out/package/${process.env.NODE_ENV ?? `development`}`,
  externals: true,
})
const rollupConfig = await builder.build()
export default rollupConfig
