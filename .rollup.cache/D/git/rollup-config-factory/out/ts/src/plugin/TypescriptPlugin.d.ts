import type { ConfigBuilder, ConfigBuilderPlugin, Hooks } from '../ConfigBuilder.js';
import type { PackageJson, TsConfigJson } from 'type-fest';
import type { InputOptions } from 'zeug/types';
export type Options = InputOptions<{
    defaultsType: typeof defaultOptions;
    optionalOptions: {
        env: "development" | "production";
    };
}>;
declare const defaultOptions: {
    compiler: "typescript" | "rollup-plugin-ts" | "sucrase" | "swc";
    rewriteEntry: boolean;
    declarationEmitter: false | "dts-bundle-generator" | "rollup-plugin-dts" | undefined;
    declarationOnlyForProduction: boolean;
};
export declare class TypescriptPlugin implements ConfigBuilderPlugin {
    #private;
    protected options: Options['merged'];
    protected pkg: PackageJson | undefined;
    protected tsconfig: TsConfigJson | undefined;
    constructor(options?: Options['parameter']);
    apply(builder: ConfigBuilder, hooks: Hooks): void;
}
export {};
