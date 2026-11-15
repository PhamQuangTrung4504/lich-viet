export interface CivilDate {
  readonly year: number
  readonly month: number
  readonly day: number
}

export interface VietnameseLunarDate {
  readonly year: number
  readonly month: number
  readonly day: number
  readonly isLeapMonth: boolean
}

export const VIETNAMESE_LUNAR_TIME_ZONE_HOURS = 7
export const CALENDAR_CORE_SOLAR_YEAR_RANGE = Object.freeze({ min: 2000, max: 2099 })

// Gregorian/JDN reference and approximate January 1900 new-moon epoch used to
// estimate the lunation index; each phase is then calculated by newMoonJulianDate.
const JULIAN_DAY_EPOCH = 2415021
const NEW_MOON_EPOCH = 2415021.076998695
const SYNODIC_MONTH = 29.530588853
const DEG_TO_RAD = Math.PI / 180

export function createCivilDate(year: number, month: number, day: number): CivilDate {
  if (!Number.isInteger(year) || year < 1 || year > 9999) {
    throw new RangeError('Năm phải là số nguyên từ 1 đến 9999.')
  }
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new RangeError('Tháng phải là số nguyên từ 1 đến 12.')
  }
  if (!Number.isInteger(day) || day < 1 || day > daysInMonth(year, month)) {
    throw new RangeError('Ngày không tồn tại trong tháng đã chọn.')
  }
  return Object.freeze({ year, month, day })
}

export function isGregorianLeapYear(year: number): boolean {
  return Number.isInteger(year) && year >= 1 && year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
}

export function daysInMonth(year: number, month: number): number {
  if (!Number.isInteger(year) || year < 1 || year > 9999 || !Number.isInteger(month) || month < 1 || month > 12) {
    throw new RangeError('Năm hoặc tháng không hợp lệ.')
  }
  if (month === 2) return isGregorianLeapYear(year) ? 29 : 28
  return [4, 6, 9, 11].includes(month) ? 30 : 31
}

/** Gets the device-local civil date from a supplied instant without parsing a date string. */
export function civilDateAtDeviceTime(date: Date): CivilDate {
  if (!Number.isFinite(date.getTime())) throw new RangeError('Thời điểm không hợp lệ.')
  return createCivilDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
}

export function civilDateToJulianDayNumber(date: CivilDate): number {
  const { year, month, day } = createCivilDate(date.year, date.month, date.day)
  const a = Math.floor((14 - month) / 12)
  const y = year + 4800 - a
  const m = month + 12 * a - 3
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045
}

export function julianDayNumberToCivilDate(jdn: number): CivilDate {
  if (!Number.isInteger(jdn)) throw new RangeError('Julian Day Number phải là số nguyên.')
  const a = jdn + 32044
  const b = Math.floor((4 * a + 3) / 146097)
  const c = a - Math.floor((146097 * b) / 4)
  const d = Math.floor((4 * c + 3) / 1461)
  const e = c - Math.floor((1461 * d) / 4)
  const m = Math.floor((5 * e + 2) / 153)
  const day = e - Math.floor((153 * m + 2) / 5) + 1
  const month = m + 3 - 12 * Math.floor(m / 10)
  const year = 100 * b + d - 4800 + Math.floor(m / 10)
  return createCivilDate(year, month, day)
}

export function solarToVietnameseLunar(date: CivilDate): VietnameseLunarDate {
  assertSolarYear(date.year)
  const dayNumber = civilDateToJulianDayNumber(date)
  let k = Math.floor((dayNumber - NEW_MOON_EPOCH) / SYNODIC_MONTH)
  let monthStart = newMoonDay(k)
  while (monthStart > dayNumber) {
    k -= 1
    monthStart = newMoonDay(k)
  }
  while (newMoonDay(k + 1) <= dayNumber) {
    k += 1
    monthStart = newMoonDay(k)
  }

  let a11 = lunarMonth11(date.year)
  let b11 = a11
  let lunarYear = date.year
  if (a11 >= monthStart) {
    a11 = lunarMonth11(date.year - 1)
  } else {
    lunarYear += 1
    b11 = lunarMonth11(date.year + 1)
  }

  const lunarDay = dayNumber - monthStart + 1
  const monthOffset = Math.floor((monthStart - a11) / 29)
  let lunarMonth = monthOffset + 11
  let isLeapMonth = false
  if (b11 - a11 > 365) {
    const leapOffset = leapMonthOffset(a11)
    if (monthOffset >= leapOffset) {
      lunarMonth = monthOffset + 10
      if (monthOffset === leapOffset) isLeapMonth = true
    }
  }
  if (lunarMonth > 12) lunarMonth -= 12
  if (lunarMonth >= 11 && monthOffset < 4) lunarYear -= 1

  return Object.freeze({ year: lunarYear, month: lunarMonth, day: lunarDay, isLeapMonth })
}

export function vietnameseLunarToSolar(date: VietnameseLunarDate): CivilDate {
  if (!Number.isInteger(date.year) || date.year < 1999 || date.year > 2100) {
    throw new RangeError('Năm âm lịch nằm ngoài phạm vi tính toán.')
  }
  if (!Number.isInteger(date.month) || date.month < 1 || date.month > 12 || typeof date.isLeapMonth !== 'boolean') {
    throw new RangeError('Tháng âm lịch không hợp lệ.')
  }
  if (!Number.isInteger(date.day) || date.day < 1 || date.day > 30) {
    throw new RangeError('Ngày âm lịch phải từ 1 đến 30.')
  }

  let a11: number
  let b11: number
  if (date.month < 11) {
    a11 = lunarMonth11(date.year - 1)
    b11 = lunarMonth11(date.year)
  } else {
    a11 = lunarMonth11(date.year)
    b11 = lunarMonth11(date.year + 1)
  }

  const k = Math.floor(0.5 + (a11 - NEW_MOON_EPOCH) / SYNODIC_MONTH)
  let monthOffset = date.month - 11
  if (monthOffset < 0) monthOffset += 12
  if (b11 - a11 > 365) {
    const leapOffset = leapMonthOffset(a11)
    let leapMonth = leapOffset - 2
    if (leapMonth < 0) leapMonth += 12
    if (date.isLeapMonth) {
      if (date.month !== leapMonth) throw new RangeError('Năm này không có tháng nhuận mang số tháng đã chọn.')
      monthOffset = leapOffset
    } else {
      if (monthOffset >= leapOffset) monthOffset += 1
    }
  } else if (date.isLeapMonth) {
    throw new RangeError('Năm này không có tháng nhuận.')
  }

  const monthStart = newMoonDay(k + monthOffset)
  const solarDate = julianDayNumberToCivilDate(monthStart + date.day - 1)
  assertSolarYear(solarDate.year)
  const roundTrip = solarToVietnameseLunar(solarDate)
  if (!sameLunarDate(date, roundTrip)) throw new RangeError('Ngày âm lịch không tồn tại trong năm đã chọn.')
  return solarDate
}

function assertSolarYear(year: number): void {
  if (year < CALENDAR_CORE_SOLAR_YEAR_RANGE.min || year > CALENDAR_CORE_SOLAR_YEAR_RANGE.max) {
    throw new RangeError('Calendar Core hiện chỉ tính ngày dương từ năm 2000 đến 2099.')
  }
}

function sameLunarDate(left: VietnameseLunarDate, right: VietnameseLunarDate): boolean {
  return left.year === right.year && left.month === right.month && left.day === right.day && left.isLeapMonth === right.isLeapMonth
}

function newMoonJulianDate(k: number): number {
  // Meeus, Astronomical Algorithms 2nd ed., ch. 49: mean phase plus periodic terms,
  // then convert dynamical time to UT with an approximate ΔT model.
  const t = k / 1236.85
  const t2 = t * t
  const t3 = t2 * t
  const t4 = t3 * t
  const mean = 2415020.75933 + 29.53058868 * k + 0.0001178 * t2 - 0.000000155 * t3
  const correction = 0.00033 * Math.sin((166.56 + 132.87 * t - 0.009173 * t2) * DEG_TO_RAD)
  const solarAnomaly = (359.2242 + 29.10535608 * k - 0.0000333 * t2 - 0.00000347 * t3) * DEG_TO_RAD
  const lunarAnomaly = (306.0253 + 385.81691806 * k + 0.0107306 * t2 + 0.00001236 * t3) * DEG_TO_RAD
  const latitudeArgument = (21.2964 + 390.67050646 * k - 0.0016528 * t2 - 0.00000239 * t3) * DEG_TO_RAD
  const phaseCorrection = (0.1734 - 0.000393 * t) * Math.sin(solarAnomaly)
    + 0.0021 * Math.sin(2 * solarAnomaly)
    - 0.4068 * Math.sin(lunarAnomaly)
    + 0.0161 * Math.sin(2 * lunarAnomaly)
    - 0.0004 * Math.sin(3 * lunarAnomaly)
    + 0.0104 * Math.sin(2 * latitudeArgument)
    - 0.0051 * Math.sin(solarAnomaly + lunarAnomaly)
    - 0.0074 * Math.sin(solarAnomaly - lunarAnomaly)
    + 0.0004 * Math.sin(2 * latitudeArgument + solarAnomaly)
    - 0.0004 * Math.sin(2 * latitudeArgument - solarAnomaly)
    - 0.0006 * Math.sin(2 * latitudeArgument + lunarAnomaly)
    + 0.0010 * Math.sin(2 * latitudeArgument - lunarAnomaly)
    + 0.0005 * Math.sin(2 * lunarAnomaly)
  const deltaT = t < -11
    ? 0.001 + 0.000839 * t + 0.0002261 * t2 - 0.00000845 * t3 - 0.000000081 * t4
    : -0.000278 + 0.000265 * t + 0.000262 * t2
  return mean + correction + phaseCorrection - deltaT
}

function newMoonDay(k: number): number {
  return Math.floor(newMoonJulianDate(k) + 0.5 + VIETNAMESE_LUNAR_TIME_ZONE_HOURS / 24)
}

function solarLongitudeSector(jdn: number): number {
  // Meeus, Astronomical Algorithms 2nd ed., ch. 25: low-precision geocentric
  // solar longitude, sampled at local midnight for the UTC+7 civil date.
  const utcJulianDate = jdn - 0.5 - VIETNAMESE_LUNAR_TIME_ZONE_HOURS / 24
  const t = (utcJulianDate - 2451545.0) / 36525
  const t2 = t * t
  const meanAnomaly = (357.52910 + 35999.05030 * t - 0.0001559 * t2 - 0.00000048 * t2 * t) * DEG_TO_RAD
  const meanLongitude = 280.46645 + 36000.76983 * t + 0.0003032 * t2
  const equationOfCenter = (1.914600 - 0.004817 * t - 0.000014 * t2) * Math.sin(meanAnomaly)
    + (0.019993 - 0.000101 * t) * Math.sin(2 * meanAnomaly)
    + 0.000290 * Math.sin(3 * meanAnomaly)
  let longitude = (meanLongitude + equationOfCenter) * DEG_TO_RAD
  longitude -= 2 * Math.PI * Math.floor(longitude / (2 * Math.PI))
  return Math.floor(longitude / (Math.PI / 6))
}

function lunarMonth11(year: number): number {
  const off = civilDateToJulianDayNumber(createCivilDate(year, 12, 31)) - JULIAN_DAY_EPOCH
  const k = Math.floor(off / SYNODIC_MONTH)
  let monthStart = newMoonDay(k)
  if (solarLongitudeSector(monthStart) >= 9) monthStart = newMoonDay(k - 1)
  return monthStart
}

function leapMonthOffset(month11Jdn: number): number {
  const k = Math.floor(0.5 + (month11Jdn - NEW_MOON_EPOCH) / SYNODIC_MONTH)
  let previousSector = solarLongitudeSector(newMoonDay(k + 1))
  for (let offset = 2; offset <= 14; offset += 1) {
    const currentSector = solarLongitudeSector(newMoonDay(k + offset))
    if (currentSector === previousSector) return offset - 1
    previousSector = currentSector
  }
  throw new RangeError('Không xác định được vị trí tháng nhuận.')
}
