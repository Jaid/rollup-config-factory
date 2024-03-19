import makeDebug from 'debug'

export const debug = makeDebug(`test`)

export const startTiming = (label: string) => {
  performance.mark(`${label}/start`)
}

export const endTiming = (label: string, eventName?: string) => {
  performance.mark(`${label}/end`)
  const measure = performance.measure(label, `${label}/start`, `${label}/end`)
  debug(`${eventName ?? label} took ${measure.duration.toFixed(2)} ms`)
}
