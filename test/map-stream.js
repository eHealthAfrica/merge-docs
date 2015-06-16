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
