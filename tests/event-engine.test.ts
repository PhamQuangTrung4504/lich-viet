import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import test from 'node:test'
import { createCivilDate } from '../src/calendar/core.ts'
import { VERIFIED_EVENTS } from '../src/events/data.ts'
import { findEventsForDate, getTodayAndTomorrow } from '../src/events/engine.ts'
import type { CalendarEvent } from '../src/events/model.ts'

const fixtureSource = [{
  publisher: 'Cổng Thông tin điện tử Chính phủ',
  title: 'Bộ luật Lao động 45/2019/QH14, Điều 112',
  url: 'https://vanban.chinhphu.vn/?docid=198540&pageid=27160',
}]

function fixture(id: string, sortOrder: number, rule: CalendarEvent['rule']): CalendarEvent {
  return {
    id,
    title: `Fixture ${id}`,
    category: 'commemoration',
    rule,
    description: 'Dữ liệu fixture chỉ dùng để kiểm thử quy tắc matching.',
    sources: fixtureSource,
    sortOrder,
  }
}

test('solar fixed rules repeat annually and match leap day only when valid', () => {
  const leapDayEvent = fixture('leap-day', 1, { type: 'solar_fixed', month: 2, day: 29 })
  assert.deepEqual(findEventsForDate(createCivilDate(2024, 2, 29), [leapDayEvent]), [leapDayEvent])
  assert.deepEqual(findEventsForDate(createCivilDate(2023, 2, 28), [leapDayEvent]), [])
  assert.equal(findEventsForDate(createCivilDate(2024, 1, 1)).some((event) => event.id === 'new-year-day'), true)
  assert.equal(findEventsForDate(createCivilDate(2025, 1, 1)).some((event) => event.id === 'new-year-day'), true)
})

test('lunar rules use Vietnamese lunar conversion and explicit leap-month policies', () => {
  const regular = fixture('regular', 1, { type: 'lunar_fixed', month: 2, day: 1, leapMonthPolicy: 'regular_only' })
  const leap = fixture('leap', 2, { type: 'lunar_fixed', month: 2, day: 1, leapMonthPolicy: 'leap_only' })
  const both = fixture('both', 3, { type: 'lunar_fixed', month: 2, day: 1, leapMonthPolicy: 'both' })

  assert.deepEqual(findEventsForDate(createCivilDate(2023, 2, 20), [regular, leap, both]).map(({ id }) => id), ['regular', 'both'])
  assert.deepEqual(findEventsForDate(createCivilDate(2023, 3, 22), [regular, leap, both]).map(({ id }) => id), ['leap', 'both'])
  assert.equal(findEventsForDate(createCivilDate(2026, 2, 17)).some(({ id }) => id === 'lunar-new-year-day-1'), true)
  assert.equal(findEventsForDate(createCivilDate(2025, 1, 29)).some(({ id }) => id === 'lunar-new-year-day-1'), true)
})

test('weekday rules support nth and last Sunday, and year-specific rules match one civil date', () => {
  const firstSunday = fixture('first-sunday', 1, { type: 'weekday_rule', month: 11, weekday: 0, occurrence: 1 })
  const lastSunday = fixture('last-sunday', 2, { type: 'weekday_rule', month: 11, weekday: 0, occurrence: 'last' })
  assert.deepEqual(findEventsForDate(createCivilDate(2024, 11, 3), [firstSunday, lastSunday]), [firstSunday])
  assert.deepEqual(findEventsForDate(createCivilDate(2024, 11, 24), [firstSunday, lastSunday]), [lastSunday])

  const oneYear = fixture('one-year', 3, { type: 'year_specific', date: createCivilDate(2024, 2, 29) })
  assert.deepEqual(findEventsForDate(createCivilDate(2024, 2, 29), [oneYear]), [oneYear])
  assert.deepEqual(findEventsForDate(createCivilDate(2025, 2, 28), [oneYear]), [])
})

test('multiple real events remain distinct, results are ordered, and duplicate IDs keep the first sorted entry', () => {
  const nov20 = findEventsForDate(createCivilDate(2026, 11, 20))
  assert.deepEqual(nov20.map(({ id }) => id), ['world-childrens-day', 'vietnamese-teachers-day'])
  assert.deepEqual(findEventsForDate(createCivilDate(2026, 2, 15)), [])

  const later = fixture('duplicate', 20, { type: 'solar_fixed', month: 4, day: 30 })
  const earlier = fixture('duplicate', 10, { type: 'solar_fixed', month: 4, day: 30 })
  const another = fixture('another', 15, { type: 'solar_fixed', month: 4, day: 30 })
  assert.deepEqual(findEventsForDate(createCivilDate(2024, 4, 30), [later, another, earlier]), [earlier, another])
})

test('device today/tomorrow crosses month and year boundaries as civil dates', () => {
  const result = getTodayAndTomorrow(new Date(2024, 11, 31, 23, 45), [])
  assert.deepEqual(result.today.date, createCivilDate(2024, 12, 31))
  assert.deepEqual(result.tomorrow.date, createCivilDate(2025, 1, 1))
})

test('tomorrow remains correct across a DST transition in the device timezone', () => {
  const script = [
    "import { getTodayAndTomorrow } from './src/events/engine.ts'",
    "const result = getTodayAndTomorrow(new Date(2024, 2, 10, 23, 30), [])",
    "process.stdout.write(`${result.today.date.year}-${result.today.date.month}-${result.today.date.day}|${result.tomorrow.date.year}-${result.tomorrow.date.month}-${result.tomorrow.date.day}`)",
  ].join('; ')
  const child = spawnSync(process.execPath, ['--experimental-strip-types', '--input-type=module', '-e', script], {
    cwd: process.cwd(),
    encoding: 'utf8',
    env: { ...process.env, TZ: 'America/New_York' },
  })
  assert.equal(child.status, 0, child.stderr)
  assert.equal(child.stdout, '2024-3-10|2024-3-11')
})

test('invalid dates, invalid instants, and dates outside Calendar Core range are rejected', () => {
  assert.throws(() => findEventsForDate({ year: 2023, month: 2, day: 29 }), RangeError)
  assert.throws(() => findEventsForDate(createCivilDate(1999, 12, 31)), RangeError)
  assert.throws(() => findEventsForDate(createCivilDate(2100, 1, 1)), RangeError)
  assert.throws(() => getTodayAndTomorrow(new Date(Number.NaN), []), RangeError)
  assert.throws(() => getTodayAndTomorrow(new Date(2099, 11, 31, 23, 59), []), RangeError)
})

test('verified event data has unique IDs, required metadata, and resolvable HTTP source URLs', () => {
  const ids = VERIFIED_EVENTS.map(({ id }) => id)
  assert.equal(new Set(ids).size, ids.length)
  assert.equal(VERIFIED_EVENTS.length, 29)
  assert.deepEqual({
    official_holiday: VERIFIED_EVENTS.filter(({ category }) => category === 'official_holiday').length,
    commemoration: VERIFIED_EVENTS.filter(({ category }) => category === 'commemoration').length,
    traditional: VERIFIED_EVENTS.filter(({ category }) => category === 'traditional').length,
    international: VERIFIED_EVENTS.filter(({ category }) => category === 'international').length,
  }, { official_holiday: 7, commemoration: 7, traditional: 3, international: 12 })
  for (const event of VERIFIED_EVENTS) {
    assert.ok(event.id.trim().length > 0)
    assert.ok(event.title.trim().length > 0)
    assert.ok(event.description.trim().length > 0)
    assert.ok(event.sources.length > 0)
    assert.ok(Number.isFinite(event.sortOrder))
    for (const source of event.sources) {
      assert.ok(source.publisher.trim().length > 0)
      assert.ok(source.title.trim().length > 0)
      assert.equal(new URL(source.url).protocol, 'https:')
    }
  }
})
