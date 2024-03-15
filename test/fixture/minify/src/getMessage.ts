import * as lodash from 'lodash-es'

export const getMessage = (name: string = `you`) => {
  const template = `Hello, <%= name %>!`
  const message = name ? lodash.template(template)({name}) : `Hello!`
  return message
}
