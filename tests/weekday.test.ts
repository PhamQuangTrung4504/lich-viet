import assert from 'node:assert/strict'
import test from 'node:test'
import { createCivilDate } from '../src/calendar/core.ts'
import { formatVietnameseWeekday } from '../src/calendar/weekday.ts'

test('Vietnamese civil weekday labels match fixed Gregorian references', () => {
  const cases = [
    { date: createCivilDate(2026, 11, 16), expected: 'Thứ Hai' },
    { date: createCivilDate(2026, 11, 17), expected: 'Thứ Ba' },
    { date: createCivilDate(2026, 11, 20), expected: 'Thứ Sáu' },
    { date: createCivilDate(2026, 11, 1), expected: 'Chủ nhật' },
  ] as const

  for (const { date, expected } of cases) {
    assert.equal(formatVietnameseWeekday(date), expected)
  }
})
