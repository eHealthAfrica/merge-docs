'use strict'

function run () {
  return new Promise(function (resolve, reject) { resolve('done') })
}

module.exports = { run: run }
