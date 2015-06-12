'use strict'
var _ = require('lodash')

function merge(sources) {
  var merged = _.merge.apply(null , [{}].concat(sources).concat(mergeProperty))
  return { doc: merged, sources: sources }
}

function mergeProperty(a, b) {
  if (_.isArray(a) && _.isArray(b)) {
    return a.concat(b)
  }
}

module.exports = merge
