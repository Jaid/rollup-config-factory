import type {TestContext} from '~/test/lib/types.js'
import type {Promisable} from 'type-fest'

import path from 'node:path'
import {fileURLToPath, pathToFileURL} from 'node:url'
import {promisify} from 'node:util'

import fs from 'fs-extra'
import {rollup} from 'rollup'

import {toCleanYamlFile} from '~/lib/toYaml.js'
import {ConfigBuilder} from '~/src/ConfigBuilder.js'
import {outputRollupStats} from '~/test/lib/outputRollupStats.js'

const thisFolder = path.dirname(fileURLToPath(import.meta.url))
const rootFolder = path.resolve(thisFolder, `..`, `..`)

export const fixturesFolder = path.join(rootFolder, `test`, `fixture`)
export const outputFolder = path.join(rootFolder, `out`, `fixture`)

export type FixtureConfig = {
  checkExport?: (value: unknown) => Promisable<void>
  configBuilder?: ((passedContext: Record<string, unknown>) => Promisable<ConfigBuilder>) | ConfigBuilder
  /**
   * @default 'main.js'
   */
  exportName?: string
}

export const runTest = async (testContext: TestContext) => {
  const id = testContext.name
  const {fixtureProject, env} = /^(?<fixtureProject>.+)-(?<env>.+)$/.exec(id)!.groups!
  const fixtureFolder = path.join(fixturesFolder, fixtureProject)
  const outputFixtureFolder = path.join(outputFolder, id)
  await fs.emptyDir(outputFixtureFolder)
  const outputCompilationFolder = path.join(outputFixtureFolder, `out`)
  const outputMetaFolder = path.join(outputFixtureFolder, `meta`)
  const fixtureConfigFile = path.join(fixtureFolder, `config.ts`)
  const fixtureConfigFileExists = await fs.pathExists(fixtureConfigFile)
  let fixtureConfig: FixtureConfig = {}
  if (fixtureConfigFileExists) {
    fixtureConfig = await import(pathToFileURL(fixtureConfigFile).toString()) as FixtureConfig
  }
  const context = {
    testContext,
    fixture: fixtureProject,
    id,
    env,
    fixtureFolder,
    outputCompilationFolder,
    outputMetaFolder,
    outputFixtureFolder,
  }
  let configBuilder: ConfigBuilder
  if (fixtureConfig.configBuilder instanceof ConfigBuilder) {
    configBuilder = fixtureConfig.configBuilder
  } else if (fixtureConfig.configBuilder !== undefined) {
    configBuilder = await fixtureConfig.configBuilder(context)
  } else {
    configBuilder = new ConfigBuilder({
      contextFolder: fixtureFolder,
      outputFolder: outputCompilationFolder,
      env,
    })
  }
  const config = await configBuilder.build()
  await fs.emptyDir(outputMetaFolder)
  const outputMetaFileJobs = [
    toCleanYamlFile(context, path.join(outputMetaFolder, `context.yml`)),
    toCleanYamlFile(config, path.join(outputMetaFolder, `config.yml`)),
  ]
  await Promise.all(outputMetaFileJobs)
  const compilation = await configBuilder.compile()
  // if (process.env.OUTPUT_STATS_JSON) {
  //   const statsInstance = rollupOutput.toJson()
  //   const statsFile = path.join(outputMetaFolder, `stats.json`)
  //   await fs.writeJson(statsFile, statsInstance)
  // }
  // if (process.env.OUTPUT_ROLLUP_STATS) {
  //   const statsFolder = path.join(outputMetaFolder, `stats`)
  //   const statsInstances = compilationResult.stats.map(stat => stat.toJson())
  //   await outputRollupStats(statsInstances, statsFolder)
  //   console.log(`Rollup stats wrote to ${statsFolder}`)
  // }
  // if (rollupOutput.hasErrors()) {
  //   for (const statsInstance of rollupOutput.stats) {
  //     for (const error of statsInstance.compilation.errors) {
  //       console.error(error)
  //     }
  //   }
  //   throw new Error(`Compilation finished with errors`)
  // }
  if (fixtureConfig.checkExport) {
    const exportName = fixtureConfig.exportName ?? `index.js`
    const mainFile = path.join(outputCompilationFolder, exportName)
    const exportValue = await import(pathToFileURL(mainFile).toString()) as {default: unknown}
    await toCleanYamlFile(exportValue, path.join(outputMetaFolder, `export.yml`))
    await fixtureConfig.checkExport(exportValue)
  }
}
