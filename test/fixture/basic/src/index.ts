import defaultExport from '~/src/lib/defaultExport.js'
import namedExport from 'src/lib/namedExport.js'

const defaultExportModified: number = defaultExport * 2
const namedExportModified: string = `${namedExport}b`

// Exports
export {namedExportModified as namedExport}
export default defaultExportModified
