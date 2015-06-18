'use strict'
var table = require('./table')

function choose(input, io) {
  return new Promise(function (resolve, reject) {
    io.stdout.write(table(input.diffs))
    resolve(input)
  })
}

module.exports = choose
