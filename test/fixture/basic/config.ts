// @ts-nocheck
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */

import type {FixtureConfig} from '../../lib/types.js'

import assert from 'bun:assert'

export const checkExport: FixtureConfig['checkExport'] = value => {
  assert.strictEqual(value.default, 2)
  assert.strictEqual(value.namedExport, `ab`)
}
