import * as lodash from 'lodash-es'

const templateOpener = `<%=`
const templateCloser = `%>`
const endingSymbol = `!`

export const getMessage = (name: string = `you`) => {
  const template = `Hello, ${templateOpener} name ${templateCloser}${endingSymbol}`
  const message = name ? lodash.template(template)({name}) : `Hello${endingSymbol}`
  return message
}
