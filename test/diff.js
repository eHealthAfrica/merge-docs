'use strict'
var test = require('redtape')()

var diff = require('../lib/diff')

test('creates diff for each source', function (t) {
  var input = { doc: {foo: 2}, sources: [{}] }
  var output = diff(input)
  t.deepEqual( output.diffs
             , [ [{ kind: 'N', path: ['foo'], rhs: 2 }] ])
  t.end()
})

test('it creates empty diff when there are no changes', function (t) {
  var input = { doc: {foo: 2}, sources: [{ foo: 2 }] }
  var output = diff(input)
  t.deepEqual( output.diffs
             , [ [] ])
  t.end()
})

test('copies input properties', function (t) {
  var input = { doc: { foo: 1 }, sources: [{}] }
  var output = diff(input)
  t.deepEqual(output.doc, { foo: 1 })
  t.end()
})
