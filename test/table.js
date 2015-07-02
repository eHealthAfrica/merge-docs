'use strict'
var test       = require('redtape')(beforeEach)
  , proxyquire = require('proxyquire')
  , sinon      = require('sinon')

function fakeRenderer() {
  return { toString: sinon.stub().returns('| a | b | c |')
         , push:     sinon.spy()
         }
}

var table, Table, renderer

function beforeEach(done) {
  renderer = fakeRenderer()
  Table = sinon.stub().returns(renderer)
  table = proxyquire('../lib/table', { 'cli-table': Table })
  done()
}

test('creates a renderer', function (t) {
  table([])
  t.ok(Table.calledWithNew())
  t.end()
})

test('creates headers', function (t) {
  table([[], [], []])
  t.ok(Table.calledWithMatch({head: ['', 'Merged', '1', '2', '3']}))
  t.end()
})

test('returns rendered table', function (t) {
  renderer.toString.returns('| 1 | 2 | 3 |')
  var output = table([[], [], []])
  t.equal(output, '| 1 | 2 | 3 |\n')
  t.end()
})

test('fills table before rendering', function (t) {
  table([ [] ])
  t.ok(renderer.toString.calledAfter(renderer.push))
  t.end()
})

test('it creates one row for each path', function (t) {
  table([ [ { path: ['foo'] }, { path: ['bar'] } ] ])
  t.equal(renderer.push.firstCall.args.length, 2)
  t.end()
})

test('it creates single row for same path', function (t) {
  table([ [ { path: ['foo'] }, { path: ['foo'] } ] ])
  t.equal(renderer.push.firstCall.args.length, 1)
  t.end()
})

test('creates label from path', function (t) {
  table([ [ { path: ['foo', 'bar'] } ] ])
  t.ok(renderer.push.calledWith(sinon.match.has('foo/bar')))
  t.end()
})

test('collects merged value in first column', function (t) {
  table([ [ { path: ['foo'], lhs: 'baz', rhs: 'bar' } ] ])
  var row = renderer.push.firstCall.args[0].foo
  t.equal(row[0], 'bar')
  t.end()
})

test('converts merged value to be a string', function (t) {
  table([ [ { path: ['foo'], lhs: 'baz', rhs: 1234} ] ])
  var row = renderer.push.firstCall.args[0].foo
  t.equal(row[0], '1234')
  t.end()
})

test('converts merged value to empty string for null value', function (t) {
  table([ [ { path: ['foo'], lhs: 'baz', rhs: null} ] ])
  var row = renderer.push.firstCall.args[0].foo
  t.equal(row[0], '')
  t.end()
})

test('collects source values in remaining columns', function (t) {
  table([ [ { path: ['foo'], lhs: 'baz', rhs: 'bar' } ] ])
  var row = renderer.push.firstCall.args[0].foo
  t.equal(row[1], 'baz')
  t.end()
})

test('converts source values to be a string', function (t) {
  table([ [ { path: ['foo'], lhs: 42, rhs: 'bar' } ] ])
  var row = renderer.push.firstCall.args[0].foo
  t.equal(row[1], '42')
  t.end()
})

test('converts source values to empty string for null values', function (t) {
  table([ [ { path: ['foo'], lhs: null, rhs: 'bar' } ] ])
  var row = renderer.push.firstCall.args[0].foo
  t.equal(row[1], '')
  t.end()
})

test('inserts merged value for empty column', function (t) {
  table([ [], [ { path: ['foo'], lhs: 'baz', rhs: 'bar' } ] ])
  var row = renderer.push.firstCall.args[0].foo
  t.equal(row[1], 'bar')
  t.end()
})

test('it expands paths for new nested property', function (t) {
  table([ [ { path: ['foo'], lhs: { bar: { baz: ['a', 'b'] } } } ] ])
  t.ok(renderer.push.calledWith(sinon.match.has('foo/bar/baz/0')))
  t.end()
})

test('collects source values for new nested property', function (t) {
  table([ [ { path: ['foo'], lhs: { bar: { baz: ['a', 'b'] } } } ] ])
  var row = renderer.push.firstCall.args[0]['foo/bar/baz/0']
  t.equal(row[1], 'a')
  t.end()
})

test('collects merged value for new nested property', function (t) {
  table([ [ { path: ['foo'], lhs: { bar: { baz: ['a', 'b'] } } } ] ])
  var row = renderer.push.firstCall.args[0]['foo/bar/baz/0']
  t.equal(row[0], '')
  t.end()
})

test('it expands paths for deleted nested property', function (t) {
  table([ [ { path: ['foo'], rhs: { bar: { baz: ['a', 'b'] } } } ] ])
  t.ok(renderer.push.calledWith(sinon.match.has('foo/bar/baz/0')))
  t.end()
})

test('collects source values for deleted nested property', function (t) {
  table([ [ { path: ['foo'], rhs: { bar: { baz: ['a', 'b'] } } } ] ])
  var row = renderer.push.firstCall.args[0]['foo/bar/baz/0']
  t.equal(row[1], '')
  t.end()
})

test('collects merged value for deleted nested property', function (t) {
  table([ [ { path: ['foo'], rhs: { bar: { baz: ['a', 'b'] } } } ] ])
  var row = renderer.push.firstCall.args[0]['foo/bar/baz/0']
  t.equal(row[0], 'a')
  t.end()
})

test('expands paths for array items', function (t) {
  table([ [ { path: ['foo'], index: 3 } ] ])
  t.ok(renderer.push.calledWith(sinon.match.has('foo/3')))
  t.end()
})

test('collects merged value from array item', function (t) {
  table([ [ { path: ['foo'], index: 3, item: { rhs: 'a' } } ] ])
  var row = renderer.push.firstCall.args[0]['foo/3']
  t.equal(row[0], 'a')
  t.end()
})

test('collects source value from array item', function (t) {
  table([ [ { path: ['foo'], index: 3, item: { lhs: 'b' } } ] ])
  var row = renderer.push.firstCall.args[0]['foo/3']
  t.equal(row[1], 'b')
  t.end()
})
