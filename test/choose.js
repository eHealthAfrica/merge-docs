'use strict'
var test       = require('redtape')(beforeEach)
  , sinon      = require('sinon')
  , proxyquire = require('proxyquire')

function fakeIo() {
  return { stdout: { write: sinon.spy() }
         , prompt: sinon.stub()
         }
}

function fakeInput() {
  return { doc: { foo: 'bar' }
         , sources: [{ foo: 'bar' }, { foo: 'baz' }]
         , diffs: [[], [{kind: 'E', path: ['foo'], lhd: 'bar', rhs: 'baz'}]]
         }
}

var choose, io, table

function beforeEach(done) {
  io = fakeIo()
  table = sinon.stub().returns('| H1 | H2 |')
  choose = proxyquire('../lib/choose', { './table': table })
  done()
}

test('returns a promise', function (t) {
  var input = fakeInput()
  var result = choose(input, io)
  t.ok(result instanceof Promise)
  t.end()
})

test('renders diff tables to stdout', function (t) {
  var input = fakeInput()
  table.withArgs(input.diffs).returns('| DIFF | TABLE |')
  var result = choose(input, io)
  t.ok(io.stdout.write.calledWith('| DIFF | TABLE |'))
  t.end()
})
