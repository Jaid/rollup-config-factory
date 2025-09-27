import {test} from 'bun:test'

import {runTest} from './lib/runTest.js'

test(`minimal-development`, async () => runTest(`minimal-development`))
test(`minimal-production`, async () => runTest(`minimal-production`))
test(`basic-development`, async () => runTest(`basic-development`))
test(`basic-production`, async () => runTest(`basic-production`))
test(`with-dependency-development`, async () => runTest(`with-dependency-development`))
test(`with-dependency-production`, async () => runTest(`with-dependency-production`))
test(`minify-development`, async () => runTest(`minify-development`))
test(`minify-production`, async () => runTest(`minify-production`))
