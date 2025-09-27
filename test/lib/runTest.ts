import type {FixtureConfig, TestContext} from '~/test/lib/types.js'

import {fileURLToPath, pathToFileURL} from 'bun:url'

import * as path from 'forward-slash-path'
import fs from 'fs-extra'
import * as lodash from 'lodash-es'
import {toCleanYamlFile} from 'zeug'

import {endTiming, startTiming} from '~/test/lib/debug.js'
import {ConfigBuilder} from 'src/ConfigBuilder.js'

const thisFolder = path.dirname(fileURLToPath(import.meta.url))
const rootFolder = path.resolve(thisFolder, `..`, `..`)

export const fixturesFolder = path.join(rootFolder, `test`, `fixture`)
export const outputFolder = path.join(rootFolder, `out`, `fixture`)

export const runTest = async (id: string) => {
  console.log('id:', id)
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
    testContext: {} as TestContext,
    fixture: fixtureProject,
    id,
    env,
    fixtureFolder,
    outputCompilationFolder,
    outputMetaFolder,
    outputFixtureFolder,
  }
  startTiming(`ConfigBuilder`)
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
  endTiming(`ConfigBuilder`)
  const outputMetaFileJobs: Array<Promise<void>> = []
  const outputMeta = async (outputId: string, value: unknown) => {
    if (!process.env.OUTPUT_META) {
      return
    }
    const requestedOutputs = process.env.OUTPUT_META.split(`,`)
    if (!requestedOutputs.includes(`*`) && !requestedOutputs.includes(outputId)) {
      return
    }
    const file = path.join(outputMetaFolder, `${outputId}.yml`)
    if (outputMetaFileJobs.length === 0) {
      await fs.emptyDir(outputMetaFolder)
    }
    outputMetaFileJobs.push(toCleanYamlFile(value, file))
  }
  try {
    await outputMeta(`env`, process.env)
    await outputMeta(`context`, context)
    await outputMeta(`config`, config)
    startTiming(`rollup`)
    const compilation = await configBuilder.compile()
    endTiming(`rollup`)
    await outputMeta(`compilation`, compilation)
    await outputMeta(`builder`, lodash.clone(configBuilder))
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
      const exportName = fixtureConfig.mainName ?? `lib.js`
      const mainFile = path.join(outputCompilationFolder, exportName)
      const exportValue = await import(pathToFileURL(mainFile).toString()) as {default: unknown}
      await outputMeta(`export`, exportValue)
      await fixtureConfig.checkExport(exportValue)
    }
  } finally {
    await Promise.all(outputMetaFileJobs)
  }
}
