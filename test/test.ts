import {test} from 'node:test'

import {runTest} from './lib/runTest.js'

test(`minimal-development`, async testContext => runTest(testContext))
test(`minimal-production`, async testContext => runTest(testContext))
test(`basic-development`, async testContext => runTest(testContext))
test(`basic-production`, async testContext => runTest(testContext))
test(`with-dependency-development`, async testContext => runTest(testContext))
test(`with-dependency-production`, async testContext => runTest(testContext))
test(`minify-development`, async testContext => runTest(testContext))
test(`minify-production`, async testContext => runTest(testContext))
