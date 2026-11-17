import type { CivilDate } from '../calendar/core.ts'

export type EventCategory = 'official_holiday' | 'commemoration' | 'traditional' | 'international'
export type LeapMonthPolicy = 'regular_only' | 'leap_only' | 'both'

export interface EventSource {
  readonly publisher: string
  readonly title: string
  readonly url: string
}

export interface EventDetails {
  readonly aliases?: readonly string[]
  readonly origin?: string
  readonly significance?: string
  readonly customs?: string
  readonly notes?: string
}

export type EventRule =
  | {
      readonly type: 'solar_fixed'
      readonly month: number
      readonly day: number
      readonly startYear?: number
      readonly endYear?: number
    }
  | {
      readonly type: 'lunar_fixed'
      readonly month: number
      readonly day: number
      readonly leapMonthPolicy: LeapMonthPolicy
    }
  | { readonly type: 'lunar_month_end'; readonly month: number }
  | {
      readonly type: 'weekday_rule'
      readonly month: number
      /** Sunday = 0, Monday = 1, ..., Saturday = 6, matching Date#getDay. */
      readonly weekday: number
      readonly occurrence: number | 'last'
    }
  | { readonly type: 'year_specific'; readonly date: CivilDate }

export interface CalendarEvent {
  readonly id: string
  readonly title: string
  readonly category: EventCategory
  readonly rule: EventRule
  readonly description: string
  readonly details?: EventDetails
  readonly wikipediaUrl?: string
  readonly sources: readonly EventSource[]
  readonly sortOrder: number
}
