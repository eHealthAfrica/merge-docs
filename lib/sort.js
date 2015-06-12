'use strict'
var sortBy = require('lodash/collection/sortby')

function mofifiedOrCreated(doc) {
  return doc.modifiedDate || doc.createdDate || ''
}

function sort(docs) {
  return sortBy(docs, mofifiedOrCreated)
}

module.exports = sort
