// @ts-nocheck
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import assert from 'bun:assert';
export const checkExport = value => {
    assert.strictEqual(value.default, 2);
    assert.strictEqual(value.namedExport, `ab`);
};
//# sourceMappingURL=config.js.map
