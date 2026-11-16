import { CALENDAR_CORE_SOLAR_YEAR_RANGE } from './core.ts'

export interface VisibleMonth {
  readonly year: number
  readonly month: number
}

export function parseSupportedYear(value: string): number | null {
  if (!/^\d{4}$/.test(value)) return null
  const year = Number(value)
  return year >= CALENDAR_CORE_SOLAR_YEAR_RANGE.min && year <= CALENDAR_CORE_SOLAR_YEAR_RANGE.max
    ? year
    : null
}

export function createVisibleMonth(year: number, month: number): VisibleMonth | null {
  if (!Number.isInteger(year) || year < CALENDAR_CORE_SOLAR_YEAR_RANGE.min
    || year > CALENDAR_CORE_SOLAR_YEAR_RANGE.max || !Number.isInteger(month)
    || month < 1 || month > 12) return null
  return Object.freeze({ year, month })
}
