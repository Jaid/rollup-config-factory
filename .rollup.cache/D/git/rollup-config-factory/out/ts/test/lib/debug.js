import makeDebug from 'debug';
export const debug = makeDebug(`test`);
export const startTiming = (label) => {
    performance.mark(`${label}/start`);
};
export const endTiming = (label, eventName) => {
    performance.mark(`${label}/end`);
    const measure = performance.measure(label, `${label}/start`, `${label}/end`);
    debug(`${eventName ?? label} took ${measure.duration.toFixed(2)} ms`);
};
//# sourceMappingURL=debug.js.map