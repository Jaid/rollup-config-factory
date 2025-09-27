import type { ConfigBuilder, ConfigBuilderPlugin, Hooks } from '../ConfigBuilder.js';
import type { PackageJson } from 'type-fest';
export declare class PkgPlugin implements ConfigBuilderPlugin {
    options: any;
    pkg: PackageJson | undefined;
    constructor(options?: {});
    apply(builder: ConfigBuilder, hooks: Hooks): void;
}
