// @ts-nocheck
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import assert from 'node:assert';
export const checkExport = value => {
    assert.strictEqual(value.default, `Hello, world!`);
    assert.strictEqual(value.msg, `Hello, world!`);
    assert.strictEqual(value.msgEscaped, `Hello, world!`);
    assert.strictEqual(value.test, 123);
};
//# sourceMappingURL=config.js.map