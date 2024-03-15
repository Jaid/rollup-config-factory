import type {Compiler, RollupPluginInstance} from 'rollup'

export class OutputConfigPlugin implements RollupPluginInstance {
  apply(compiler: Compiler) {
    compiler.hooks.beforeCompile.tap(`OutputConfigPlugin`, () => {
      console.dir(compiler.options)
    })
  }
}
