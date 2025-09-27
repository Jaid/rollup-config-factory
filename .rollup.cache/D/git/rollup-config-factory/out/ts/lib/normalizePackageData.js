import { cloneDeep } from 'lodash-es';
import originalNormalizePackageData from 'normalize-package-data';
export const normalizePackageData = (pkg) => {
    const newPkg = cloneDeep(pkg);
    originalNormalizePackageData(newPkg);
    return newPkg;
};
//# sourceMappingURL=normalizePackageData.js.map