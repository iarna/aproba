'use strict'
var test = require('tap').test
var validate = require('../index.js')

function thrown (t, code, msg, todo) {
  validate('OSSF', arguments)
  try {
    todo()
    t.fail(msg)
  } catch (e) {
    t.comment(e.message)
    if (!t.is(e.code && e.code, code, msg)) {
      t.comment(e.stack)
    }
  }
}

test('aproba arg validation', function (t) {
  thrown(t, 'EMISSINGARG', 'missing first arg is error', function () {
    validate(null, [])
  })
  thrown(t, 'EMISSINGARG', 'missing second arg is error', function () {
    validate('A', null)
  })
  thrown(t, 'EUNKNOWNTYPE', 'invalid type string', function () {
    validate('¶', [])
  })
  thrown(t, 'ETOOMANYERRORTYPES', 'more than one error arg is error', function () {
    validate('OEOEO', [])
  })
  thrown(t, 'EWRONGARGCOUNT', 'too many arguments', function () {
    validate('O', {}, 23)
  })
  thrown(t, 'EWRONGARGCOUNT', 'too few arguments', function () {
    validate('O')
  })
  thrown(t, 'EINVALIDTYPE', 'first arg not string', function () {
    validate([], [])
  })
  thrown(t, 'EINVALIDTYPE', 'second arg not arrayish', function () {
    validate('O', 23)
  })
  t.done()
})
