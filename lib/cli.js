'use strict'
var _           = require('lodash')
  , JSONStream  = require('JSONStream')
  , chunkStream = require('./chunk-stream')
  , mapStream   = require('./map-stream')
  , sort        = require('./sort')
  , merge       = require('./merge')

function run() {
  var stdin      = this.stdin
    , stdout     = this.stdout
    , parser     = JSONStream.parse('rows.*')
    , chunker    = chunkStream({groupBy: 'key', minLength: 2})
    , sorter     = mapStream(sort)
    , merger     = mapStream(merge)
    , serializer = JSONStream.stringify()

  return new Promise(function (resolve, reject) {
    stdin
      .pipe(parser    ).on('error' , reject)
      .pipe(chunker   ).on('error' , reject)
      .pipe(sorter    ).on('error' , reject)
      .pipe(merger    ).on('error' , reject)
      .pipe(serializer).on('error' , reject)
      .pipe(stdout    ).on('finish', resolve)
  })
}

function create(io) {
  return Object.create( { run: run }
                      , { stdin:  { get: function () { return io.stdin  } }
                        , stdout: { get: function () { return io.stdout } }
                        }
                      )
}

module.exports = create
