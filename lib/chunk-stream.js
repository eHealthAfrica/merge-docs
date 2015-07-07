'use strict'
var _         = require('lodash')
  , Transform = require('stream').Transform

function create (options) {
  options = options || {}

  var stream    = new Transform({objectMode: true})
    , chunk     = []
    , key       = options.groupBy   || 'key'
    , minLength = options.minLength || 1


  function matchesCurrent(datum) {
    return (chunk.length > 0) ? (datum[key] === chunk[0][key]) : true
  }

  function emit() {
    if (chunk.length >= minLength) {
      stream.push(chunk)
    }
  }

  stream._transform = function (datum, encoding, done) {
    if (datum) {
      var value = datum[key]
      if (matchesCurrent(datum)) {
        chunk.push(datum)
      } else {
        emit()
        chunk = [datum]
      }
    } else {
      stream.push(null)
    }
    done()
  }

  stream._flush = function (done) {
    emit()
    done()
  }

  return stream
}

module.exports = create
