import type { ConfigBuilder, ConfigBuilderPlugin, Hooks } from '../ConfigBuilder.js';
export type Options = {};
export declare class ExternalsPlugin implements ConfigBuilderPlugin {
    #private;
    protected options: Options;
    constructor(options?: Partial<Options>);
    apply(builder: ConfigBuilder, hooks: Hooks): void;
}
