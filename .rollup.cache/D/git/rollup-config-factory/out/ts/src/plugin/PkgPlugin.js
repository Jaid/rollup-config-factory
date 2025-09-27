import publishimoPlugin from 'src/plugin/rollupPlugin/publishimo.js';
export class PkgPlugin {
    options;
    pkg;
    constructor(options) {
        this.options = {};
    }
    apply(builder, hooks) {
        hooks.buildProduction.tap(PkgPlugin.name, () => {
            const publishimoOptions = {
                pkg: builder.pkg,
                fetchGithub: false,
                includeFields: [
                    `dependencies`,
                    `peerDependencies`,
                    `peerDependenciesMeta`,
                    `optionalDependencies`,
                ],
            };
            builder.addRollupPlugin(publishimoPlugin, {
                publishimoOptions,
                extend: {
                    main: `index.js`,
                    type: `module`,
                    types: `types.d.ts`,
                },
            });
        });
    }
}
//# sourceMappingURL=PkgPlugin.js.map