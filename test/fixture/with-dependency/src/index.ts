import * as lodash from 'lodash-es'

import {getMessage} from './getMessage.js'

const message = getMessage(process.env.name ?? `world`)
const messageEscaped = lodash.escapeRegExp(message)
console.log(message)
export const msg = message
export const msgEscaped = messageEscaped
export const test = 123
export default message
