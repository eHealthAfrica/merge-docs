#! /usr/bin/env node

var cli = require('../lib/cli')

cli()
  .run(process.argv.slice(2))
  .then( function () {
    process.exit()
  })
  .catch( function (e) {
    console.error(e)
    process.exit(1)
  })
