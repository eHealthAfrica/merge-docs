'use strict'
var tables = require('./tables')

function choose(merged, io) {
  return new Promise(function (resolve, reject) {
    io.stdout.write(tables(merged))
    resolve(merged)
  })
}

module.exports = choose
