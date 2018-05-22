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

test('user arg validation', t => {
  const values = {
    'A': [],
    'S': 'test',
    'N': 123,
    'F': () => {},
    'O': {},
    'B': false,
    'E': new Error()
  }
  Object.keys(values).forEach(type => {
    Object.keys(values).forEach(contraType => {
      if (type === contraType) {
        notThrown(t, type + ' matches ' + contraType, () => {
          validate(type, [values[contraType]])
        })
      } else {
        thrown(t, 'EINVALIDTYPE', type + ' does not match ' + contraType, () => {
          validate(type, [values[contraType]])
        })
      }
    })
    if (type === 'E') {
      notThrown(t, 'null is ok for E', () => {
        validate(type, [null])
      })
    } else {
      thrown(t, 'EINVALIDTYPE', 'null throws for ' + type, () => {
        validate(type, [null])
      })
    }
  })
  Object.keys(values).forEach(contraType => {
    notThrown(t, '* matches ' + contraType, () => {
      validate('*', [values[contraType]])
    })
  })
  thrown(t, 'EWRONGARGCOUNT', 'not enough args', () => {
    validate('SNF', ['abc', 123])
  })
  thrown(t, 'EWRONGARGCOUNT', 'too many args', () => {
    validate('SNF', ['abc', 123, () => {}, true])
  })
  notThrown(t, 'E matches null', () => {
    validate('E', [null])
  })
  notThrown(t, 'E matches undefined', () => {
    validate('E', [undefined])
  })
  notThrown(t, 'E matches empty', () => {
    validate('E', [])
  })
  notThrown(t, 'E w/ error requires nothing else', () => {
    validate('ESN', [new Error()])
  })
  notThrown(t, 'E w/ error ok with all args', () => {
    validate('ESN', [new Error(), 'foo', 23])
  })
  thrown(t, 'EWRONGARGCOUNT', 'E w/ error NOT ok with partial args', () => {
    validate('ESN', [new Error(), 'foo'])
  })
  thrown(t, 'EWRONGARGCOUNT', 'E w/o error works as usual', () => {
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
