import assert from 'node:assert/strict'
import test from 'node:test'
import { getCalendarMonthGrid } from '../src/calendar/month-grid.ts'
import { civilDateToJulianDayNumber, daysInMonth } from '../src/calendar/core.ts'

test('month grid starts Monday and contains only complete weeks', () => {
  for (const [year, month] of [[2000, 1], [2024, 5], [2026, 11], [2099, 12]]) {
    const grid = getCalendarMonthGrid(year, month)
    assert.equal(grid.length % 7, 0)
    const firstWeekday = (civilDateToJulianDayNumber(grid[0].date) + 1 + 6) % 7
    assert.equal(firstWeekday, 0)
    for (let index = 1; index < grid.length; index += 1) {
      assert.equal(
        civilDateToJulianDayNumber(grid[index].date) - civilDateToJulianDayNumber(grid[index - 1].date),
        1,
      )
    }
  }
})

test('month grid flags adjacent dates and protects Calendar Core range edges', () => {
  const january2000 = getCalendarMonthGrid(2000, 1)
  assert.equal(january2000[0].date.year, 1999)
  assert.equal(january2000[0].isWithinSupportedRange, false)
  assert.equal(january2000.find((cell) => cell.date.year === 2000 && cell.date.month === 1 && cell.date.day === 1)?.isWithinSupportedRange, true)

  const december2099 = getCalendarMonthGrid(2099, 12)
  const january2100 = december2099.find((cell) => cell.date.year === 2100)
  assert.ok(january2100)
  assert.equal(january2100.isInVisibleMonth, false)
  assert.equal(january2100.isWithinSupportedRange, false)
})

test('month grid respects Gregorian month lengths and validates its input range', () => {
  const february2024 = getCalendarMonthGrid(2024, 2)
  assert.equal(daysInMonth(2024, 2), 29)
  assert.equal(february2024.filter((cell) => cell.isInVisibleMonth).length, 29)
  assert.equal(getCalendarMonthGrid(2023, 2).filter((cell) => cell.isInVisibleMonth).length, 28)
  assert.throws(() => getCalendarMonthGrid(1999, 12), RangeError)
  assert.throws(() => getCalendarMonthGrid(2100, 1), RangeError)
  assert.throws(() => getCalendarMonthGrid(2024, 13), RangeError)
})
