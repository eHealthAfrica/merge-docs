'use strict'
var _           = require('lodash')
  , JSONStream  = require('JSONStream')
  , chunkStream = require('./chunk-stream')
  , mapStream   = require('./map-stream')
  , sort        = require('./sort')
  , merge       = require('./merge')
  , diff        = require('./diff')
  , choose      = require('./choose')

function run() {
  var stdin   = this.stdin
    , parser  = JSONStream.parse('rows.*')
    , chunker = chunkStream({groupBy: 'key'})
    , sorter  = mapStream(sort)
    , merger  = mapStream(merge)
    , differ  = mapStream(diff)
    , chooser = mapStream(choose, {stdout: this.stdout, prompt: this.prompt})

  return new Promise(function (resolve, reject) {
    stdin
      .pipe(parser ).on('error', reject)
      .pipe(chunker).on('error', reject)
      .pipe(sorter ).on('error', reject)
      .pipe(merger ).on('error', reject)
      .pipe(differ ).on('error', reject)
      .pipe(chooser).on('error', reject)
                    .on('finish', resolve)
  })
}

function create(io) {
  return Object.create( { run: run }
                      , { stdin:  { get: function () { return io.stdin  } }
                        , stdout: { get: function () { return io.stdout } }
                        , prompt: { get: function () { return io.prompt } }
                        }
                      )
}

module.exports = create
