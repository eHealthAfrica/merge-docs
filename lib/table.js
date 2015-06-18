'use strict'
var _     = require('lodash')
  , Table = require('cli-table')

function table(diffs) {
  var renderer = new Table({ head: headers(diffs) })
  renderer.push.apply(renderer, rows(diffs))
  return renderer.toString()
}

function headers(diffs) {
  var indices =_.range(1, diffs.length + 1).map(String)
  return ['', 'Merged'].concat(indices)
}

function rows(diffs) {
  return paths(diffs).map(_.partial(row, _, diffs))
}

function paths(diffs) {
  return _.chain(diffs).flatten().pluck('path').uniq(false, String).value()
}

function row(path, diffs) {
  return _.set({}, label(path), values(path, diffs))
}

function label(path) {
  return path.join('/')
}

function values(path, diffs) {
  var columns = diffs.map(function (d) { return _.where(d, {path: path}) })
    , merged  = rhs(columns)
    , sources = lhs(columns, merged)
  return [merged].concat(sources)
}

function rhs(columns) {
  return _.chain(columns).pluck('[0].rhs').compact().first().value()
}

function lhs(columns, rhs) {
  return columns.map(function (c) { return (c.length) ? c[0].lhs : rhs })
}

module.exports = table
