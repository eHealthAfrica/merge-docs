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
  var view       = this.argv[2]
    , request    = this.request
    , parser     = JSONStream.parse('rows.*')
    , chunker    = chunkStream({groupBy: 'key', minLength: 2})
    , sorter     = mapStream(sort)
    , merger     = mapStream(merge)
    , differ     = mapStream(diff)
    , chooser    = mapStream(choose, _.pick(this, ['stdout', 'prompt']))
    , serializer = JSONStream.stringify()
    , stdout     = this.stdout

  return new Promise(function (resolve, reject) {
    if (view == null) {
      reject(new Error('Missing option: database URL'))
    }

    request(view + '?include_docs=true')
      .pipe(parser    ).on('error', reject)
      .pipe(chunker   ).on('error', reject)
      .pipe(sorter    ).on('error', reject)
      .pipe(merger    ).on('error', reject)
      .pipe(differ    ).on('error', reject)
      .pipe(chooser   ).on('error', reject)
      .pipe(serializer).on('error', reject)
      .pipe(stdout)
                       .on('finish', resolve)
  })
}

function create(io) {
  return Object.create( { run: run }
                      , { argv:    { get: function () { return io.argv    } }
                        , stdin:   { get: function () { return io.stdin   } }
                        , stdout:  { get: function () { return io.stdout  } }
                        , stderr:  { get: function () { return io.stderr  } }
                        , prompt:  { get: function () { return io.prompt  } }
                        , request: { get: function () { return io.request } }
                        }
                      )
}

module.exports = create
