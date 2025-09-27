import { generateDtsBundle } from 'dts-bundle-generator';
const getEntry = (plugin) => {
    for (const id of plugin.getModuleIds()) {
        const moduleInfo = plugin.getModuleInfo(id);
        if (!moduleInfo) {
            continue;
        }
        if (!moduleInfo.isEntry) {
            continue;
        }
        const isTypescriptRegex = /\.[cm]?tsx?$/;
        if (!isTypescriptRegex.test(moduleInfo.id)) {
            continue;
        }
        return moduleInfo.id;
    }
};
const defaultOptions = {
    sort: true,
    generatorBanner: false,
};
export default function dtsBundleGeneratorPlugin(pluginOptions = {}) {
    const options = {
        ...defaultOptions,
        ...pluginOptions,
    };
    return {
        name: `dts-bundle-generator`,
        async generateBundle() {
            const entry = getEntry(this);
            if (!entry) {
                throw new Error(`No entry found, searched in ${[...this.getModuleIds()].length} modules`);
            }
            const generateDtsBundleOptions = {
                preferredConfigPath: options.tsConfigFile,
            };
            const generateDtsBundleEntryOptions = {
                output: {
                    sortNodes: options.sort,
                    noBanner: !options.generatorBanner,
                },
            };
            const dtsEntry = {
                ...generateDtsBundleEntryOptions,
                filePath: entry,
            };
            const dtsOutputs = generateDtsBundle([dtsEntry], generateDtsBundleOptions);
            if (dtsOutputs.length === 0) {
                return;
            }
            if (dtsOutputs.length > 1) {
                throw new Error(`Expected only one dts output, but got ${dtsOutputs.length}`);
            }
            this.emitFile({
                type: `asset`,
                fileName: `types.d.ts`,
                source: dtsOutputs[0],
            });
        },
    };
}
//# sourceMappingURL=dts-bundle-generator.js.map