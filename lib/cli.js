'use strict'
var _           = require('lodash')
  , JSONStream  = require('JSONStream')
  , chunkStream = require('./chunk-stream')

function run() {
  var parser = JSONStream.parse('rows.*')
    , chunks = chunkStream({groupBy: 'key'})
    , stdin  = this.stdin

  return new Promise(function (resolve, reject) {
    stdin
      .pipe(parser).on('error', reject)
      .pipe(chunks).on('error', reject)
                   .on('end'  , resolve)

      // TODO 150611 [tc] .pipe(diff)
  })
}

function create(io) {
  return Object.create( { run: run }
                      , { stdin: { get: function () { return io.stdin } } }
                      )
}

module.exports = create
