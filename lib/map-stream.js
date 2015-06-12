'use strict'
var _         = require('lodash')
  , Transform = require('stream').Transform

function create(transform) {
  var stream = new Transform({objectMode: true})

  stream._transform = function (input, encoding, done) {
    var output = transform(input)
    if (output != null) {
      stream.push(output)
    }
    done()
  }

  return stream
}

module.exports = create
