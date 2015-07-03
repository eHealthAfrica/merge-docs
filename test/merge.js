'use strict'
var test       = require('redtape')(beforeEach)
  , sinon      = require('sinon')
  , proxyquire = require('proxyquire')
  , _          = require('lodash')
  , time       = require('timekeeper')

var merge, uuid

function beforeEach(done) {
  uuid = sinon.stub().returns('xxx')
  merge = proxyquire('../lib/merge', { 'uuid': { v4: uuid }})
  done()
}

function fakeDoc(props) {
  return { doc: props }
}

function props(doc) {
  return _.omit(doc.doc, ['_id', 'sources'])
}

function source(doc) {
  return _.last(doc.doc.sources)
}

test('merges input into a single doc', function (t) {
  var docs = [ fakeDoc({ foo: 'a' })
             , fakeDoc({ bar: 'b' })
             ]
  var output = merge(docs)
  t.deepEqual(props(output), { foo: 'a', bar: 'b' })
  t.end()
})

test('deeply merges properties', function (t) {
  var docs = [ fakeDoc({ foo: { a: 1 } })
             , fakeDoc({ foo: { b: 2 } })
             ]
  var output = merge(docs)
  t.deepEqual(props(output), { foo: { a: 1, b: 2 } })
  t.end()
})

test('prefers last property on conflicts', function (t) {
  var docs = [ fakeDoc({ foo: 'bar' })
             , fakeDoc({ foo: 'baz' })
             ]
  var output = merge(docs)
  t.deepEqual(props(output), { foo: 'baz' })
  t.end()
})

test('creates new id', function (t) {
  var docs = [ fakeDoc({ _id: '675cb524-d599' })
             , fakeDoc({ _id: 'be13804d-3b8b' })
             ]
  uuid.returns('c7900469-7ede')
  var output = merge(docs)
  t.equal(output.doc._id, 'c7900469-7ede')
  t.end()
})

test('drops revision', function (t) {
  var docs = [ fakeDoc({ _rev: '675cb524-d599' }) ]
  var output = merge(docs)
  t.notOk(props(output).hasOwnProperty('_rev'))
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

test('tracks meta data', function (t) {
  var docs = [ fakeDoc({ foo: 'bar' })
             , fakeDoc({ foo: 'baz' })
             ]
  try {
    time.freeze(1422880023791)
    var output = merge(docs)
    t.deepEqual(source(output), { type: 'migration'
                                , name: 'merge-docs'
                                , timestamp: 1422880023791
                                , docs: [ { foo: 'bar' }, { foo: 'baz' } ]
                                })
  } finally {
    time.reset()
    t.end()
  }
})

test('passes along original ids', function (t) {
  var docs = [ fakeDoc({ _id: '675cb524-d599' })
             , fakeDoc({ _id: 'be13804d-3b8b' })
             ]
  var output = merge(docs)
  t.deepEqual(output.ids, ['675cb524-d599', 'be13804d-3b8b'])
  t.end()
})
