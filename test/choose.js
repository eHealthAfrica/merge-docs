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

var choose, input, io, table

function beforeEach(done) {
  io = fakeIo()
  input = fakeInput()
  table = sinon.stub().returns('| H1 | H2 |')
  choose = proxyquire('../lib/choose', { './table': table })
  done()
}

test('returns a promise', function (t) {
  var result = choose(input, io)
  t.ok(result instanceof Promise)
  t.end()
})

test('renders diff tables to stdout', function (t) {
  table.withArgs(input.diffs).returns('| DIFF | TABLE |')
  choose(input, io)
  t.ok(io.stdout.write.calledWith('| DIFF | TABLE |'))
  t.end()
})

test('prompts for confirmation', function (t) {
  choose(input, io)
  t.ok(io.prompt.calledWithMatch({ type: 'confirm', name: 'merge' }))
  t.end()
})

test('confirm resolves with merged doc', function (t) {
  var doc = { foo: 'bar' }
  input.doc = doc
  io.prompt.callsArgWith(1, {merge: true})
  choose(input, io).then( function (result) {
    t.equal(result, doc)
    t.end()
  })
})

test('cancel resolves with null', function (t) {
  io.prompt.callsArgWith(1, {merge: false})
  choose(input, io).then( function (result) {
    t.equal(result, null)
    t.end()
  })
})
