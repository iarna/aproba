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

function notThrown (t, msg, todo) {
  validate('OSF', arguments)
  try {
    todo()
    t.pass(msg)
  } catch (e) {
    t.comment(e.stack)
    t.fail(msg)
  }
}

test("aproba arg validation", function (t) {
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

test('user arg validation', function (t) {
  var values = {
    'A': [],
    'S': 'test',
    'N': 123,
    'F': function () {},
    'O': {},
    'B': false,
    'E': new Error()
  }
  Object.keys(values).forEach(function (type) {
    Object.keys(values).forEach(function (contraType) {
      if (type === contraType) {
        notThrown(t, type + ' matches ' + contraType, function () {
          validate(type, [values[contraType]])
        })
      } else {
        thrown(t, 'EINVALIDTYPE', type + ' does not match ' + contraType, function () {
          validate(type, [values[contraType]])
        })
      }
    })
    if (type === 'E') {
      notThrown(t, 'null is ok for E', function () {
        validate(type, [null])
      })
    } else {
      thrown(t, 'EINVALIDTYPE', 'null throws for ' + type, function () {
        validate(type, [null])
      })
    }
  })
  Object.keys(values).forEach(function (contraType) {
    notThrown(t, '* matches ' + contraType, function () {
      validate('*', [values[contraType]])
    })
  })
  thrown(t, 'EWRONGARGCOUNT', 'not enough args', function () {
    validate('SNF', ['abc', 123])
  })
  thrown(t, 'EWRONGARGCOUNT', 'too many args', function () {
    validate('SNF', ['abc', 123, function () {}, true])
  })
  notThrown(t, 'E matches null', function () {
    validate('E', [null])
  })
  notThrown(t, 'E matches undefined', function () {
    validate('E', [undefined])
  })
  notThrown(t, 'E w/ error requires nothing else', function () {
    validate('ESN', [new Error()])
  })
  notThrown(t, 'E w/ error ok with all args', function () {
    validate('ESN', [new Error(), 'foo', 23])
  })
  thrown(t, 'EWRONGARGCOUNT', 'E w/ error NOT ok with partial args', function () {
    validate('ESN', [new Error(), 'foo'])
  })
  thrown(t, 'EWRONGARGCOUNT', 'E w/o error works as usual', function () {
    validate('ESN', [null, 'foo'])
  })
  try {
    validate('O', [[]])
    t.fail('object != array')
  } catch (ex) {
    t.match(ex.message, /Expected object but got array/, 'When reporting non-objects, uses aproba types')
  }
  t.done()
})
