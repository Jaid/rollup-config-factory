import type {Promisable} from 'type-fest'

import rollup from 'rollup'

const tapOptions = {
  name: `EmitFilePlugin`,
  stage: rollup.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
}

type ContentFactory = ((compilation: rollup.Compilation) => Promisable<Buffer | string>) | Buffer | string

/**
 * Roughly based on https://github.com/sindresorhus/add-asset-rollup-plugin/blob/22568102324806384412d9769cc4a027ba12c91c/index.js
 */
export class EmitFilePlugin implements rollup.RollupPluginInstance {
  content: ContentFactory
  file: string
  constructor(file: string, content: ContentFactory) {
    this.file = file
    this.content = content
  }
  apply(compiler: rollup.Compiler) {
    compiler.hooks.thisCompilation.tap(tapOptions.name, compilation => {
      compilation.hooks.processAssets.tapPromise(tapOptions, async () => {
        if (compilation.getAsset(this.file)) {
          return
        }
        const content = await this.#getContent(compilation)
        compilation.emitAsset(this.file, new rollup.sources.RawSource(content))
      })
    })
  }
  async #getContent(compilation: rollup.Compilation) {
    if (Buffer.isBuffer(this.content)) {
      return this.content
    }
    if (typeof this.content === `string`) {
      return this.content
    }
    return this.content(compilation)
  }
}
