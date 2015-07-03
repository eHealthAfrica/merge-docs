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
         , prompt : sinon.spy()
         }
}

function fakeJSONStream () {
  var stream = fakeStream()
  return { parse: sinon.stub().returns(stream) }
}

function fakeStreamFactory () {
  var stream = fakeStream()
  return sinon.stub().returns(stream)
}

var cli, io, JSONStream, chunkStream, mapStream, sort, merge, diff, choose

function beforeEach (done) {
  io          = fakeIo()
  JSONStream  = fakeJSONStream()
  chunkStream = fakeStreamFactory()
  mapStream   = fakeStreamFactory()
  sort        = sinon.stub().returnsArg(0)
  merge       = sinon.stub().returnsArg(0)
  diff        = sinon.stub().returnsArg(0)
  choose      = sinon.stub().returnsArg(0)
  cli         = proxyquire('../lib/cli', { 'JSONStream'     : JSONStream
                                         , './chunk-stream' : chunkStream
                                         , './map-stream'   : mapStream
                                         , './sort'         : sort
                                         , './merge'        : merge
                                         , './diff'         : diff
                                         , './choose'       : choose
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

test('diffs merged doc and sources', function (t) {
  var merger = fakeStream()
    , differ = fakeStream()
  mapStream.withArgs(merge).returns(merger)
  mapStream.withArgs(diff).returns(differ)
  cli(io).run()
  t.ok(merger.pipe.calledWith(differ))
  t.end()
})

test('handles diff errors', function (t) {
  var differ = fakeStream()
    , error  = new Error('Say it again, please')
  mapStream.withArgs(diff).returns(differ)
  cli(io).run().catch(function (catched) {
    t.equal(catched, error)
    t.end()
  })
  differ.emit('error', error)
})

test('displays dialogs for choosing', function (t) {
  var differ  = fakeStream()
    , chooser = fakeStream()
  mapStream.withArgs(diff).returns(differ)
  mapStream.withArgs(choose).returns(chooser)
  cli(io).run()
  t.ok(differ.pipe.calledWith(chooser))
  t.end()
})

test('handles choosing error', function (t) {
  var chooser = fakeStream()
    , error   = new Error('What was it again?')
  mapStream.withArgs(choose).returns(chooser)
  cli(io).run().catch(function (catched) {
    t.equal(catched, error)
    t.end()
  })
  chooser.emit('error', error)
})

test('passes env to chooser', function (t) {
  cli(io).run()
  t.ok(mapStream.calledWith(choose, { stdout: io.stdout
                                    , prompt: io.prompt}))
  t.end()
})
