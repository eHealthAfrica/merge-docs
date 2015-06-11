'use strict'
var test       = require('redtape')(beforeEach)
  , sinon      = require('sinon')
  , proxyquire = require('proxyquire')
  , events     = require('events')
  , _          = require('lodash')

function fakeStream () {
  return _.assign( new events.EventEmitter()
                 , { pipe : sinon.stub().returnsArg(0) }
                 )
}

function fakeIo () {
  return { stdin: fakeStream() }
}

function fakeJSONStream () {
  var stream = fakeStream()
  return { parse: sinon.stub().returns(stream) }
}

function fakeChunkStream () {
  var stream = fakeStream()
  return sinon.stub().returns(stream)
}

var cli, io, JSONStream, chunkStream

function beforeEach (done) {
  io          = fakeIo()
  JSONStream  = fakeJSONStream()
  chunkStream = fakeChunkStream()
  cli         = proxyquire('../lib/cli', { 'JSONStream'     : JSONStream
                                         , './chunk-stream' : chunkStream
                                         })
  done()
}

test('parses rows from stdin', function (t) {
  var parser = fakeStream()
  JSONStream.parse.withArgs('rows.*').returns(parser)
  cli(io).run()
  t.ok(io.stdin.pipe.calledWith(parser))
  t.end()
})

test('handles parse errors', function (t) {
  var parser = fakeStream()
    , error  = new Error('Could not parse JSON')
  JSONStream.parse.returns(parser)
  cli(io).run().catch(function (catched) {
    t.equal(catched, error)
    t.end()
  })
  parser.emit('error', error)
})

test('chunks rows by key', function (t) {
  var parser = fakeStream()
    , chunks = fakeStream()
  JSONStream.parse.returns(parser)
  chunkStream.withArgs({groupBy: 'key'}).returns(chunks)
  cli(io).run()
  t.ok(parser.pipe.calledWith(chunks))
  t.end()
})

test('handles chunk errors', function (t) {
  var chunks = fakeStream()
    , error  = new Error('Could not parse JSON')
  chunkStream.returns(chunks)
  cli(io).run().catch(function (catched) {
    t.equal(catched, error)
    t.end()
  })
  chunks.emit('error', error)
})
