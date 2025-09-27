import defaultExport from '~/src/lib/defaultExport.js';
import namedExport from 'src/lib/namedExport.js';
const defaultExportModified = defaultExport * 2;
const namedExportModified = `${namedExport}b`;
// Exports
export { namedExportModified as namedExport };
export default defaultExportModified;
//# sourceMappingURL=index.js.map