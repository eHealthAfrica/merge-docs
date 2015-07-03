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
  return { stdin  : fakeStream()
         , stdout : fakeStream()
         }
}

function fakeJSONStream () {
  var parser = fakeStream()
    , stringifier = fakeStream()

  return { parse:     sinon.stub().returns(parser)
         , stringify: sinon.stub().returns(stringifier)
         }
}

function fakeStreamFactory () {
  var stream = fakeStream()
  return sinon.stub().returns(stream)
}

var cli, io, JSONStream, chunkStream, mapStream, sort, merge

function beforeEach (done) {
  io          = fakeIo()
  JSONStream  = fakeJSONStream()
  chunkStream = fakeStreamFactory()
  mapStream   = fakeStreamFactory()
  sort        = sinon.stub().returnsArg(0)
  merge       = sinon.stub().returnsArg(0)
  cli         = proxyquire('../lib/cli', { 'JSONStream'     : JSONStream
                                         , './chunk-stream' : chunkStream
                                         , './map-stream'   : mapStream
                                         , './sort'         : sort
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
  var parser  = fakeStream()
    , chunker = fakeStream()
  JSONStream.parse.returns(parser)
  chunkStream.withArgs({groupBy: 'key', minLength: 2}).returns(chunker)
  cli(io).run()
  t.ok(parser.pipe.calledWith(chunker))
  t.end()
})

test('handles chunk errors', function (t) {
  var chunker = fakeStream()
    , error   = new Error('Chunking failed for some reason')
  chunkStream.returns(chunker)
  cli(io).run().catch(function (catched) {
    t.equal(catched, error)
    t.end()
  })
  chunker.emit('error', error)
})

test('sorts chunks', function (t) {
  var chunker = fakeStream()
    , sorter  = fakeStream()
  chunkStream.returns(chunker)
  mapStream.withArgs(sort).returns(sorter)
  cli(io).run()
  t.ok(chunker.pipe.calledWith(sorter))
  t.end()
})

test('handles sort errors', function (t) {
  var sorter = fakeStream()
    , error  = new Error('No idea how to sort this thing')
  mapStream.withArgs(sort).returns(sorter)
  cli(io).run().catch(function (catched) {
    t.equal(catched, error)
    t.end()
  })
  sorter.emit('error', error)
})

test('merges sorted chunks', function (t) {
  var sorter = fakeStream()
    , merger = fakeStream()
  mapStream.withArgs(sort).returns(sorter)
  mapStream.withArgs(merge).returns(merger)
  cli(io).run()
  t.ok(sorter.pipe.calledWith(merger))
  t.end()
})

test('handles merge errors', function (t) {
  var merger = fakeStream()
    , error  = new Error('Could not merge here!')
  mapStream.withArgs(merge).returns(merger)
  cli(io).run().catch(function (catched) {
    t.equal(catched, error)
    t.end()
  })
  merger.emit('error', error)
})

test('serializes merged docs', function (t) {
  var merger     = fakeStream()
    , serializer = fakeStream()
  mapStream.withArgs(merge).returns(merger)
  JSONStream.stringify.returns(serializer)
  cli(io).run()
  t.ok(merger.pipe.calledWith(serializer))
  t.end()
})

test('handles serializer errors', function (t) {
  var serializer = fakeStream()
    , error      = new Error('Bad input data')
  JSONStream.stringify.returns(serializer)
  cli(io).run().catch(function (catched) {
    t.equal(catched, error)
    t.end()
  })
  serializer.emit('error', error)
})

test('streams serialized data to stdout', function (t) {
  var serializer = fakeStream()
  JSONStream.stringify.returns(serializer)
  cli(io).run()
  t.ok(serializer.pipe.calledWith(io.stdout))
  t.end()
})
