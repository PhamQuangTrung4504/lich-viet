import {
  CALENDAR_CORE_SOLAR_YEAR_RANGE,
  civilDateAtDeviceTime,
  civilDateToJulianDayNumber,
  createCivilDate,
  daysInMonth,
  julianDayNumberToCivilDate,
  solarToVietnameseLunar,
} from '../calendar/core.ts'
import type { CivilDate, VietnameseLunarDate } from '../calendar/core.ts'
import { VERIFIED_EVENTS } from './data.ts'
import type { CalendarEvent, EventRule } from './model.ts'

export interface EventDay {
  readonly date: CivilDate
  readonly events: readonly CalendarEvent[]
}

export interface TodayAndTomorrow {
  readonly today: EventDay
  readonly tomorrow: EventDay
}

export function findEventsForDate(
  input: CivilDate,
  events: readonly CalendarEvent[] = VERIFIED_EVENTS,
): CalendarEvent[] {
  const date = createCivilDate(input.year, input.month, input.day)
  if (date.year < CALENDAR_CORE_SOLAR_YEAR_RANGE.min || date.year > CALENDAR_CORE_SOLAR_YEAR_RANGE.max) {
    throw new RangeError('Event Engine hiện hỗ trợ ngày dân sự từ năm 2000 đến 2099.')
  }

  const lunarDate = events.some((event) => event.rule.type === 'lunar_fixed' || event.rule.type === 'lunar_month_end')
    ? solarToVietnameseLunar(date)
    : undefined
  const matches = events.filter((event) => matchesRule(date, event.rule, lunarDate))
    .sort((left, right) => categoryPriority(left.category) - categoryPriority(right.category)
      || left.sortOrder - right.sortOrder || compareText(left.id, right.id))
  const seen = new Set<string>()
  return matches.filter((event) => {
    if (seen.has(event.id)) return false
    seen.add(event.id)
    return true
  })
}

export function getTodayAndTomorrow(
  now: Date,
  events: readonly CalendarEvent[] = VERIFIED_EVENTS,
): TodayAndTomorrow {
  const todayDate = civilDateAtDeviceTime(now)
  const tomorrowDate = julianDayNumberToCivilDate(civilDateToJulianDayNumber(todayDate) + 1)
  return {
    today: { date: todayDate, events: findEventsForDate(todayDate, events) },
    tomorrow: { date: tomorrowDate, events: findEventsForDate(tomorrowDate, events) },
  }
}

function matchesRule(date: CivilDate, rule: EventRule, lunarDate: VietnameseLunarDate | undefined): boolean {
  switch (rule.type) {
    case 'solar_fixed':
      return date.month === rule.month && date.day === rule.day
        && (rule.startYear === undefined || date.year >= rule.startYear)
    case 'lunar_fixed': {
      if (lunarDate === undefined || lunarDate.month !== rule.month || lunarDate.day !== rule.day) return false
      if (rule.leapMonthPolicy === 'regular_only') return !lunarDate.isLeapMonth
      if (rule.leapMonthPolicy === 'leap_only') return lunarDate.isLeapMonth
      return true
    }
    case 'lunar_month_end': {
      if (lunarDate === undefined || lunarDate.month !== rule.month) return false
      const tomorrow = solarToVietnameseLunar(julianDayNumberToCivilDate(civilDateToJulianDayNumber(date) + 1))
      return tomorrow.month !== rule.month || tomorrow.year !== lunarDate.year
    }
    case 'weekday_rule':
      return date.month === rule.month && matchesWeekdayOccurrence(date, rule.weekday, rule.occurrence)
    case 'year_specific':
      return date.year === rule.date.year && date.month === rule.date.month && date.day === rule.date.day
  }
}

function categoryPriority(category: CalendarEvent['category']): number {
  switch (category) {
    case 'official_holiday': return 0
    case 'traditional': return 1
    case 'commemoration': return 2
    case 'international': return 3
  }
}

function matchesWeekdayOccurrence(
  date: CivilDate,
  weekday: number,
  occurrence: number | 'last',
): boolean {
  if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) return false
  const currentWeekday = (civilDateToJulianDayNumber(date) + 1) % 7
  if (currentWeekday !== weekday) return false
  if (occurrence === 'last') return date.day + 7 > daysInMonth(date.year, date.month)
  return Number.isInteger(occurrence) && occurrence >= 1 && Math.floor((date.day - 1) / 7) + 1 === occurrence
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0
}
