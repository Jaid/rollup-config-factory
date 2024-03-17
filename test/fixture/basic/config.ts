// @ts-nocheck

import type {FixtureConfig} from '~/test/lib/types.js'

import assert from 'node:assert'

import {ConfigBuilder} from '~/src/ConfigBuilder.js'
import {CommonPlugin} from '~/src/plugin/CommonPlugin.js'
import {TypescriptPlugin} from '~/src/plugin/TypescriptPlugin.js'

export const configBuilder: FixtureConfig['configBuilder'] = context => {
  const builder = new ConfigBuilder({
    contextFolder: context.fixtureFolder,
    outputFolder: context.outputCompilationFolder,
    env: context.env,
    plugins: [
      new CommonPlugin,
      new TypescriptPlugin,
      // new PkgPlugin,
    ],
  })
  return builder
}

export const checkExport: FixtureConfig['checkExport'] = value => {
  assert.strictEqual(value.default, 2)
  assert.strictEqual(value.namedExport, `ab`)
}
