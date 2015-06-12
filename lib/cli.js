'use strict'
var _           = require('lodash')
  , JSONStream  = require('JSONStream')
  , chunkStream = require('./chunk-stream')
  , mapStream   = require('./map-stream')
  , merge       = require('./merge')

function run() {
  var stdin  = this.stdin
    , parser = JSONStream.parse('rows.*')
    , chunks = chunkStream({groupBy: 'key'})
    , merges = mapStream(merge)

  return new Promise(function (resolve, reject) {
    stdin
      .pipe(parser).on('error', reject)
      .pipe(chunks).on('error', reject)
      .pipe(merges).on('error', reject)
                   .on('finish', resolve)
  })
}

function create(io) {
  return Object.create( { run: run }
                      , { stdin: { get: function () { return io.stdin } } }
                      )
}

module.exports = create
