'use strict'
var _    = require('lodash')
  , uuid = require('uuid').v4

function merge(sources) {
  var docs = _.pluck(sources, 'doc')
  var merged = _.merge.apply(null , [{}].concat(docs))
  merged._id = uuid()
  return { doc: merged, sources: docs }
}

module.exports = merge
