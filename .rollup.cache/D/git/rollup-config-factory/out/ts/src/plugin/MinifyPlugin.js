import terserPlugin from '@rollup/plugin-terser';
import * as lodash from 'lodash-es';
const outputEcmaVersion = 2020;
const defaultTerserOptions = {
    module: true,
    ecma: outputEcmaVersion,
    compress: {
        passes: 100,
        unsafe_comps: true,
        unsafe_math: true,
        unsafe_regexp: true,
        unsafe_undefined: true,
        booleans_as_integers: true,
        unsafe_Function: true,
        unsafe_methods: true,
        unsafe_proto: true,
        ecma: outputEcmaVersion,
    },
    format: {
        ecma: outputEcmaVersion,
        semicolons: false,
        wrap_func_args: false,
    },
};
const aggressiveTerserOptionsAdditions = {
    compress: {
        keep_fargs: false,
        hoist_funs: true,
        pure_new: true,
        unsafe_arrows: true,
    },
};
const defaultOptions = {
    terserPreset: `default`,
};
const map = new Map([
    [`default`, defaultTerserOptions],
    [`aggressive`, lodash.defaultsDeep(aggressiveTerserOptionsAdditions, defaultTerserOptions)],
]);
export class MinifyPlugin {
    options;
    #getTerserOptionsPreset = () => {
        return map.get(this.options.terserPreset) ?? defaultTerserOptions;
    };
    #makeTerserOptions = () => {
        const preset = this.#getTerserOptionsPreset();
        if (this.options.terserOptions === undefined) {
            return preset;
        }
        const options = {
            ...preset,
            ...this.options.terserOptions,
        };
        return options;
    };
    #makeTerserPluginOptions = () => {
        const options = this.#makeTerserOptions();
        if (this.options.terserPluginOptions === undefined) {
            return options;
        }
        return {
            ...options,
            ...this.options.terserPluginOptions,
        };
    };
    constructor(options = {}) {
        this.options = {
            ...defaultOptions,
            ...options,
        };
    }
    apply(builder, hooks) {
        hooks.buildProduction.tapPromise(MinifyPlugin.name, async () => {
            const pluginOptions = this.#makeTerserPluginOptions();
            builder.addRollupPlugin(terserPlugin, pluginOptions);
        });
    }
}
//# sourceMappingURL=MinifyPlugin.js.map