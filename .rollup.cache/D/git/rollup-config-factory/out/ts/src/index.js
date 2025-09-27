import { ConfigBuilder } from './ConfigBuilder.js';
export const buildConfig = async () => {
    const configBuilder = new ConfigBuilder;
    const rollupConfig = await configBuilder.build();
    return rollupConfig;
};
export default buildConfig;
//# sourceMappingURL=index.js.map