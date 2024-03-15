import assert from 'node:assert'

export const checkExport = value => {
  assert.strictEqual(value.default, 1)
}
