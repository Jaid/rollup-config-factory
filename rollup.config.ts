import {buildConfig} from 'src/index.js'

const rollupConfig = await buildConfig({
  outputFolder: `out/package/${process.env.NODE_ENV ?? `development`}`,
  externals: true,
})

export default rollupConfig
