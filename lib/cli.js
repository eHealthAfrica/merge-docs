'use strict'
var _           = require('lodash')
  , JSONStream  = require('JSONStream')
  , chunkStream = require('./chunk-stream')

function run() {
  var parser = JSONStream.parse('rows.*')
    , chunks = chunkStream({groupBy: 'key'})

  this.stdin.pipe(parser).pipe(chunks)

  return new Promise(function (resolve, reject) {
    resolve()
  })
}

function create(io) {
  return Object.create( { run: run }
                      , { stdin: { get: function () { return io.stdin } } }
                      )
}

module.exports = create
