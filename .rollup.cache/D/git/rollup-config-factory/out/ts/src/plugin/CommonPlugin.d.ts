import type { ConfigBuilder, ConfigBuilderPlugin, Hooks } from '../ConfigBuilder.js';
import type { PackageJson } from 'type-fest';
export type Options = {};
export declare class CommonPlugin implements ConfigBuilderPlugin {
    protected options: Options;
    protected pkg: PackageJson | undefined;
    constructor(options?: Partial<Options>);
    apply(builder: ConfigBuilder, hooks: Hooks): void;
}
