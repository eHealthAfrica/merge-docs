'use strict'
var test   = require('redtape')(beforeEach)
  , stream = require('stream')

function fakeInput(data) {
  var input = new stream.Readable({objectMode: true})
  input._read = function () {
    data.forEach(function (datum) { input.push(datum) })
    input.push(null)
  }
  return input
}

function fakeOutput () {
  var output = new stream.Writable({objectMode: true})
    , data = []
  Object.defineProperty(output, 'data', {get: function () { return data }})
  output._write = function (datum, encoding, done) {
    data.push(datum)
    done()
  }
  return output
}

var chunkStream = require('../lib/chunk-stream')
  , output = null

function beforeEach(done) {
  output = fakeOutput()
  done()
}

test('emits chunks of matching docs', function (t) {
  var input  = fakeInput([ {key: 'foo', val: '1'}
                         , {key: 'foo', val: '2'}
                         , {key: 'bar', val: '3'}
                         ])
    , stream = chunkStream({groupBy: 'key'})

  input.pipe(stream).pipe(output)

  output.on('finish', function () {
    t.deepEqual( output.data
               , [ [{key: 'foo', val: '1'}, {key: 'foo', val: '2'}]
                 , [{key: 'bar', val: '3'}]
                 ])
    t.end()
  })
})

test('groups by key by default', function (t) {
  var input  = fakeInput([ {key: 'foo', val: '1'}
                         , {key: 'foo', val: '2'}
                         , {key: 'bar', val: '3'}
                         ])
    , stream = chunkStream()

  input.pipe(stream).pipe(output)

  output.on('finish', function () {
    t.deepEqual( output.data
               , [ [{key: 'foo', val: '1'}, {key: 'foo', val: '2'}]
                 , [{key: 'bar', val: '3'}]
                 ])
    t.end()
  })
})

test('groups null values', function (t) {
  var input  = fakeInput([ {key: null, val: '1'} ])
    , stream = chunkStream({groupBy: 'key'})

  input.pipe(stream).pipe(output)

  output.on('finish', function () {
    t.deepEqual(output.data, [ [{key: null, val: '1'}] ])
    t.end()
  })
})

test('skips chunks that fall below minimum length', function (t) {
  var input  = fakeInput([ {key: 'foo', val: '1'}
                         , {key: 'foo', val: '2'}
                         , {key: 'bar', val: '3'}
                         ])
    , stream = chunkStream({groupBy: 'key', minLength: 2})

  input.pipe(stream).pipe(output)

  output.on('finish', function () {
    t.deepEqual( output.data
               , [ [{key: 'foo', val: '1'}, {key: 'foo', val: '2'}]
                 ])
    t.end()
  })
})

test('does not emit empty chunk', function (t) {
  var input  = fakeInput([])
    , stream = chunkStream({groupBy: 'key'})

  input.pipe(stream).pipe(output)

  output.on('finish', function () {
    t.deepEqual(output.data, [])
    t.end()
  })
})
