export class CommonPlugin {
    options;
    pkg;
    constructor(options = {}) {
        this.options = options;
    }
    apply(builder, hooks) {
        hooks.build.tapPromise(CommonPlugin.name, async () => {
            builder.setDefault(`output.generatedCode.arrowFunctions`, true);
            builder.setDefault(`output.generatedCode.constBindings`, true);
            builder.setDefault(`output.generatedCode.objectShorthand`, true);
        });
        hooks.buildProduction.tap(CommonPlugin.name, () => {
            builder.setDefault(`output.sourcemap`, `hidden`);
        });
        hooks.buildDevelopment.tap(CommonPlugin.name, () => {
            builder.setDefault(`output.sourcemap`, `hidden`);
        });
        hooks.finalizeOptions.tap(CommonPlugin.name, options => {
            if (!options.outputFolder.includes(`{{mode}}`)) {
                return options;
            }
            const mode = options.env === `production` ? `production` : `development`;
            return {
                ...options,
                outputFolder: options.outputFolder.replaceAll(`{{mode}}`, mode),
            };
        });
    }
}
//# sourceMappingURL=CommonPlugin.js.map