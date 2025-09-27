import type { Plugin, RollupBuild, RollupOptions, RollupOutput } from 'rollup';
import type { SyncHook } from 'tapable';
import type { Get, PackageJson, Paths, TsConfigJson } from 'type-fest';
import type { InputOptions } from 'zeug/types';
import { AsyncSeriesHook, AsyncSeriesWaterfallHook, SyncWaterfallHook } from 'tapable';
type PluginGenerator = (options?: unknown) => Plugin;
export type Key = Paths<RollupOptions>;
export type Options = InputOptions<{
    defaultsType: typeof defaultOptions;
    optionalOptions: {
        plugins: Array<ConfigBuilderPlugin>;
    };
}>;
export interface ConfigBuilderPlugin {
    apply: (configBuilder: ConfigBuilder, hooks: Hooks) => void;
}
export declare const hooks: {
    finalizeOptions: SyncWaterfallHook<[{
        contextFolder: string;
        env: string;
        outputFolder: string;
        useDefaultPlugins: boolean;
        minify: boolean | "aggressive";
        plugins?: ConfigBuilderPlugin[] | undefined;
    }], import("tapable").UnsetAdditionalOptions>;
    init: AsyncSeriesHook<[ConfigBuilder], import("tapable").UnsetAdditionalOptions>;
    registerPkg: AsyncSeriesHook<[PackageJson], import("tapable").UnsetAdditionalOptions>;
    registerTsconfig: AsyncSeriesHook<[TsConfigJson], import("tapable").UnsetAdditionalOptions>;
    beforeBuild: AsyncSeriesHook<[], import("tapable").UnsetAdditionalOptions>;
    build: AsyncSeriesHook<[], import("tapable").UnsetAdditionalOptions>;
    buildDevelopment: AsyncSeriesHook<[], import("tapable").UnsetAdditionalOptions>;
    buildProduction: AsyncSeriesHook<[], import("tapable").UnsetAdditionalOptions>;
    buildStatic: AsyncSeriesHook<[], import("tapable").UnsetAdditionalOptions>;
    buildWatch: AsyncSeriesHook<[], import("tapable").UnsetAdditionalOptions>;
    afterBuild: AsyncSeriesHook<[], import("tapable").UnsetAdditionalOptions>;
    finalizeConfig: AsyncSeriesWaterfallHook<[RollupOptions], import("tapable").UnsetAdditionalOptions>;
};
export type Hooks = typeof hooks;
declare const defaultOptions: {
    contextFolder: string;
    env: string;
    outputFolder: string;
    useDefaultPlugins: boolean;
    minify: boolean | "aggressive";
};
export declare class ConfigBuilder {
    #private;
    contextFolder: string;
    hooks: Map<string, AsyncSeriesHook<unknown, import("tapable").UnsetAdditionalOptions> | AsyncSeriesWaterfallHook<unknown, import("tapable").UnsetAdditionalOptions> | SyncHook<unknown, void, import("tapable").UnsetAdditionalOptions> | SyncWaterfallHook<unknown, import("tapable").UnsetAdditionalOptions>>;
    options: Options['merged'];
    outputFolder: string;
    constructor(options?: Options['parameter']);
    get isDevelopment(): boolean;
    get isProduction(): boolean;
    get isStatic(): boolean;
    get isWatch(): boolean;
    get pkg(): PackageJson | undefined;
    get rollupConfig(): RollupOptions;
    get tsconfig(): TsConfigJson | undefined;
    addBuilderPlugin(plugin: ConfigBuilderPlugin): void;
    addRollupPlugin<T extends PluginGenerator>(plugin: T, options?: Parameters<T>[0]): void;
    append(key: Key, value: unknown): void;
    appendUnique(key: Key, value: unknown): void;
    build(): Promise<RollupOptions>;
    compile(): Promise<{
        bundle: RollupBuild;
        output: RollupOutput;
    }>;
    fromContextFolder(...pathSegments: Array<string>): string;
    fromOutputFolder(...pathSegments: Array<string>): string;
    get<T extends Key>(key: T): Get<RollupOptions, T>;
    getEnsuredArray(key: Key): unknown[];
    has(key: Key): boolean;
    prepend(key: Key, value: unknown): void;
    prependUnique(key: Key, value: unknown): void;
    set<T extends Key>(key: T, value: Get<RollupOptions, T>): void;
    setDefault<T extends Key>(key: T, value: Get<RollupOptions, T>): void;
}
export {};
