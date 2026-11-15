import assert from 'node:assert/strict'
import test from 'node:test'
import {
  civilDateAtDeviceTime,
  civilDateToJulianDayNumber,
  createCivilDate,
  daysInMonth,
  isGregorianLeapYear,
  julianDayNumberToCivilDate,
  solarToVietnameseLunar,
  vietnameseLunarToSolar,
} from '../src/calendar/core.ts'

test('Gregorian leap years and real month lengths are validated', () => {
  assert.equal(isGregorianLeapYear(2000), true)
  assert.equal(isGregorianLeapYear(1900), false)
  assert.equal(isGregorianLeapYear(2024), true)
  assert.equal(isGregorianLeapYear(2023), false)
  assert.equal(daysInMonth(2024, 2), 29)
  assert.equal(daysInMonth(2023, 2), 28)
  assert.equal(daysInMonth(2024, 4), 30)
  assert.equal(daysInMonth(2024, 12), 31)
  assert.doesNotThrow(() => createCivilDate(2024, 2, 29))
  assert.throws(() => createCivilDate(2023, 2, 29), RangeError)
  assert.throws(() => createCivilDate(2024, 4, 31), RangeError)
  assert.throws(() => createCivilDate(2024, 13, 1), RangeError)
  assert.throws(() => createCivilDate(0, 1, 1), RangeError)
  for (const invalid of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, 2024.5]) {
    assert.throws(() => createCivilDate(invalid, 1, 1), RangeError)
    assert.throws(() => createCivilDate(2024, invalid, 1), RangeError)
    assert.throws(() => createCivilDate(2024, 1, invalid), RangeError)
  }
  assert.throws(() => daysInMonth(Number.NaN, 1), RangeError)
  assert.throws(() => daysInMonth(2024, Number.POSITIVE_INFINITY), RangeError)
})

test('Gregorian/JDN conversion preserves month, year, and leap-day boundaries', () => {
  const dates = [
    createCivilDate(2000, 1, 1),
    createCivilDate(2024, 2, 29),
    createCivilDate(2024, 3, 1),
    createCivilDate(2099, 12, 31),
  ]
  for (const date of dates) {
    assert.deepEqual(julianDayNumberToCivilDate(civilDateToJulianDayNumber(date)), date)
  }
  assert.equal(civilDateToJulianDayNumber(createCivilDate(2000, 1, 1)), 2451545)
  for (const invalid of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, 2451545.5]) {
    assert.throws(() => julianDayNumberToCivilDate(invalid), RangeError)
  }
})

test('device civil date uses local calendar fields and rejects invalid instants', () => {
  const instant = new Date(2026, 1, 17, 0, 5)
  assert.deepEqual(civilDateAtDeviceTime(instant), createCivilDate(2026, 2, 17))
  assert.throws(() => civilDateAtDeviceTime(new Date(Number.NaN)), RangeError)
})

test('independent published anchor: Tết 2026 is 1/1/2026 lunar', () => {
  const solar = createCivilDate(2026, 2, 17)
  const lunar = solarToVietnameseLunar(solar)
  assert.deepEqual(lunar, { year: 2026, month: 1, day: 1, isLeapMonth: false })
  assert.deepEqual(vietnameseLunarToSolar(lunar), solar)
  assert.deepEqual(solarToVietnameseLunar(createCivilDate(2026, 2, 16)), {
    year: 2025, month: 12, day: 29, isLeapMonth: false,
  })
})

test('published Vietnamese-calendar reference anchors across 2000–2099', async (t) => {
  const references = [
    { solar: [2000, 1, 1], lunar: [1999, 11, 25], source: 'https://baonghean.vn/en/am-duong-lich-ngay-1-thang-1-nam-2000.html' },
    { solar: [2000, 2, 5], lunar: [2000, 1, 1], source: 'https://baonghean.vn/en/am-duong-lich-ngay-5-thang-2-nam-2000.html' },
    { solar: [2007, 2, 17], lunar: [2007, 1, 1], source: 'https://amlich.org/xem-lich-nam/2007' },
    { solar: [2010, 2, 14], lunar: [2010, 1, 1], source: 'https://xskt.com.vn/lich-am-van-nien/ngay/14-2-2010' },
    { solar: [2014, 1, 31], lunar: [2014, 1, 1], source: 'https://xskt.com.vn/lich-am-van-nien/ngay/31-1-2014' },
    { solar: [2017, 1, 28], lunar: [2017, 1, 1], source: 'https://baochinhphu.vn/thong-bao-nghi-tet-am-lich-nam-2017-102212799.htm' },
    { solar: [2019, 2, 5], lunar: [2019, 1, 1], source: 'https://baonghean.vn/am-duong-lich-nam-2019.html' },
    { solar: [2020, 1, 25], lunar: [2020, 1, 1], source: 'https://baonghean.vn/am-duong-lich-nam-2020.html' },
    { solar: [2023, 1, 22], lunar: [2023, 1, 1], source: 'https://baodaknong.vn/am-duong-lich-nam-2023.html' },
    { solar: [2024, 2, 10], lunar: [2024, 1, 1], source: 'https://baonghean.vn/am-duong-lich-nam-2024.html' },
    { solar: [2025, 1, 29], lunar: [2025, 1, 1], source: 'https://baonghean.vn/en/am-duong-lich-nam-2025.html' },
    { solar: [2026, 2, 17], lunar: [2026, 1, 1], source: 'https://amlich.org/xem-lich-nam/2026' },
    { solar: [2030, 2, 2], lunar: [2030, 1, 1], source: 'https://www.xemamlich.uhm.vn/calrules_en.html' },
    { solar: [2033, 1, 31], lunar: [2033, 1, 1], source: 'https://baodaknong.vn/am-duong-lich-nam-2033.html' },
    { solar: [2040, 2, 12], lunar: [2040, 1, 1], source: 'https://baonghean.vn/en/am-duong-lich-nam-2040.html' },
    { solar: [2053, 2, 18], lunar: [2053, 1, 1], source: 'https://www.xemamlich.uhm.vn/calrules_en.html' },
    { solar: [2057, 9, 28], lunar: [2057, 9, 1], source: 'https://baodaknong.vn/am-duong-lich-nam-2057.html' },
    { solar: [2089, 9, 4], lunar: [2089, 8, 1], source: 'https://baonghean.vn/am-duong-lich-ngay-4-thang-9-nam-2089.html' },
    { solar: [2097, 8, 7], lunar: [2097, 7, 1], source: 'https://baonghean.vn/am-duong-lich-ngay-7-thang-8-nam-2097.html' },
    { solar: [2099, 12, 31], lunar: [2099, 11, 20], source: 'https://baohatinh.vn/cong-cu/lich-am/31-12-2099' },
  ] as const

  for (const reference of references) {
    const [year, month, day] = reference.solar
    const [lunarYear, lunarMonth, lunarDay] = reference.lunar
    await t.test(`${year}-${month}-${day} matches ${reference.source}`, () => {
      assert.deepEqual(solarToVietnameseLunar(createCivilDate(year, month, day)), {
        year: lunarYear,
        month: lunarMonth,
        day: lunarDay,
        isLeapMonth: false,
      })
    })
  }
})

test('independent published anchor: 2023 has leap month 2 beginning 22 March', () => {
  const leapMonthStart = createCivilDate(2023, 3, 22)
  const lunar = solarToVietnameseLunar(leapMonthStart)
  assert.deepEqual(lunar, { year: 2023, month: 2, day: 1, isLeapMonth: true })
  assert.deepEqual(vietnameseLunarToSolar(lunar), leapMonthStart)
  assert.deepEqual(solarToVietnameseLunar(createCivilDate(2023, 4, 19)), {
    year: 2023, month: 2, day: 29, isLeapMonth: true,
  })
  assert.deepEqual(solarToVietnameseLunar(createCivilDate(2023, 4, 20)), {
    year: 2023, month: 3, day: 1, isLeapMonth: false,
  })
})

test('independent published anchor: 2025 has leap month 6 beginning 25 July', () => {
  const leapMonthStart = createCivilDate(2025, 7, 25)
  const lunar = solarToVietnameseLunar(leapMonthStart)
  assert.deepEqual(lunar, { year: 2025, month: 6, day: 1, isLeapMonth: true })
  assert.deepEqual(vietnameseLunarToSolar(lunar), leapMonthStart)
})

test('regular and leap instances of lunar month 6 in 2025 convert to distinct solar dates', () => {
  const regularMonth = vietnameseLunarToSolar({ year: 2025, month: 6, day: 1, isLeapMonth: false })
  const leapMonth = vietnameseLunarToSolar({ year: 2025, month: 6, day: 1, isLeapMonth: true })
  assert.deepEqual(regularMonth, createCivilDate(2025, 6, 25))
  assert.deepEqual(leapMonth, createCivilDate(2025, 7, 25))
  assert.deepEqual(solarToVietnameseLunar(regularMonth), { year: 2025, month: 6, day: 1, isLeapMonth: false })
  assert.deepEqual(solarToVietnameseLunar(leapMonth), { year: 2025, month: 6, day: 1, isLeapMonth: true })
  assert.deepEqual(solarToVietnameseLunar(createCivilDate(2025, 7, 24)), {
    year: 2025, month: 6, day: 30, isLeapMonth: false,
  })
  assert.deepEqual(solarToVietnameseLunar(createCivilDate(2025, 8, 22)), {
    year: 2025, month: 6, day: 29, isLeapMonth: true,
  })
  assert.deepEqual(solarToVietnameseLunar(createCivilDate(2025, 8, 23)), {
    year: 2025, month: 7, day: 1, isLeapMonth: false,
  })
  assert.throws(() => vietnameseLunarToSolar({ year: 2025, month: 6, day: 30, isLeapMonth: true }), RangeError)
})

test('2033 solstice/new-moon boundary assigns 22 December to leap month 11', () => {
  const before = solarToVietnameseLunar(createCivilDate(2033, 12, 21))
  const newMonth = createCivilDate(2033, 12, 22)
  const after = solarToVietnameseLunar(newMonth)
  assert.deepEqual(before, { year: 2033, month: 11, day: 30, isLeapMonth: false })
  assert.deepEqual(after, { year: 2033, month: 11, day: 1, isLeapMonth: true })
  assert.deepEqual(vietnameseLunarToSolar(after), newMonth)
  assert.deepEqual(solarToVietnameseLunar(createCivilDate(2034, 1, 1)), {
    year: 2033, month: 11, day: 11, isLeapMonth: true,
  })
})

test('solar range endpoints and adjacent lunar years remain explicit', () => {
  assert.deepEqual(solarToVietnameseLunar(createCivilDate(2000, 1, 1)), {
    year: 1999, month: 11, day: 25, isLeapMonth: false,
  })
  assert.deepEqual(solarToVietnameseLunar(createCivilDate(2099, 12, 31)), {
    year: 2099, month: 11, day: 20, isLeapMonth: false,
  })
  assert.throws(() => solarToVietnameseLunar(createCivilDate(2100, 1, 1)), RangeError)
})

test('every day in 2000–2099 maps to a valid consecutive lunar date', () => {
  let previousLunar: ReturnType<typeof solarToVietnameseLunar> | undefined
  for (let year = 2000; year <= 2099; year += 1) {
    for (let month = 1; month <= 12; month += 1) {
      for (let day = 1; day <= daysInMonth(year, month); day += 1) {
        const solar = createCivilDate(year, month, day)
        const lunar = solarToVietnameseLunar(solar)
        assert.ok(lunar.day >= 1 && lunar.day <= 30)
        assert.ok(lunar.month >= 1 && lunar.month <= 12)
        assert.deepEqual(vietnameseLunarToSolar(lunar), solar)
        if (previousLunar !== undefined) {
          if (lunar.year === previousLunar.year && lunar.month === previousLunar.month && lunar.isLeapMonth === previousLunar.isLeapMonth) {
            assert.equal(lunar.day, previousLunar.day + 1)
          } else {
            assert.equal(lunar.day, 1)
          }
        }
        previousLunar = lunar
      }
    }
  }
})

test('conversion rejects unsupported Gregorian years and nonexistent leap-month dates', () => {
  assert.throws(() => solarToVietnameseLunar({ year: 2024, month: 2, day: 30 }), RangeError)
  assert.throws(() => solarToVietnameseLunar(createCivilDate(1999, 12, 31)), RangeError)
  assert.throws(() => vietnameseLunarToSolar({ year: 2024, month: 2, day: 1, isLeapMonth: true }), RangeError)
  assert.throws(() => vietnameseLunarToSolar({ year: 2023, month: 3, day: 1, isLeapMonth: true }), RangeError)
  assert.throws(() => vietnameseLunarToSolar({ year: 2023, month: 2, day: 30, isLeapMonth: true }), RangeError)
  for (const invalid of [Number.NaN, Number.POSITIVE_INFINITY, 2023.5]) {
    assert.throws(() => vietnameseLunarToSolar({ year: invalid, month: 2, day: 1, isLeapMonth: false }), RangeError)
    assert.throws(() => vietnameseLunarToSolar({ year: 2023, month: invalid, day: 1, isLeapMonth: false }), RangeError)
    assert.throws(() => vietnameseLunarToSolar({ year: 2023, month: 2, day: invalid, isLeapMonth: false }), RangeError)
  }
})
