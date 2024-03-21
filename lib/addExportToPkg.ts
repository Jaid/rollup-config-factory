import type {PackageJson} from 'type-fest'

import * as immer from 'immer'

type ExportKind = "browser" | "default" | "import" | "node" | "node-addons" | "require" | "types"

export const addExportToPkg = (pkg: PackageJson, exportValue: string, exportKind: ExportKind = `default`, exportPath: string = `.`) => {
  return immer.produce(pkg, draft => {
    if (typeof draft.exports === `string`) {
      draft.exports = {
        ".": draft.exports,
      }
    }
    if (typeof draft.exports?.[`.`] === `string`) {
      draft.exports[`.`] = {
        default: draft.exports[`.`],
      }
    }
    if (!draft.exports || typeof draft.exports !== `object`) {
      draft.exports = {}
    }
    if (!draft.exports[exportPath] || typeof draft.exports[exportPath] !== `object`) {
      draft.exports[exportPath] = {}
    }
    const exportsForPath = draft.exports[exportPath] as Record<string, string>
    exportsForPath[exportKind] = exportValue
    /* eslint-disable @typescript-eslint/prefer-ts-expect-error */
    // @ts-ignore ts(2615)
    return draft
  })
}
