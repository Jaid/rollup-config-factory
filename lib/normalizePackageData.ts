import type {PackageJson} from 'type-fest'

import {cloneDeep} from 'lodash-es'
import originalNormalizePackageData from 'normalize-package-data'

export const normalizePackageData = (pkg: PackageJson) => {
  const newPkg = cloneDeep(pkg)
  originalNormalizePackageData(newPkg)
  return newPkg
}
