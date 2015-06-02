'use strict'
var test       = require('redtape')(beforeEach)
  , sinon      = require('sinon')
  , proxyquire = require('proxyquire')

function fakeStream () {
  return { pipe: sinon.stub().returnsArg(0) }
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

test('chunks rows by key', function (t) {
  var parser = fakeStream()
    , chunks = fakeStream()
  JSONStream.parse.returns(parser)
  chunkStream.withArgs({groupBy: 'key'}).returns(chunks)
  cli(io).run()
  t.ok(parser.pipe.calledWith(chunks))
  t.end()
})
