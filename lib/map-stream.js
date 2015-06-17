'use strict'
var _         = require('lodash')
  , Transform = require('stream').Transform

function create(transform) {
  var stream = new Transform({objectMode: true})

  stream._transform = function (input, encoding, done) {
    Promise.resolve(transform(input))
      .then(function (output) {
        if (output != null) {
          stream.push(output)
        }
        done()
      })
      .catch(function (error) {
        stream.emit('error', error)
      })
  }

  return stream
}

module.exports = create
