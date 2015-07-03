'use strict'
var test       = require('redtape')(beforeEach)
  , sinon      = require('sinon')
  , proxyquire = require('proxyquire')
  , _          = require('lodash')

var merge, uuid

function beforeEach(done) {
  uuid = sinon.stub().returns('xxx')
  merge = proxyquire('../lib/merge', { 'uuid': { v4: uuid }})
  done()
}

function fakeDoc(props) {
  return { doc: props }
}

function doc(merged) {
  return _.omit(merged.doc, '_id')
}

test('merges input into a single doc', function (t) {
  var docs = [ fakeDoc({ foo: 'a' })
             , fakeDoc({ bar: 'b' })
             ]
  var output = merge(docs)
  t.deepEqual(doc(output), { foo: 'a', bar: 'b' })
  t.end()
})

test('deeply merges properties', function (t) {
  var docs = [ fakeDoc({ foo: { a: 1 } })
             , fakeDoc({ foo: { b: 2 } })
             ]
  var output = merge(docs)
  t.deepEqual(doc(output), { foo: { a: 1, b: 2 } })
  t.end()
})

test('prefers last property on conflicts', function (t) {
  var docs = [ fakeDoc({ foo: 'bar' })
             , fakeDoc({ foo: 'baz' })
             ]
  var output = merge(docs)
  t.deepEqual(doc(output), { foo: 'baz' })
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

test('creates new id', function (t) {
  var docs = [ fakeDoc({ _id: '675cb524-d599' })
             , fakeDoc({ _id: 'be13804d-3b8b' })
             ]
  uuid.returns('c7900469-7ede')
  var output = merge(docs)
  t.deepEqual(output.doc._id, 'c7900469-7ede')
  t.end()
})
