// @ts-nocheck

import type {FixtureConfig} from '~/test/lib/types.js'

import assert from 'node:assert'

import {MinifyPlugin} from 'src/plugin/MinifyPlugin.js'

import {ConfigBuilder} from '~/src/ConfigBuilder.js'
import {CommonPlugin} from '~/src/plugin/CommonPlugin.js'
import {PkgPlugin} from '~/src/plugin/PkgPlugin.js'
import {TypescriptPlugin} from '~/src/plugin/TypescriptPlugin.js'

export const configBuilder: FixtureConfig['configBuilder'] = context => {
  const builder = new ConfigBuilder({
    contextFolder: context.fixtureFolder,
    outputFolder: context.outputCompilationFolder,
    env: context.env,
    plugins: [
      new CommonPlugin,
      new TypescriptPlugin,
      new PkgPlugin,
      new MinifyPlugin({terserPreset: `aggressive`}),
    ],
  })
  return builder
}

export const checkExport: FixtureConfig['checkExport'] = value => {
  assert.strictEqual(value.default, `Hello, world!`)
  assert.strictEqual(value.msg, `Hello, world!`)
  assert.strictEqual(value.msgEscaped, `Hello, world!`)
  assert.strictEqual(value.test, 123)
}
