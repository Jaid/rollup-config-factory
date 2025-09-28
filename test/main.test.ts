import {test} from 'bun:test'

import {runTest} from './lib/runTest.js'

test(`minimal-development`, async (t) => runTest(`minimal-development`, t))
test(`minimal-production`, async (t) => runTest(`minimal-production`, t))
test(`basic-development`, async (t) => runTest(`basic-development`, t))
test(`basic-production`, async (t) => runTest(`basic-production`, t))
test(`with-dependency-development`, async (t) => runTest(`with-dependency-development`, t))
test(`with-dependency-production`, async (t) => runTest(`with-dependency-production`, t))
test(`minify-development`, async (t) => runTest(`minify-development`, t))
test(`minify-production`, async (t) => runTest(`minify-production`, t))
