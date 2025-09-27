import type { ConfigBuilder, ConfigBuilderPlugin, Hooks } from '../ConfigBuilder.js';
import type { Options as TerserPluginOptions } from '@rollup/plugin-terser';
import type { InputOptions } from 'zeug/types';
type TerserOptions = import('terser').MinifyOptions;
type Options = InputOptions<{
    defaultsType: typeof defaultOptions;
    optionalOptions: {
        terserOptions: TerserOptions;
        terserPluginOptions: TerserPluginOptions;
    };
}>;
declare const defaultOptions: {
    terserPreset: "aggressive" | "default";
};
export declare class MinifyPlugin implements ConfigBuilderPlugin {
    #private;
    options: Options['merged'];
    constructor(options?: Options['parameter']);
    apply(builder: ConfigBuilder, hooks: Hooks): void;
}
export {};
