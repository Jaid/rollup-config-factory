// @ts-nocheck

import type {FixtureConfig} from '../../lib/types.js'

import assert from 'bun:assert'

import {ConfigBuilder} from '../../../src/ConfigBuilder.js'

export const configBuilder: FixtureConfig['configBuilder'] = context => {
  const builder = new ConfigBuilder({
    contextFolder: context.fixtureFolder,
    outputFolder: context.outputCompilationFolder,
    env: context.env,
    useDefaultPlugins: false,
  })
  return builder
}

export const checkExport: FixtureConfig['checkExport'] = value => {
  assert.strictEqual(value.default, 1)
}

export const mainName: FixtureConfig['mainName'] = `index.js`
