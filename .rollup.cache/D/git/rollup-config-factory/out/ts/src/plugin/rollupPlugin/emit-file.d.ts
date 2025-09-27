import type { Plugin } from 'rollup';
import type { InputOptions } from 'zeug/types';
type Options = InputOptions<{
    defaultsType: typeof defaultOptions;
    requiredOptions: {
        name: string;
    };
}>;
declare const defaultOptions: {
    content: string | Uint8Array;
};
export default function publishimoPlugin(pluginOptions: Options['parameter']): Plugin;
export {};
