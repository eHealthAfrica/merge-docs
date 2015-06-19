'use strict'
var _ = require('lodash')

function merge(sources) {
  var merged = _.merge.apply(null , [{}].concat(sources))
  return { doc: merged, sources: sources }
}

module.exports = merge
