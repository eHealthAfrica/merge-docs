'use strict'
var _        = require('lodash')
  , deepDiff = require('deep-diff')

function diff(merged) {
  return _.assign( {}
                 , merged
                 , { diffs: generateDiffs(merged.doc, merged.sources) }
                 )
}

function generateDiffs(doc, sources) {
  return sources.map(_.partial(generateDiff, _, doc))
}

function generateDiff(lhs, rhs) {
  return deepDiff(lhs, rhs) || []
}

module.exports = diff
