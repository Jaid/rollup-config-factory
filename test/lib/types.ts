import type {ConfigBuilder} from 'src/ConfigBuilder.js'
import type {Promisable} from 'type-fest'

export type FixtureContext = {
  env: string
  fixture: string
  fixtureFolder: string
  id: string
  outputCompilationFolder: string
  outputFixtureFolder: string
  outputMetaFolder: string
}

export type FixtureConfig = {
  checkExport?: (value: unknown) => Promisable<void>
  configBuilder?: ((passedContext: FixtureContext) => Promisable<ConfigBuilder>) | ConfigBuilder
  /**
   * @default 'lib.js'
   */
  mainName?: string
}
