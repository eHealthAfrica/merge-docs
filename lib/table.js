'use strict'
var _     = require('lodash')
  , Table = require('cli-table')

function table(diffs) {
  var renderer = new Table({ head: headers(diffs.length) })
  renderer.push.apply(renderer, rows(diffs))
  return renderer.toString()
}

function headers(count) {
  var indices =_.range(1, count + 1).map(String)
  return ['', 'Merged'].concat(indices)
}

function rows(diffs) {
  var expanded = diffs.map(function (col) {
    return _.flatten(col.map(expand))
  })
  return paths(expanded).map(_.partial(row, _, expanded))
}

function expand(diff) {
  var expanded = [ diff ]
  if (diff.lhs && typeof diff.lhs === 'object') {
    expanded = expandValue(diff, 'lhs')
  } else if (diff.rhs && typeof diff.rhs === 'object') {
    expanded = expandValue(diff, 'rhs')
  } else if (diff.index != null) {
    expanded = [ expandPath(diff) ]
  }
  return expanded
}

// TODO 150622 [tc] rather do the diffing we want at the first place
function expandValue(diff, prop) {
  return _.chain(diff[prop])
           .map(function (value, key) {
             return _.chain({})
               .assign(diff, { path: diff.path.concat(key) })
               .set(prop, value)
               .value()
           })
           .map(expand).flatten().value()
}

function expandPath(diff) {
  return _.assign( diff
                 , { path: diff.path.concat(diff.index) }
                 , _.pick(diff.item, ['lhs', 'rhs', 'kind'])
                 )
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
