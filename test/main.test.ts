import {test} from 'bun:test'

import {runTest} from './lib/runTest.js'

const timeout = 60_000

test(`minimal-development`, async () => runTest(`minimal-development`), {timeout})
test(`minimal-production`, async () => runTest(`minimal-production`), {timeout})
test(`basic-development`, async () => runTest(`basic-development`), {timeout})
test(`basic-production`, async () => runTest(`basic-production`), {timeout})
test(`with-dependency-development`, async () => runTest(`with-dependency-development`), {timeout})
test(`with-dependency-production`, async () => runTest(`with-dependency-production`), {timeout})
test(`minify-development`, async () => runTest(`minify-development`), {timeout})
test(`minify-production`, async () => runTest(`minify-production`), {timeout})
