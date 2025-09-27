import type { Plugin } from 'rollup';
import type { InputOptions } from 'zeug/types';
type Options = InputOptions<{
    defaultsType: typeof defaultOptions;
    optionalOptions: {
        tsConfigFile: string;
    };
}>;
declare const defaultOptions: {
    sort: boolean;
    generatorBanner: boolean;
};
export default function dtsBundleGeneratorPlugin(pluginOptions?: Options['parameter']): Plugin;
export {};
