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

function fakeStreamFactory () {
  var stream = fakeStream()
  return sinon.stub().returns(stream)
}

var cli, io, JSONStream, chunkStream, mapStream, merge

function beforeEach (done) {
  io          = fakeIo()
  JSONStream  = fakeJSONStream()
  chunkStream = fakeStreamFactory()
  mapStream   = fakeStreamFactory()
  merge       = sinon.stub().returnsArg(0)
  cli         = proxyquire('../lib/cli', { 'JSONStream'     : JSONStream
                                         , './chunk-stream' : chunkStream
                                         , './map-stream'   : mapStream
                                         , './merge'        : merge
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
    , error  = new Error('Chunking failed for some reason')
  chunkStream.returns(chunks)
  cli(io).run().catch(function (catched) {
    t.equal(catched, error)
    t.end()
  })
  chunks.emit('error', error)
})

test('creates merged doc from chunks', function (t) {
  var chunks = fakeStream()
    , merges = fakeStream()
  chunkStream.returns(chunks)
  mapStream.withArgs(merge).returns(merges)
  cli(io).run()
  t.ok(chunks.pipe.calledWith(merges))
  t.end()
})

test('handles merge errors', function (t) {
  var merges = fakeStream()
    , error  = new Error('Could not merge here!')
  mapStream.withArgs(merge).returns(merges)
  cli(io).run().catch(function (catched) {
    t.equal(catched, error)
    t.end()
  })
  merges.emit('error', error)
})
