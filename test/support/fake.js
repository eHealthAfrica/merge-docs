'use strict'
var stream = require('stream')

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

module.exports =
  { input  : fakeInput
  , output : fakeOutput
  }
