'use strict'
var table = require('./table')

function choose(input, io) {
  return new Promise(function (resolve, reject) {
    io.stdout.write(table(input.diffs))
    io.prompt(
      { type: 'confirm'
      , name: 'merge'
      , message: 'Apply these changes'
      }
    , function (answers) {
        resolve(answers.merge ? input.doc : null)
      }
    )
  })
}

module.exports = choose
