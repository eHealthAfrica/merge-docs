'use strict'
var test = require('redtape')()

var sort = require('../lib/sort')

test('sorts docs by date of last modification', function (t) {
  var docs = [ { modifiedDate: '2015-02-01T00:00:00.000Z' }
             , { modifiedDate: '2015-03-01T00:00:00.000Z' }
             , { modifiedDate: '2015-01-01T00:00:00.000Z' }
             ]
  var output = sort(docs)
  t.deepEqual(output, [ { modifiedDate: '2015-01-01T00:00:00.000Z' }
                      , { modifiedDate: '2015-02-01T00:00:00.000Z' }
                      , { modifiedDate: '2015-03-01T00:00:00.000Z' }
                      ])
  t.end()
})

test('falls back to date of creation', function (t) {
  var docs = [ { modifiedDate: '2015-02-01T00:00:00.000Z' }
             , { createdDate:  '2015-03-01T00:00:00.000Z' }
             , { modifiedDate: '2015-01-01T00:00:00.000Z' }
             ]
  var output = sort(docs)
  t.deepEqual(output, [ { modifiedDate: '2015-01-01T00:00:00.000Z' }
                      , { modifiedDate: '2015-02-01T00:00:00.000Z' }
                      , { createdDate:  '2015-03-01T00:00:00.000Z' }
                      ])
  t.end()
})

test('prefers date of modification', function (t) {
  var docs = [ { createdDate:  '2015-01-01T00:00:00.000Z'
               , modifiedDate: '2015-03-01T00:00:00.000Z'
               }
             , { modifiedDate: '2015-02-01T00:00:00.000Z' }
             ]
  var output = sort(docs)
  t.deepEqual(output, [ { modifiedDate: '2015-02-01T00:00:00.000Z' }
                      , { createdDate:  '2015-01-01T00:00:00.000Z'
                        , modifiedDate: '2015-03-01T00:00:00.000Z'
                        }
                      ])
  t.end()
})

test('treats docs without any date as being old', function (t) {
  var docs = [ { modifiedDate: '2015-02-01T00:00:00.000Z' }
             , { foo: 'bar' }
             , { modifiedDate: '2015-01-01T00:00:00.000Z' }
             ]
  var output = sort(docs)
  t.deepEqual(output, [ { foo: 'bar' }
                      , { modifiedDate: '2015-01-01T00:00:00.000Z' }
                      , { modifiedDate: '2015-02-01T00:00:00.000Z' }
                      ])
  t.end()

})

