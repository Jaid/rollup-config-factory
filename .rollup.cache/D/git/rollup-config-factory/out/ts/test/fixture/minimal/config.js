// @ts-nocheck
import assert from 'bun:assert';
import { ConfigBuilder } from '../../../src/ConfigBuilder.js';
export const configBuilder = context => {
    const builder = new ConfigBuilder({
        contextFolder: context.fixtureFolder,
        outputFolder: context.outputCompilationFolder,
        env: context.env,
        useDefaultPlugins: false,
    });
    return builder;
};
export const checkExport = value => {
    assert.strictEqual(value.default, 1);
};
//# sourceMappingURL=config.js.map
