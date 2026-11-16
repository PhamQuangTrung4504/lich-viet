import assert from 'node:assert/strict'
import test from 'node:test'
import { createVisibleMonth, parseSupportedYear } from '../src/calendar/month-selection.ts'

test('month picker accepts only supported four-digit Gregorian years', () => {
  assert.equal(parseSupportedYear('2000'), 2000)
  assert.equal(parseSupportedYear('2099'), 2099)
  assert.equal(parseSupportedYear('1999'), null)
  assert.equal(parseSupportedYear('2100'), null)
  assert.equal(parseSupportedYear(''), null)
  assert.equal(parseSupportedYear('2028.5'), null)
  assert.equal(parseSupportedYear('2e3'), null)
  assert.equal(parseSupportedYear(' 2028'), null)
})

test('month picker validates month range before committing visible month', () => {
  assert.deepEqual(createVisibleMonth(2000, 1), { year: 2000, month: 1 })
  assert.deepEqual(createVisibleMonth(2099, 12), { year: 2099, month: 12 })
  assert.equal(createVisibleMonth(1999, 12), null)
  assert.equal(createVisibleMonth(2100, 1), null)
  assert.equal(createVisibleMonth(2028, 0), null)
  assert.equal(createVisibleMonth(2028, 13), null)
  assert.equal(createVisibleMonth(2028.5, 2), null)
})
