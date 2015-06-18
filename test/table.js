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
  var column = renderer.push.firstCall.args[0].foo
  t.equal(column[0], 'bar')
  t.end()
})

test('collects source values in remaining columns', function (t) {
  table([ [ { path: ['foo'], lhs: 'baz', rhs: 'bar' } ] ])
  var column = renderer.push.firstCall.args[0].foo
  t.equal(column[1], 'baz')
  t.end()
})

test('inserts merged value for empty column', function (t) {
  table([ [], [ { path: ['foo'], lhs: 'baz', rhs: 'bar' } ] ])
  var column = renderer.push.firstCall.args[0].foo
  t.equal(column[1], 'bar')
  t.end()
})

test('returns rendered table', function (t) {
  renderer.toString.returns('| 1 | 2 | 3 |')
  var output = table([[], [], []])
  t.equal(output, '| 1 | 2 | 3 |')
  t.end()
})
