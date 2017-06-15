var AJV = require('ajv')
var http = require('http-https')
var schema = require('./schema')
var tape = require('tape')
var url = require('url')

var data = require('./')
var validate = new AJV().compile(schema)

data.map(function (entry) {
  tape(entry.name, function (test) {
    validate(entry)
    test.equal(
      validate.errors, null,
      'matches schema'
    )
    if (entry.fields) {
      var sortedFields = entry.fields
        .concat()
        .sort()
      test.deepEqual(
        entry.fields, sortedFields,
        'fields sorted'
      )
    }
    responds(test, entry, function () {
      test.end()
    })
  })
})

function responds (test, entry, callback) {
  var parsed = url.parse(entry.url)
  parsed.headers = {
    // Spoof Chrome.  Otherwise, arxiv.org 403s.
    accept: 'text/html,application/xhtml+xml,application/xml',
    'user-agent': (
      'Mozilla/5.0 (X11; Linux x86_64) ' +
      'AppleWebKit/537.36 (KHTML, like Gecko) ' +
      'Chrome/58.0.3029.110 ' +
      'Safari/537.36'
    )
  }
  http.get(parsed, function (response) {
    test.assert(
      response.statusCode === 200 ||
      response.statusCode === 302,
      'responds 200 or 302'
    )
    callback()
  })
}
