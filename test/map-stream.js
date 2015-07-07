'use strict'
var test  = require('redtape')(beforeEach)
  , fake  = require('./support/fake')
  , sinon = require('sinon')

var mapStream = require('../lib/map-stream')
  , output = null

function beforeEach(done) {
  output = fake.output()
  done()
}

test('it transforms input', function (t) {
  var input = fake.input([ { foo: 'bar' } ])
    , transform = sinon.stub().returnsArg(0)
    , stream = mapStream(transform)

  input.pipe(stream).pipe(output)

  output.on('finish', function () {
    t.ok(transform.calledWith({ foo: 'bar' }))
    t.end()
  })
})

test('it pushes result', function (t) {
  var input = fake.input([ { foo: 'bar' } ])
    , transform = function () { return { foo: 'BAZ' } }
    , stream = mapStream(transform)

  input.pipe(stream).pipe(output)

  output.on('finish', function () {
    t.deepEqual(output.data, [ { foo: 'BAZ' } ])
    t.end()
  })
})

test('does not push null values', function (t) {
  var input = fake.input([ 'a', 'b', 'c' ])
    , transform = function (input) { return (input === 'b') ? null : input }
    , stream = mapStream(transform)

  input.pipe(stream).pipe(output)

  output.on('finish', function () {
    t.deepEqual(output.data, [ 'a', 'c' ])
    t.end()
  })
})

test('pushes value from a promise', function (t) {
  var input = fake.input([ { foo: 'bar' } ])
    , promise = Promise.resolve({foo: 'BAZ'})
    , transform = function () { return promise }
    , stream = mapStream(transform)

  input.pipe(stream).pipe(output)

  output.on('finish', function () {
    t.deepEqual(output.data, [ { foo: 'BAZ' } ])
    t.end()
  })
})

test('forwards error from rejected promise', function (t) {
  var input = fake.input([ { foo: 'bar' } ])
    , error = new Error('WAT?')
    , promise = Promise.reject(error)
    , transform = function () { return promise }
    , stream = mapStream(transform)

  input.pipe(stream).pipe(output)

  stream.on('error', function (e) {
    t.deepEqual(e, error)
    t.end()
  })
})

test('forwards options to each call', function (t) {
  var input     = fake.input([ { foo: 'bar' } ])
    , transform = sinon.stub().returns({ foo: 'BAZ' })
    , options   = { out: function () {} }
    , stream    = mapStream(transform, options)

  input.pipe(stream).pipe(output)

  output.on('finish', function () {
    t.ok(transform.calledWith({ foo: 'bar' }, options))
    t.end()
  })
})
