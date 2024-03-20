import {buildConfig} from 'src/index.js'

const rollupConfig = await buildConfig({
  outputFolder: `dist/package/${process.env.npm_package_name ?? `default`}/${process.env.NODE_ENV ?? `development`}`,
})

export default rollupConfig
