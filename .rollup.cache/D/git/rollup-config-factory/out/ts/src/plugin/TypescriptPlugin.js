import { nodeResolve as nodeResolvePlugin } from '@rollup/plugin-node-resolve';
import dtsBundleGeneratorPlugin from 'src/plugin/rollupPlugin/dts-bundle-generator.js';
const defaultOptions = {
    compiler: `typescript`,
    rewriteEntry: true,
    declarationEmitter: `dts-bundle-generator`,
    declarationOnlyForProduction: true,
};
export class TypescriptPlugin {
    options;
    pkg;
    tsconfig;
    #builder;
    constructor(options = {}) {
        this.options = {
            ...defaultOptions,
            ...options,
        };
    }
    apply(builder, hooks) {
        this.#builder = builder;
        hooks.build.tapPromise(TypescriptPlugin.name, async () => {
            const resolverOptions = {
                extensions: [`.js`, `.ts`],
            };
            builder.addRollupPlugin(nodeResolvePlugin, resolverOptions);
            await this.#addCompilerPlugin();
        });
        hooks.finalizeConfig.tapPromise(TypescriptPlugin.name, async (config) => {
            if (!this.options.rewriteEntry) {
                return config;
            }
            if (typeof config.input === `string`) {
                if (config.input.endsWith(`.js`)) {
                    builder.set(`input`, `${config.input.slice(0, -3)}.ts`);
                }
            }
            else {
                builder.setDefault(`input`, builder.fromContextFolder(`src/index.ts`));
            }
        });
        hooks.buildProduction.tapPromise(TypescriptPlugin.name, async () => {
            await this.#addDtsEmitterPlugin();
        });
        hooks.buildDevelopment.tapPromise(TypescriptPlugin.name, async () => {
            if (!this.options.declarationOnlyForProduction) {
                await this.#addDtsEmitterPlugin();
            }
        });
    }
    async #addCompilerPlugin() {
        if (this.options.compiler === `rollup-plugin-ts`) {
            await this.#addTsPlugin();
        }
        else if (this.options.compiler === `sucrase`) {
            await this.#addSucrasePlugin();
        }
        else if (this.options.compiler === `swc`) {
            await this.#addSwcPlugin();
        }
        else {
            await this.#addTypescriptPlugin();
        }
    }
    async #addDtsBundleGeneratorPlugin() {
        const options = this.#getDtsBundleGeneratorPluginOptions();
        this.#builder.addRollupPlugin(dtsBundleGeneratorPlugin, options);
    }
    async #addDtsEmitterPlugin() {
        if (this.options.declarationEmitter === `dts-bundle-generator`) {
            await this.#addDtsBundleGeneratorPlugin();
        }
        else if (this.options.declarationEmitter === `rollup-plugin-dts`) {
            await this.#addDtsPlugin();
        }
    }
    async #addDtsPlugin() {
        const { default: dtsPlugin } = await import(`rollup-plugin-dts`);
        const options = this.#getDtsPluginOptions();
        this.#builder.addRollupPlugin(dtsPlugin, options);
    }
    async #addSucrasePlugin() {
        const { default: sucrasePlugin } = await import(`@rollup/plugin-sucrase`);
        const options = this.#getSucrasePluginOptions();
        // @ts-expect-error
        this.#builder.addRollupPlugin(sucrasePlugin, options);
    }
    async #addSwcPlugin() {
        const { default: swcPlugin } = await import(`@rollup/plugin-swc`);
        const options = this.#getSwcPluginOptions();
        // @ts-expect-error
        this.#builder.addRollupPlugin(swcPlugin, options);
    }
    async #addTsPlugin() {
        const { default: tsPlugin } = await import(`rollup-plugin-ts`);
        const options = this.#getTsPluginOptions();
        this.#builder.addRollupPlugin(tsPlugin, options);
    }
    async #addTypescriptPlugin() {
        const { default: typescriptPlugin } = await import(`@rollup/plugin-typescript`);
        const options = this.#getTypescriptPluginOptions();
        // @ts-expect-error
        this.#builder.addRollupPlugin(typescriptPlugin, options);
    }
    #getDtsBundleGeneratorPluginOptions() {
        const pluginOptions = {
            tsConfigFile: this.#builder.fromContextFolder(`tsconfig.json`),
        };
        return pluginOptions;
    }
    #getDtsPluginOptions() {
        const compilerOptions = this.#getTypescriptCompilerOptions();
        const pluginOptions = {
            respectExternal: false,
            compilerOptions: {
                ...compilerOptions,
                declaration: true,
            },
        };
        return pluginOptions;
    }
    #getSucrasePluginOptions() {
        const pluginOptions = {
            production: this.#builder.isProduction,
            exclude: [`node_modules/**`],
            transforms: [`typescript`],
        };
        return pluginOptions;
    }
    #getSwcPluginOptions() {
        const pluginOptions = {
            swc: {
                root: this.#builder.contextFolder,
                cwd: this.#builder.contextFolder,
                envName: this.#builder.isProduction ? `production` : `development`,
                sourceMaps: true,
                jsc: {
                    parser: {
                        syntax: `typescript`,
                        tsx: true,
                        dynamicImport: true,
                        decorators: true,
                    },
                    baseUrl: this.#builder.contextFolder,
                    paths: this.#builder.tsconfig?.compilerOptions?.paths,
                    transform: {
                        legacyDecorator: true,
                        decoratorMetadata: true,
                    },
                    target: `es2022`,
                    keepClassNames: true,
                },
            },
        };
        return pluginOptions;
    }
    #getTsPluginOptions() {
        const compilerOptions = this.#getTypescriptCompilerOptions();
        const pluginOptions = {
            tsconfig: {
                fileName: this.#builder.fromContextFolder(`tsconfig.json`),
                hook: (loadedConfig) => {
                    // @ts-expect-error
                    const tsConfig = {
                        ...loadedConfig,
                        ...compilerOptions,
                    };
                    return tsConfig;
                },
            },
            transpileOnly: true,
            transpiler: `typescript`,
            cwd: this.#builder.contextFolder,
            browserslist: false,
        };
        return pluginOptions;
    }
    #getTypescriptCompilerOptions() {
        return {
            module: `esnext`,
            moduleResolution: `bundler`,
            target: `es2022`,
            skipLibCheck: true,
            outDir: this.#builder.fromOutputFolder(`ts`),
            rootDir: this.#builder.contextFolder,
            baseUrl: this.#builder.contextFolder,
            strict: false,
            composite: false,
            declaration: false,
        };
    }
    #getTypescriptOptions() {
        const compilerOptions = this.#getTypescriptCompilerOptions();
        return {
            compilerOptions: {
                ...compilerOptions,
            },
        };
    }
    #getTypescriptPluginOptions() {
        const typescriptOptions = this.#getTypescriptOptions();
        return {
            ...typescriptOptions,
            tsconfig: this.#builder.fromContextFolder(`tsconfig.json`),
            cacheDir: this.#builder.fromContextFolder(`temp`, `.rollup_cache`),
        };
    }
}
//# sourceMappingURL=TypescriptPlugin.js.map