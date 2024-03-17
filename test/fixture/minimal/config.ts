// @ts-nocheck

import type {FixtureConfig} from '~/test/lib/types.js'

import assert from 'node:assert'

export const checkExport: FixtureConfig['checkExport'] = value => {
  assert.strictEqual(value.default, 1)
}
