#! /usr/bin/env node
var _        = require('lodash')
  , request  = require('request')
  , inquirer = require('inquirer')
  , cli      = require('../lib/cli')

process.stdin.setEncoding('utf8')

var io = { stdin:   process.stdin
         , stdout:  process.stdout
         , stderr:  process.stdout
         , argv:    process.argv
         , request: request
         , prompt:  inquirer.prompt
         }

cli(io)
  .run()
  .then( function () {
    console.log('Done.')
    process.exit()
  })
  .catch( function (e) {
    console.error('Aborted due to error.')
    console.error(e)
    process.exit(1)
  })
