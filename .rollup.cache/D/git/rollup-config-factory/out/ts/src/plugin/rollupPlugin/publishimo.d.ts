import type { Plugin } from 'rollup';
import type { PackageJson } from 'type-fest';
import type { InputOptions } from 'zeug/types';
import { default as publishimo } from 'publishimo';
type Options = InputOptions<{
    defaultsType: typeof defaultOptions;
    optionalOptions: {
        extend: PackageJson;
        publishimoOptions: Parameters<typeof publishimo>[0];
    };
}>;
declare const defaultOptions: {
    pretty: boolean;
};
export default function publishimoPlugin(pluginOptions?: Options['parameter']): Plugin;
export {};
