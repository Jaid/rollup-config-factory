import type {ConfigBuilder, ConfigBuilderPlugin, Hooks} from '../ConfigBuilder.js'
import type {RollupOptions} from 'rollup'
import type {InputOptions} from 'zeug/types'

import {findUp} from 'find-up'
import {globby} from 'globby'

export type Options = InputOptions<{
  defaultsType: typeof defaultOptions
}>

export type ExternalsFilterFunction = Exclude<NonNullable<RollupOptions['external']>, Array<RegExp | string> | RegExp | string | void | null | undefined>

const defaultOptions = {
  filterStrategy: `node_modules` as "node_modules" | "pkg",
}

export class ExternalsPlugin implements ConfigBuilderPlugin {
  static #getPackageNameFromSource(source: string) {
    const moduleParts = source.split(`/`)
    const relevantLength = source.startsWith(`@`) ? 2 : 1
    if (moduleParts.length < relevantLength) {
      return moduleParts[0]
    }
    const relevantParts = moduleParts.slice(0, relevantLength)
    return relevantParts.join(`/`)
  }
  protected options: Options['merged']
  #builder: ConfigBuilder | undefined
  #cache = new Set<string>
  constructor(options: Options['parameter'] = {}) {
    this.options = {
      ...defaultOptions,
      ...options,
    }
  }
  apply(builder: ConfigBuilder, hooks: Hooks) {
    this.#builder = builder
    hooks.build.tapPromise(ExternalsPlugin.name, async () => {
      const filter = await this.#prepareFilter()
      builder.set(`external`, filter)
    })
  }
  #externalsFilterByCache(source: string, importer: string, isResolved: boolean) {
    const sourcePackage = ExternalsPlugin.#getPackageNameFromSource(source)
    return this.#cache.has(sourcePackage)
  }
  async #prepareFilter() {
    if (this.options.filterStrategy === `pkg`) {
      return this.#prepareFilterByPkg()
    }
    return this.#prepareFilterByNodeModules()
  }
  async #prepareFilterByNodeModules() {
    const nodeModulesFolder = await findUp(`node_modules`, {
      type: `directory`,
    })
    if (!nodeModulesFolder) {
      return
    }
    const nodeModulesFolderNames = await globby(`*`, {
      onlyDirectories: true,
      cwd: nodeModulesFolder,
    })
    for (const folderName of nodeModulesFolderNames) {
      if (folderName.startsWith(`.`)) {
        continue
      }
      if (folderName.startsWith(`@`)) {
        const subFolderNames = await globby(`*`, {
          onlyDirectories: true,
          cwd: `${nodeModulesFolder}/${folderName}`,
        })
        for (const subFolderName of subFolderNames) {
          this.#cache.add(`${folderName}/${subFolderName}`)
        }
        continue
      }
      this.#cache.add(folderName)
    }
    return this.#externalsFilterByCache.bind(this)
  }
  async #prepareFilterByPkg() {
    if (!this.#builder?.pkg) {
      return
    }
    const dependencyFields = [`dependencies`, `peerDependencies`, `optionalDependencies`, `devDependencies`]
    for (const field of dependencyFields) {
      for (const key of Object.keys(this.#builder.pkg[field] ?? {})) {
        this.#cache.add(key)
      }
    }
    return this.#externalsFilterByCache.bind(this)
  }
}
