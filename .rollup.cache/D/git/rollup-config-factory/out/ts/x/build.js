import { ConfigBuilder } from 'src/ConfigBuilder.js';
import jsonPlugin from '@rollup/plugin-json';
const builder = new ConfigBuilder({
    outputFolder: `out/package/${process.env.NODE_ENV}`,
});
builder.addRollupPlugin(jsonPlugin);
const config = await builder.build();
console.dir(config);
await builder.compile();
//# sourceMappingURL=build.js.map