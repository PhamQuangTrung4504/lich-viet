import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import test from 'node:test'
import { createCivilDate, daysInMonth } from '../src/calendar/core.ts'
import { VERIFIED_EVENTS } from '../src/events/data.ts'
import { findEventsForDate, getTodayAndTomorrow } from '../src/events/engine.ts'
import type { CalendarEvent, EventRule } from '../src/events/model.ts'

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

function assertValidRule(rule: EventRule): void {
  switch (rule.type) {
    case 'solar_fixed':
      assert.ok(Number.isInteger(rule.month) && rule.month >= 1 && rule.month <= 12)
      assert.ok(Number.isInteger(rule.day) && rule.day >= 1 && rule.day <= daysInMonth(2000, rule.month))
      if (rule.startYear !== undefined) {
        assert.ok(Number.isInteger(rule.startYear) && rule.startYear >= 1 && rule.startYear <= 9999)
      }
      break
    case 'lunar_fixed':
      assert.ok(Number.isInteger(rule.month) && rule.month >= 1 && rule.month <= 12)
      assert.ok(Number.isInteger(rule.day) && rule.day >= 1 && rule.day <= 30)
      assert.ok(['regular_only', 'leap_only', 'both'].includes(rule.leapMonthPolicy))
      break
    case 'lunar_month_end':
      assert.ok(Number.isInteger(rule.month) && rule.month >= 1 && rule.month <= 12)
      break
    case 'weekday_rule':
      assert.ok(Number.isInteger(rule.month) && rule.month >= 1 && rule.month <= 12)
      assert.ok(Number.isInteger(rule.weekday) && rule.weekday >= 0 && rule.weekday <= 6)
      assert.ok(rule.occurrence === 'last'
        || (Number.isInteger(rule.occurrence) && rule.occurrence >= 1 && rule.occurrence <= 5))
      break
    case 'year_specific': {
      const date = rule.date
      assert.doesNotThrow(() => createCivilDate(date.year, date.month, date.day))
      assert.ok(date.year >= 2000 && date.year <= 2099)
      break
    }
  }
}

test('solar fixed rules repeat annually and match leap day only when valid', () => {
  const leapDayEvent = fixture('leap-day', 1, { type: 'solar_fixed', month: 2, day: 29 })
  assert.deepEqual(findEventsForDate(createCivilDate(2024, 2, 29), [leapDayEvent]), [leapDayEvent])
  assert.deepEqual(findEventsForDate(createCivilDate(2023, 2, 28), [leapDayEvent]), [])
  assert.equal(findEventsForDate(createCivilDate(2024, 1, 1)).some((event) => event.id === 'new-year-day'), true)
  assert.equal(findEventsForDate(createCivilDate(2025, 1, 1)).some((event) => event.id === 'new-year-day'), true)
})

test('solar fixed rules with a start year are excluded before it and recur through the supported range', () => {
  const cultureDay = VERIFIED_EVENTS.find(({ id }) => id === 'vietnam-culture-day')
  assert.ok(cultureDay)
  assert.deepEqual(findEventsForDate(createCivilDate(2025, 11, 24)).some(({ id }) => id === cultureDay.id), false)
  for (const year of [2026, 2027, 2030, 2099]) {
    assert.equal(findEventsForDate(createCivilDate(year, 11, 24)).some(({ id }) => id === cultureDay.id), true)
  }
  assert.equal(findEventsForDate(createCivilDate(2026, 1, 1)).some(({ id }) => id === 'new-year-day'), true)
  assert.equal(findEventsForDate(createCivilDate(2027, 1, 1)).some(({ id }) => id === 'new-year-day'), true)
})

test('lunar rules use Vietnamese lunar conversion and explicit leap-month policies', () => {
  const regular = fixture('regular', 1, { type: 'lunar_fixed', month: 2, day: 1, leapMonthPolicy: 'regular_only' })
  const leap = fixture('leap', 2, { type: 'lunar_fixed', month: 2, day: 1, leapMonthPolicy: 'leap_only' })
  const both = fixture('both', 3, { type: 'lunar_fixed', month: 2, day: 1, leapMonthPolicy: 'both' })
  for (const event of [regular, leap, both]) assertValidRule(event.rule)

  assert.deepEqual(findEventsForDate(createCivilDate(2023, 2, 20), [regular, leap, both]).map(({ id }) => id), ['regular', 'both'])
  assert.deepEqual(findEventsForDate(createCivilDate(2023, 3, 22), [regular, leap, both]).map(({ id }) => id), ['leap', 'both'])
  assert.equal(findEventsForDate(createCivilDate(2026, 2, 17)).some(({ id }) => id === 'lunar-new-year-day-1'), true)
  assert.equal(findEventsForDate(createCivilDate(2025, 1, 29)).some(({ id }) => id === 'lunar-new-year-day-1'), true)
})

test('lunar month end matches the actual final day of month twelve, whether day 29 or 30', () => {
  // External Vietnamese-calendar anchors: https://baonghean.vn/am-duong-lich-ngay-9-thang-2-nam-2024.html,
  // https://thuvienphapluat.vn/chinh-sach-phap-luat-moi/vn/ho-tro-phap-luat/tu-van-phap-luat/59715/tet-am-lich-2025-la-ngay-may-duong-lich-con-may-ngay-nua-den-tet-am-lich-2025,
  // and https://amlich.org/xem-lich-nam/2026.
  const eve = fixture('lunar-eve', 1, { type: 'lunar_month_end', month: 12 })
  assert.deepEqual(findEventsForDate(createCivilDate(2024, 2, 9), [eve]), [eve])
  assert.deepEqual(findEventsForDate(createCivilDate(2025, 1, 28), [eve]), [eve])
  assert.deepEqual(findEventsForDate(createCivilDate(2026, 2, 16), [eve]), [eve])
  assert.deepEqual(findEventsForDate(createCivilDate(2025, 1, 27), [eve]), [])
})

test('weekday rules support nth and last Sunday, and year-specific rules match one civil date', () => {
  const firstSunday = fixture('first-sunday', 1, { type: 'weekday_rule', month: 11, weekday: 0, occurrence: 1 })
  const lastSunday = fixture('last-sunday', 2, { type: 'weekday_rule', month: 11, weekday: 0, occurrence: 'last' })
  assertValidRule(firstSunday.rule)
  assertValidRule(lastSunday.rule)
  assert.deepEqual(findEventsForDate(createCivilDate(2024, 11, 3), [firstSunday, lastSunday]), [firstSunday])
  assert.deepEqual(findEventsForDate(createCivilDate(2024, 11, 24), [firstSunday, lastSunday]), [lastSunday])

  const oneYear = fixture('one-year', 3, { type: 'year_specific', date: createCivilDate(2024, 2, 29) })
  assertValidRule(oneYear.rule)
  assert.deepEqual(findEventsForDate(createCivilDate(2024, 2, 29), [oneYear]), [oneYear])
  assert.deepEqual(findEventsForDate(createCivilDate(2025, 2, 28), [oneYear]), [])
})

test('multiple real events remain distinct, results are ordered, and duplicate IDs keep the first sorted entry', () => {
  const nov20 = findEventsForDate(createCivilDate(2026, 11, 20))
  assert.deepEqual(nov20.map(({ id }) => id), ['vietnamese-teachers-day', 'world-childrens-day'])
  assert.deepEqual(nov20.map(({ title }) => title), ['Ngày Nhà giáo Việt Nam', 'Ngày Trẻ em Thế giới'])
  assert.ok(nov20.every((event) => event.sources.length > 0))
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

test('year-specific rules still match only their exact year', () => {
  const oneYear = fixture('one-year', 1, { type: 'year_specific', date: createCivilDate(2026, 11, 24) })
  assert.deepEqual(findEventsForDate(createCivilDate(2025, 11, 24), [oneYear]), [])
  assert.deepEqual(findEventsForDate(createCivilDate(2026, 11, 24), [oneYear]), [oneYear])
  assert.deepEqual(findEventsForDate(createCivilDate(2027, 11, 24), [oneYear]), [])
})

test('verified event data includes unique IDs, required metadata, and HTTPS URL syntax', () => {
  const ids = VERIFIED_EVENTS.map(({ id }) => id)
  assert.equal(new Set(ids).size, ids.length)
  for (const event of VERIFIED_EVENTS) {
    assert.ok(event.id.trim().length > 0)
    assert.ok(event.title.trim().length > 0)
    assert.ok(event.description.trim().length > 0)
    assert.ok(event.sources.length > 0)
    assert.ok(Number.isInteger(event.sortOrder))
    assert.ok(['official_holiday', 'commemoration', 'traditional', 'international'].includes(event.category))
    assertValidRule(event.rule)
    for (const source of event.sources) {
      assert.ok(source.publisher.trim().length > 0)
      assert.ok(source.title.trim().length > 0)
      assert.equal(new URL(source.url).protocol, 'https:')
    }
  }
})

test('independent lunar references map Hạ Nguyên to the fifteenth day in 2025–2027', () => {
  // Cross-check: https://amlich.org/xem-lich-nam/2025,
  // https://amlichchuan.com/le/ram-thang-10/2026,
  // https://amlichchuan.com/le/ram-thang-10/2027 and https://amlich.org/xem-lich-nam/2027.
  const expected = [
    [2025, 12, 4],
    [2026, 11, 23],
    [2027, 11, 12],
  ] as const
  for (const [year, month, day] of expected) {
    const matched = findEventsForDate(createCivilDate(year, month, day)).map(({ id }) => id)
    assert.ok(matched.includes('ha-nguyen'), `${year}-${month}-${day} should be Hạ Nguyên`)
  }
  for (const date of [createCivilDate(2025, 11, 23), createCivilDate(2026, 12, 4), createCivilDate(2027, 11, 18)]) {
    assert.equal(findEventsForDate(date).some(({ id }) => id === 'ha-nguyen'), false)
  }
})

test('verified production events cover the reported dates and retain category priority', () => {
  // 18/11/2026 = 10/10 lunar per https://amlichchuan.com/lich-am/2026-11-18;
  // 23/11/2026 = 15/10 lunar per https://amlichchuan.com/le/ram-thang-10/2026;
  // 8/10/2027 = 9/9 lunar per https://amlich.org/xem-lich-nam/2027.
  const ids = (year: number, month: number, day: number) =>
    findEventsForDate(createCivilDate(year, month, day)).map(({ id }) => id)
  const november23 = ids(2026, 11, 23)
  assert.ok(november23.includes('ha-nguyen'))
  assert.ok(november23.includes('vietnam-red-cross-founding-day'))
  assert.deepEqual(november23.filter((id) => id === 'ha-nguyen' || id === 'vietnam-red-cross-founding-day'), [
    'ha-nguyen', 'vietnam-red-cross-founding-day',
  ])
  assert.ok(ids(2025, 11, 23).includes('vietnam-red-cross-founding-day'))
  assert.ok(ids(2027, 11, 23).includes('vietnam-red-cross-founding-day'))
  assert.ok(ids(2026, 11, 18).includes('trung-thap'))
  assert.ok(ids(2027, 10, 8).includes('trung-cuu'))
  assert.ok(ids(2026, 11, 9).includes('vietnam-law-day'))
  assert.deepEqual(ids(2026, 11, 20).slice(0, 2), ['vietnamese-teachers-day', 'world-childrens-day'])
  assert.ok(ids(2026, 11, 24).includes('vietnam-culture-day'))
  assert.ok(ids(2026, 2, 14).includes('valentines-day'))
  assert.ok(ids(2025, 1, 28).includes('lunar-new-year-eve'))
  assert.deepEqual(ids(2025, 12, 4).filter((id) => id === 'ha-nguyen'), ['ha-nguyen'])
})

test('all events present before the dataset expansion remain available', () => {
  const retainedIds = [
    'new-year-day', 'lunar-new-year-day-1', 'nguyen-tieu', 'valentines-day',
    'international-womens-day', 'hung-kings-day', 'world-water-day', 'reunification-day',
    'international-workers-day', 'international-childrens-day', 'doan-ngo', 'world-environment-day',
    'vietnam-press-day', 'vietnam-family-day', 'war-invalids-martyrs-day', 'august-revolution-day',
    'national-day', 'international-literacy-day', 'international-day-of-peace', 'mid-autumn-festival',
    'world-teachers-day', 'vietnamese-womens-day', 'world-childrens-day', 'vietnamese-teachers-day',
    'vietnam-culture-day', 'world-aids-day', 'human-rights-day', 'vietnam-peoples-army-day', 'christmas-day',
  ]
  const currentIds = new Set(VERIFIED_EVENTS.map(({ id }) => id))
  for (const id of retainedIds) assert.ok(currentIds.has(id), `${id} must be retained`)
})
