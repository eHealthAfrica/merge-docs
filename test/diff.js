'use strict'
var test = require('redtape')()

var diff = require('../lib/diff')

test('creates diff for each source', function (t) {
  var input = { doc: {foo: 1}, sources: [{foo: 1}, {foo: 1}] }
  var output = diff(input)
  t.deepEqual(output.diffs, [{}, {}])
  t.end()
})

test('copies input properties', function (t) {
  var input = { doc: { foo: 1 }, sources: [{}] }
  var output = diff(input)
  t.deepEqual(output.doc, { foo: 1 })
  t.end()
  t.end()
})

test('groups root level diffs', function (t) {
  var input = { doc: {foo: 2}, sources: [{}] }
  var output = diff(input)
  t.deepEqual( output.diffs[0]
             , { '/': [ { kind: 'N', path: ['foo'], rhs: 2 } ] })
  t.end()
})

test('groups deep diffs by path', function (t) {
  var input = { doc: {foo: {bar: 'baz'}}, sources: [{ foo: {} }] }
  var output = diff(input)
  t.deepEqual( output.diffs[0]
             , {'/foo': [ { kind: 'N', path: ['foo', 'bar'], rhs: 'baz' } ]})
  t.end()
})
