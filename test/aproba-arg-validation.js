'use strict'
const test = require('tap').test
const validate = require('../index.js')

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

test('aproba arg validation', t => {
  thrown(t, 'EMISSINGARG', 'missing first arg is error', () => {
    validate(null, [])
  })
  thrown(t, 'EMISSINGARG', 'missing second arg is error', () => {
    validate('A', null)
  })
  thrown(t, 'EUNKNOWNTYPE', 'invalid type string', () => {
    validate('¶', [])
  })
  thrown(t, 'ETOOMANYERRORTYPES', 'more than one error arg is error', () => {
    validate('OEOEO', [])
  })
  thrown(t, 'EWRONGARGCOUNT', 'too many arguments', () => {
    validate('O', {}, 23)
  })
  thrown(t, 'EWRONGARGCOUNT', 'too few arguments', () => {
    validate('O')
  })
  thrown(t, 'EINVALIDTYPE', 'first arg not string', () => {
    validate([], [])
  })
  thrown(t, 'EINVALIDTYPE', 'second arg not arrayish', () => {
    validate('O', 23)
  })
  t.done()
})
