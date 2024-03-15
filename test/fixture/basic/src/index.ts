import defaultExport from './lib/defaultExport.js'
import namedExport from './lib/namedExport.js'

const defaultExportModified = defaultExport * 2
const namedExportModified = `${namedExport}b`

export {namedExportModified as namedExport}
export default defaultExportModified
