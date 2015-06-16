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
  return sources
    .map(_.partial(generateDiff, _, doc))
    .map(_.partial(_.groupBy, _, parentPath))
}

function generateDiff(lhs, rhs) {
  return deepDiff(lhs, rhs) || []
}

function parentPath(diff) {
  return '/' + diff.path.slice(0, -1).join('/')
}

module.exports = diff
