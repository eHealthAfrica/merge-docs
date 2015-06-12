'use strict'
var test = require('redtape')(beforeEach)
  , fake = require('./support/fake')

var chunkStream = require('../lib/chunk-stream')
  , output = null

function beforeEach(done) {
  output = fake.output()
  done()
}

test('emits chunks of matching docs', function (t) {
  var input = fake.input([ {key: 'foo', val: '1'}
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
  var input = fake.input([ {key: 'foo', val: '1'}
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
  var input  = fake.input([ {key: null, val: '1'} ])
    , stream = chunkStream({groupBy: 'key'})

  input.pipe(stream).pipe(output)

  output.on('finish', function () {
    t.deepEqual(output.data, [ [{key: null, val: '1'}] ])
    t.end()
  })
})

test('skips chunks that fall below minimum length', function (t) {
  var input = fake.input([ {key: 'foo', val: '1'}
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
  var input  = fake.input([])
    , stream = chunkStream({groupBy: 'key'})

  input.pipe(stream).pipe(output)

  output.on('finish', function () {
    t.deepEqual(output.data, [])
    t.end()
  })
})
