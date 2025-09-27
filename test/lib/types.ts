import type {describe, it} from 'bun:test'
import type {ConfigBuilder} from 'src/ConfigBuilder.js'
import type {Promisable} from 'type-fest'

export type TestFunction = NonNullable<Parameters<typeof it>[0]>
export type TestContext = Parameters<TestFunction>[0]
export type SuiteFunction = NonNullable<Parameters<typeof describe>[0]>
export type SuiteContext = Parameters<SuiteFunction>[0]

export type FixtureContext = {
  env: string
  fixture: string
  fixtureFolder: string
  id: string
  outputCompilationFolder: string
  outputFixtureFolder: string
  outputMetaFolder: string
  testContext: TestContext
}

export type FixtureConfig = {
  checkExport?: (value: unknown) => Promisable<void>
  configBuilder?: ((passedContext: FixtureContext) => Promisable<ConfigBuilder>) | ConfigBuilder
  /**
   * @default 'lib.js'
   */
  mainName?: string
}
