import {
  CALENDAR_CORE_SOLAR_YEAR_RANGE,
  civilDateToJulianDayNumber,
  createCivilDate,
  daysInMonth,
  julianDayNumberToCivilDate,
} from './core.ts'
import type { CivilDate } from './core.ts'

export interface CalendarGridDate {
  readonly date: CivilDate
  readonly isInVisibleMonth: boolean
  readonly isWithinSupportedRange: boolean
}

/** Returns Monday-first calendar rows without consulting browser date/time APIs. */
export function getCalendarMonthGrid(year: number, month: number): CalendarGridDate[] {
  if (!Number.isInteger(year) || year < CALENDAR_CORE_SOLAR_YEAR_RANGE.min
    || year > CALENDAR_CORE_SOLAR_YEAR_RANGE.max) {
    throw new RangeError('Tháng nằm ngoài phạm vi Calendar Core.')
  }
  const firstDay = createCivilDate(year, month, 1)
  const firstJdn = civilDateToJulianDayNumber(firstDay)
  const mondayOffset = (firstJdn + 1 + 6) % 7
  const cellCount = Math.ceil((mondayOffset + daysInMonth(year, month)) / 7) * 7

  return Array.from({ length: cellCount }, (_, index) => {
    const date = julianDayNumberToCivilDate(firstJdn - mondayOffset + index)
    return Object.freeze({
      date,
      isInVisibleMonth: date.year === year && date.month === month,
      isWithinSupportedRange: date.year >= CALENDAR_CORE_SOLAR_YEAR_RANGE.min
        && date.year <= CALENDAR_CORE_SOLAR_YEAR_RANGE.max,
    })
  })
}
