const defaultOptions = {
    content: ``,
};
export default function publishimoPlugin(pluginOptions) {
    if (!pluginOptions.name) {
        throw new Error(`option “name” is required for Rollup plugin emit-file`);
    }
    const options = {
        ...defaultOptions,
        ...pluginOptions,
    };
    return {
        name: `emit-file`,
        async generateBundle() {
            const source = options.content;
            this.emitFile({
                type: `asset`,
                fileName: `package.json`,
                source,
            });
        },
    };
}
//# sourceMappingURL=emit-file.js.map