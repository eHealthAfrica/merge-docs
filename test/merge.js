'use strict'
var test = require('redtape')()

var merge = require('../lib/merge')

function fakeDoc(attrs) {
  return { doc: attrs }
}

test('merges input into a single doc', function (t) {
  var docs = [ fakeDoc({ foo: 'a' })
             , fakeDoc({ bar: 'b' })
             ]
  var output = merge(docs)
  t.deepEqual(output.doc, { foo: 'a', bar: 'b' })
  t.end()
})

test('deeply merges properties', function (t) {
  var docs = [ fakeDoc({ foo: { a: 1 } })
             , fakeDoc({ foo: { b: 2 } })
             ]
  var output = merge(docs)
  t.deepEqual(output.doc, { foo: { a: 1, b: 2 } })
  t.end()
})

test('prefers last property on conflicts', function (t) {
  var docs = [ fakeDoc({ foo: 'bar' })
             , fakeDoc({ foo: 'baz' })
             ]
  var output = merge(docs)
  t.deepEqual(output.doc, { foo: 'baz' })
  t.end()
})

test('passes along source docs', function (t) {
  var docs = [ fakeDoc({ foo: 'bar' })
             , fakeDoc({ foo: 'baz' })
             ]
  var output = merge(docs)
  t.deepEqual(output.sources, [ { foo: 'bar' }, { foo: 'baz' } ])
  t.end()
})
