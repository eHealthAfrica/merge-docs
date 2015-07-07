#! /usr/bin/env node

var cli = require('../lib/cli')

process.stdin.setEncoding('utf8')

var io =
  { stdin:  process.stdin
  , stdout: process.stdout
  , stderr: process.stderr
  , argv:   process.argv
  }

cli(io)
  .run()
  .then( function () {
    process.exit()
  })
  .catch( function (e) {
    console.error(e)
    process.exit(1)
  })
