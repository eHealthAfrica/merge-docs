'use strict'
var _ = require('lodash')

function merge(sources) {
  var docs = _.pluck(sources, 'doc')
  var merged = _.merge.apply(null , [{}].concat(docs))
  return { doc: merged, sources: docs }
}

module.exports = merge
