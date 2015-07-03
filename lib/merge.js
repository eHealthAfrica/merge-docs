'use strict'
var _    = require('lodash')
  , uuid = require('uuid').v4

function trackMigration(doc, originals) {
  doc.sources = doc.sources || []
  doc.sources.push(
    { type: 'migration'
    , name: 'merge-docs'
    , timestamp: Date.now()
    , docs: originals
    }
  )
  return doc
}

function merge(sources) {
  var docs = _.pluck(sources, 'doc')
  var merged = _.merge.apply(null , [{}].concat(docs))
  merged._id = uuid()
  trackMigration(merged, docs)
  return { doc: _.omit(merged, '_rev')
         , sources: docs
         , ids: _.pluck(docs, '_id')}
}

module.exports = merge
