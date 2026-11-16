import { civilDateToJulianDayNumber } from './core.ts'
import type { CivilDate } from './core.ts'

const WEEKDAYS_MONDAY_FIRST = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ nhật']

/** Formats the weekday for a Gregorian civil date, with Monday as the first weekday. */
export function formatVietnameseWeekday(date: CivilDate): string {
  const sundayFirstIndex = (civilDateToJulianDayNumber(date) + 1) % 7
  const mondayFirstIndex = (sundayFirstIndex + 6) % 7
  return WEEKDAYS_MONDAY_FIRST[mondayFirstIndex]
}
