export class ExternalsPlugin {
    options;
    #builder;
    #externalsFilterByPkg = (source, importer, isResolved) => {
        if (!this.#builder?.pkg) {
            return;
        }
        const dependencyFields = [`dependencies`, `peerDependencies`, `optionalDependencies`, `devDependencies`];
        for (const field of dependencyFields) {
            for (const key of Object.keys(this.#builder.pkg[field] ?? {})) {
                console.dir(key);
                if (source === key) {
                    return true;
                }
                if (source.startsWith(`${key}/`)) {
                    return true;
                }
            }
        }
    };
    constructor(options = {}) {
        this.options = options;
    }
    apply(builder, hooks) {
        this.#builder = builder;
        hooks.build.tap(ExternalsPlugin.name, async () => {
            builder.set(`external`, this.#externalsFilterByPkg.bind(this));
        });
    }
}
//# sourceMappingURL=ExternalsPlugin.js.map