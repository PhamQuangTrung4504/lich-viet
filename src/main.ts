import './style.css'
import {
  CALENDAR_CORE_SOLAR_YEAR_RANGE,
  civilDateAtDeviceTime,
  civilDateToJulianDayNumber,
  julianDayNumberToCivilDate,
  solarToVietnameseLunar,
} from './calendar/core.ts'
import { getCalendarMonthGrid } from './calendar/month-grid.ts'
import { createVisibleMonth, parseSupportedYear } from './calendar/month-selection.ts'
import type { CivilDate } from './calendar/core.ts'
import { findEventsForDate, getTodayAndTomorrow } from './events/engine.ts'
import type { EventDay } from './events/engine.ts'
import type { CalendarEvent, EventCategory } from './events/model.ts'
import { formatVietnameseWeekday } from './calendar/weekday.ts'

type AppTab = 'calendar' | 'events'

interface AppState {
  activeTab: AppTab
  visibleMonth: { year: number; month: number }
  selectedDate: CivilDate
  scrollPositions: Record<AppTab, number>
}

interface EventSnapshot {
  readonly today?: EventDay
  readonly tomorrow?: EventDay
  readonly tomorrowDate?: CivilDate
  readonly unavailable: boolean
}

const WEEKDAY_SHORT = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
const MONTHS = ['Tháng Một', 'Tháng Hai', 'Tháng Ba', 'Tháng Tư', 'Tháng Năm', 'Tháng Sáu', 'Tháng Bảy', 'Tháng Tám', 'Tháng Chín', 'Tháng Mười', 'Tháng Mười Một', 'Tháng Mười Hai']
const CATEGORY_LABELS: Record<EventCategory, string> = {
  official_holiday: 'Ngày nghỉ lễ theo luật',
  commemoration: 'Ngày kỷ niệm',
  traditional: 'Ngày truyền thống',
  international: 'Ngày quốc tế',
}
const YEAR_RANGE = CALENDAR_CORE_SOLAR_YEAR_RANGE

const root = getElement<HTMLDivElement>('#app')
root.innerHTML = `
  <div class="app-shell">
    <header class="app-header">
      <div class="app-header__icon" id="header-icon" aria-hidden="true"></div>
      <div class="app-header__text">
        <p class="app-header__eyebrow">LỊCH VIỆT</p>
        <h1 id="header-title">Lịch</h1>
      </div>
    </header>
    <main class="app-content" id="app-content" tabindex="0" aria-label="Nội dung ứng dụng"></main>
    <nav class="bottom-nav" aria-label="Điều hướng chính">
      <button class="bottom-nav__item" id="nav-calendar" type="button" aria-current="page">
        <span class="nav-icon" aria-hidden="true"></span><span>Lịch</span>
      </button>
      <button class="bottom-nav__item" id="nav-events" type="button">
        <span class="nav-icon" aria-hidden="true"></span><span>Sự kiện</span>
      </button>
    </nav>
  </div>
  <dialog class="month-dialog" id="month-dialog" aria-labelledby="month-dialog-title">
    <div class="month-dialog__header">
      <button class="icon-button month-dialog__close" id="close-month-dialog" type="button" aria-label="Đóng chọn tháng năm">×</button>
      <p class="eyebrow">ĐI ĐẾN THỜI GIAN</p>
      <h2 id="month-dialog-title">Chọn tháng và năm</h2>
    </div>
    <form class="month-dialog__form" id="month-form">
      <fieldset class="month-picker__fieldset">
        <legend class="field-label">Chọn tháng</legend>
        <div class="month-picker__grid" id="month-picker-grid" role="group" aria-label="12 tháng trong năm"></div>
      </fieldset>
      <fieldset class="month-picker__fieldset">
        <legend class="field-label">Chọn năm</legend>
        <div class="year-stepper">
          <button class="icon-button" id="year-decrease" type="button" aria-label="Giảm năm">−</button>
          <label class="visually-hidden" for="year-input">Năm từ 2000 đến 2099</label>
          <input id="year-input" type="text" inputmode="numeric" autocomplete="off" maxlength="4" aria-describedby="year-error" />
          <button class="icon-button" id="year-increase" type="button" aria-label="Tăng năm">+</button>
          <span class="visually-hidden" id="year-announcement" aria-live="polite"></span>
        </div>
        <p class="month-picker__error" id="year-error" role="alert" hidden>Nhập năm gồm 4 chữ số, từ 2000 đến 2099.</p>
      </fieldset>
      <button class="primary-button" type="submit">Xem lịch</button>
    </form>
  </dialog>
`

const content = getElement<HTMLElement>('#app-content')
const title = getElement<HTMLElement>('#header-title')
const headerIcon = getElement<HTMLElement>('#header-icon')
const calendarNav = getElement<HTMLButtonElement>('#nav-calendar')
const eventsNav = getElement<HTMLButtonElement>('#nav-events')
appendIcon(getElement<HTMLElement>('#nav-calendar .nav-icon'), 'calendar')
appendIcon(getElement<HTMLElement>('#nav-events .nav-icon'), 'events')
const dialog = getElement<HTMLDialogElement>('#month-dialog')
const monthForm = getElement<HTMLFormElement>('#month-form')
const closeDialogButton = getElement<HTMLButtonElement>('#close-month-dialog')
const monthPickerGrid = getElement<HTMLElement>('#month-picker-grid')
const yearInput = getElement<HTMLInputElement>('#year-input')
const yearError = getElement<HTMLElement>('#year-error')
const yearAnnouncement = getElement<HTMLElement>('#year-announcement')
const decreaseYearButton = getElement<HTMLButtonElement>('#year-decrease')
const increaseYearButton = getElement<HTMLButtonElement>('#year-increase')
const now = new Date()
const today = civilDateAtDeviceTime(now)
const supportedToday = isSupportedDate(today)
const initialMonth = supportedToday
  ? { year: today.year, month: today.month }
  : today.year < YEAR_RANGE.min ? { year: YEAR_RANGE.min, month: 1 } : { year: YEAR_RANGE.max, month: 12 }
const state: AppState = {
  activeTab: 'calendar',
  visibleMonth: initialMonth,
  selectedDate: today,
  scrollPositions: { calendar: 0, events: 0 },
}
let eventSnapshot = getEventSnapshot(now)
let midnightTimer: number | undefined
let draftMonth = { ...initialMonth }

function getElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector)
  if (element === null) throw new Error(`Thiếu phần tử giao diện: ${selector}`)
  return element
}

function isSupportedDate(date: CivilDate): boolean {
  return date.year >= YEAR_RANGE.min && date.year <= YEAR_RANGE.max
}

function dateKey(date: CivilDate): string {
  return `${date.year}-${date.month}-${date.day}`
}

function formatDate(date: CivilDate, includeWeekday = false): string {
  const parts = [String(date.day).padStart(2, '0'), String(date.month).padStart(2, '0'), String(date.year)]
  const dateText = parts.join('/')
  return includeWeekday ? `${weekdayName(date)}, ${dateText}` : dateText
}

function weekdayName(date: CivilDate): string {
  return formatVietnameseWeekday(date)
}

function appendIcon(element: HTMLElement, kind: 'calendar' | 'events'): void {
  element.innerHTML = kind === 'calendar'
    ? '<svg viewBox="0 0 24 24" focusable="false"><rect x="3.5" y="5" width="17" height="16" rx="3"/><path d="M8 3.5v3M16 3.5v3M4 9.5h16M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01"/></svg>'
    : '<svg viewBox="0 0 24 24" focusable="false"><path d="M5 4.5h14a2 2 0 0 1 2 2v12a1 1 0 0 1-1.6.8L12 14l-7.4 5.3A1 1 0 0 1 3 18.5v-12a2 2 0 0 1 2-2Z"/><path d="M8 8h8M8 11h5"/></svg>'
}

function setActiveTab(tab: AppTab): void {
  if (state.activeTab === tab) return
  content.scrollTo({ top: content.scrollTop, behavior: 'auto' })
  state.scrollPositions[state.activeTab] = content.scrollTop
  state.activeTab = tab
  render(false)
}

function render(rememberScroll = true, focusKeyOverride?: string): void {
  if (rememberScroll) state.scrollPositions[state.activeTab] = content.scrollTop
  content.scrollTo({ top: content.scrollTop, behavior: 'auto' })
  const activeElement = document.activeElement
  const focusKey = focusKeyOverride ?? (
    activeElement instanceof HTMLElement && content.contains(activeElement)
      ? activeElement.dataset.focusKey
      : undefined
  )
  title.textContent = state.activeTab === 'calendar' ? 'Lịch' : 'Sự kiện'
  appendIcon(headerIcon, state.activeTab)
  calendarNav.setAttribute('aria-current', state.activeTab === 'calendar' ? 'page' : 'false')
  eventsNav.setAttribute('aria-current', state.activeTab === 'events' ? 'page' : 'false')
  content.replaceChildren(state.activeTab === 'calendar' ? renderCalendar() : renderEvents())
  content.scrollTop = state.scrollPositions[state.activeTab]
  if (focusKey !== undefined) {
    const replacement = Array.from(content.querySelectorAll<HTMLElement>('[data-focus-key]'))
      .find((element) => element.dataset.focusKey === focusKey)
    if (replacement !== undefined && !replacement.matches(':disabled')) {
      replacement.focus({ preventScroll: true })
    } else {
      const fallback = content.querySelector<HTMLElement>('.month-title')
      if (fallback !== null) fallback.focus({ preventScroll: true })
      else content.focus({ preventScroll: true })
    }
  }
}

function renderCalendar(): HTMLElement {
  const panel = document.createElement('section')
  panel.className = 'calendar-panel'
  panel.setAttribute('aria-label', 'Lịch tháng')
  const current = civilDateAtDeviceTime(new Date())

  const intro = document.createElement('section')
  intro.className = 'today-banner'
  const introText = document.createElement('div')
  const eyebrow = document.createElement('p')
  eyebrow.className = 'eyebrow'
  eyebrow.textContent = 'NGÀY HÔM NAY'
  const currentDate = document.createElement('p')
  currentDate.className = 'today-banner__date'
  currentDate.textContent = formatDate(current, true)
  introText.append(eyebrow, currentDate)
  const todayButton = button('Hôm nay', 'text-button')
  todayButton.dataset.focusKey = 'today'
  todayButton.addEventListener('click', () => {
    state.selectedDate = current
    if (isSupportedDate(current)) state.visibleMonth = { year: current.year, month: current.month }
    else state.visibleMonth = current.year < YEAR_RANGE.min
      ? { year: YEAR_RANGE.min, month: 1 }
      : { year: YEAR_RANGE.max, month: 12 }
    render()
  })
  intro.append(introText, todayButton)
  panel.append(intro)

  if (!isSupportedDate(current)) {
    panel.append(makeNotice(`Lịch âm và sự kiện hiện hỗ trợ ngày dương từ ${YEAR_RANGE.min} đến ${YEAR_RANGE.max}.`))
  }

  const monthSection = document.createElement('section')
  monthSection.className = 'month-card'
  const controls = document.createElement('div')
  controls.className = 'month-controls'
  const previousButton = iconButton('Tháng trước', '‹')
  previousButton.dataset.focusKey = 'previous-month'
  previousButton.disabled = state.visibleMonth.year === YEAR_RANGE.min && state.visibleMonth.month === 1
  previousButton.addEventListener('click', () => moveMonth(-1))
  const headingButton = button('', 'month-title')
  headingButton.dataset.focusKey = 'month-title'
  headingButton.setAttribute('aria-label', `Chọn tháng, ${MONTHS[state.visibleMonth.month - 1]} năm ${state.visibleMonth.year}`)
  const monthName = document.createElement('span')
  monthName.textContent = MONTHS[state.visibleMonth.month - 1]
  const yearName = document.createElement('strong')
  yearName.textContent = String(state.visibleMonth.year)
  const chevron = document.createElement('span')
  chevron.className = 'month-title__chevron'
  chevron.setAttribute('aria-hidden', 'true')
  chevron.textContent = '⌄'
  headingButton.append(monthName, yearName, chevron)
  headingButton.addEventListener('click', openMonthDialog)
  const nextButton = iconButton('Tháng sau', '›')
  nextButton.dataset.focusKey = 'next-month'
  nextButton.disabled = state.visibleMonth.year === YEAR_RANGE.max && state.visibleMonth.month === 12
  nextButton.addEventListener('click', () => moveMonth(1))
  controls.append(previousButton, headingButton, nextButton)

  const weekdays = document.createElement('div')
  weekdays.className = 'weekday-row'
  weekdays.setAttribute('aria-hidden', 'true')
  for (const day of WEEKDAY_SHORT) {
    const label = document.createElement('span')
    label.textContent = day
    weekdays.append(label)
  }
  const lunarLegend = document.createElement('p')
  lunarLegend.className = 'calendar-legend'
  lunarLegend.textContent = 'Số nhỏ là ngày âm · T là tháng âm · N là tháng nhuận'
  const grid = document.createElement('div')
  grid.className = 'calendar-grid'
  grid.setAttribute('role', 'group')
  grid.setAttribute('aria-label', `${MONTHS[state.visibleMonth.month - 1]} ${state.visibleMonth.year}`)
  for (const cell of getCalendarMonthGrid(state.visibleMonth.year, state.visibleMonth.month)) {
    grid.append(renderDayCell(cell.date, cell.isInVisibleMonth, cell.isWithinSupportedRange, current))
  }
  controls.setAttribute('aria-label', 'Điều khiển tháng')
  monthSection.append(controls, weekdays, grid, lunarLegend)
  attachCalendarSwipe(grid)
  panel.append(monthSection)
  panel.append(renderDayDetails())
  return panel
}

function renderDayCell(date: CivilDate, isInMonth: boolean, isSupported: boolean, current: CivilDate): HTMLButtonElement {
  const cell = button('', 'day-cell')
  cell.dataset.focusKey = `day-${dateKey(date)}`
  const isToday = dateKey(date) === dateKey(current)
  const isSelected = dateKey(date) === dateKey(state.selectedDate)
  if (!isInMonth) cell.classList.add('day-cell--outside')
  if (isToday) cell.classList.add('day-cell--today')
  if (isSelected) cell.classList.add('day-cell--selected')
  if (!isSupported) {
    cell.disabled = true
    cell.classList.add('day-cell--unsupported')
  }
  cell.setAttribute('aria-pressed', String(isSelected))
  let ariaLabel = formatDate(date, true)
  if (isSupported) {
    const lunar = solarToVietnameseLunar(date)
    const lunarLabel = `Âm lịch ngày ${lunar.day} tháng ${lunar.month}${lunar.isLeapMonth ? ' nhuận' : ''} năm ${lunar.year}`
    ariaLabel += `, ${lunarLabel}`
    const lunarText = document.createElement('span')
    lunarText.className = 'day-cell__lunar'
    lunarText.textContent = lunar.day === 1
      ? `1/T${lunar.month}${lunar.isLeapMonth ? 'N' : ''}`
      : String(lunar.day)
    cell.append(lunarText)
  } else {
    const lunarText = document.createElement('span')
    lunarText.className = 'day-cell__lunar day-cell__lunar--empty'
    lunarText.textContent = '—'
    cell.append(lunarText)
  }
  if (isToday && isSelected) ariaLabel += ', hôm nay và đang chọn'
  else if (isToday) ariaLabel += ', hôm nay'
  else if (isSelected) ariaLabel += ', đang chọn'
  cell.setAttribute('aria-label', ariaLabel)
  const solarText = document.createElement('span')
  solarText.className = 'day-cell__solar'
  solarText.textContent = String(date.day)
  cell.prepend(solarText)
  if (isSupported) {
    cell.addEventListener('click', () => {
      selectCalendarDate(date)
    })
  }
  return cell
}

function renderDayDetails(): HTMLElement {
  const section = document.createElement('section')
  section.className = 'day-details'
  section.setAttribute('aria-labelledby', 'day-details-title')
  const heading = document.createElement('div')
  heading.className = 'section-heading'
  const titleElement = document.createElement('h2')
  titleElement.id = 'day-details-title'
  titleElement.className = 'day-details__title'
  titleElement.tabIndex = -1
  titleElement.dataset.focusKey = 'selected-day-details'
  titleElement.textContent = 'Chi tiết ngày'
  const dateLabel = document.createElement('span')
  dateLabel.className = 'section-heading__meta'
  dateLabel.textContent = formatDate(state.selectedDate, true)
  heading.append(titleElement, dateLabel)
  section.append(heading)
  if (!isSupportedDate(state.selectedDate)) {
    section.append(makeNotice(`Ngày đã chọn nằm ngoài phạm vi lịch âm hỗ trợ (${YEAR_RANGE.min}–${YEAR_RANGE.max}).`))
    return section
  }

  const lunar = solarToVietnameseLunar(state.selectedDate)
  const details = document.createElement('div')
  details.className = 'date-summary'
  const solar = document.createElement('div')
  solar.className = 'date-summary__item'
  solar.append(makeDateSummaryLabel('DƯƠNG LỊCH'))
  const solarValue = document.createElement('strong')
  solarValue.textContent = formatDate(state.selectedDate)
  solar.append(solarValue)
  const lunarItem = document.createElement('div')
  lunarItem.className = 'date-summary__item date-summary__item--lunar'
  lunarItem.append(makeDateSummaryLabel('ÂM LỊCH VIỆT NAM · UTC+7'))
  const lunarValue = document.createElement('strong')
  lunarValue.textContent = `${lunar.day}/${lunar.month}/${lunar.year}${lunar.isLeapMonth ? ' · Tháng nhuận' : ''}`
  lunarItem.append(lunarValue)
  details.append(solar, lunarItem)
  section.append(details)

  const events = findEventsForDate(state.selectedDate)
  const eventHeading = document.createElement('h3')
  eventHeading.className = 'subheading'
  eventHeading.textContent = events.length ? `Sự kiện trong ngày · ${events.length}` : 'Sự kiện trong ngày'
  section.append(eventHeading)
  if (events.length === 0) section.append(makeNotice('Chưa ghi nhận sự kiện đặc biệt trong dữ liệu hiện có.'))
  else {
    const list = document.createElement('div')
    list.className = 'calendar-event-list'
    events.forEach((event) => list.append(createEventCard(event, true)))
    section.append(list)
  }
  return section
}

function renderEvents(): HTMLElement {
  const panel = document.createElement('section')
  panel.className = 'events-panel'
  panel.setAttribute('aria-label', 'Sự kiện hôm nay và ngày mai')
  const intro = document.createElement('div')
  intro.className = 'events-intro'
  const kicker = document.createElement('p')
  kicker.className = 'eyebrow'
  kicker.textContent = 'DẤU MỐC TRONG NGÀY'
  const heading = document.createElement('h2')
  heading.textContent = 'Hôm nay và ngày mai'
  intro.append(kicker, heading)
  panel.append(intro)
  if (eventSnapshot.unavailable) {
    panel.append(makeNotice(`Danh mục sự kiện hiện hỗ trợ ngày dân sự từ ${YEAR_RANGE.min} đến ${YEAR_RANGE.max}.`))
  }
  if (eventSnapshot.today !== undefined) panel.append(renderEventGroup('Hôm nay', eventSnapshot.today))
  else if (eventSnapshot.unavailable) {
    const todayDate = civilDateAtDeviceTime(new Date())
    const todayGroup = document.createElement('section')
    todayGroup.className = 'event-group'
    todayGroup.append(makeGroupHeading('Hôm nay', todayDate))
    todayGroup.append(makeNotice('Ngày này nằm ngoài phạm vi dữ liệu sự kiện.'))
    panel.append(todayGroup)
  }
  if (eventSnapshot.tomorrow !== undefined) panel.append(renderEventGroup('Ngày mai', eventSnapshot.tomorrow))
  else if (eventSnapshot.tomorrowDate !== undefined) {
    const group = document.createElement('section')
    group.className = 'event-group'
    group.append(makeGroupHeading('Ngày mai', eventSnapshot.tomorrowDate))
    group.append(makeNotice(`Ngày này nằm ngoài phạm vi dữ liệu sự kiện (${YEAR_RANGE.min}–${YEAR_RANGE.max}).`))
    panel.append(group)
  }
  return panel
}

function renderEventGroup(label: string, day: EventDay): HTMLElement {
  const group = document.createElement('section')
  group.className = 'event-group'
  group.append(makeGroupHeading(label, day.date))
  if (day.events.length === 0) group.append(makeNotice('Chưa ghi nhận sự kiện đặc biệt trong dữ liệu hiện có.'))
  else {
    const cards = document.createElement('div')
    cards.className = 'event-card-list'
    day.events.forEach((event) => cards.append(createEventCard(event, false)))
    group.append(cards)
  }
  return group
}

function makeGroupHeading(label: string, date: CivilDate): HTMLElement {
  const heading = document.createElement('div')
  heading.className = 'section-heading event-group__heading'
  const titleElement = document.createElement('h2')
  titleElement.textContent = label
  const dateElement = document.createElement('span')
  dateElement.className = 'section-heading__meta'
  dateElement.textContent = formatDate(date, true)
  heading.append(titleElement, dateElement)
  return heading
}

function createEventCard(event: CalendarEvent, compact: boolean): HTMLElement {
  const card = document.createElement('article')
  card.className = compact ? 'event-card event-card--compact' : 'event-card'
  const top = document.createElement('div')
  top.className = 'event-card__top'
  const category = document.createElement('span')
  category.className = 'event-card__category'
  category.textContent = CATEGORY_LABELS[event.category]
  top.append(category)
  const titleElement = document.createElement('h3')
  titleElement.textContent = event.title
  const description = document.createElement('p')
  description.className = 'event-card__description'
  description.textContent = event.description
  card.append(top, titleElement, description)
  const sourceDetails = document.createElement('details')
  sourceDetails.className = 'event-card__sources'
  const sourceSummary = document.createElement('summary')
  sourceSummary.textContent = event.sources.length === 1
    ? `Xem nguồn: ${event.sources[0].publisher}`
    : `Nguồn tham khảo (${event.sources.length})`
  sourceDetails.append(sourceSummary)
  event.sources.forEach((source, index) => {
    const link = document.createElement('a')
    link.href = source.url
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    link.dataset.focusKey = `source-${event.id}-${index}`
    link.textContent = `${source.publisher}: ${source.title}`
    sourceDetails.append(link)
  })
  if (event.sources.length > 0) card.append(sourceDetails)
  return card
}

function makeNotice(text: string): HTMLElement {
  const notice = document.createElement('p')
  notice.className = 'empty-notice'
  notice.textContent = text
  return notice
}

function makeDateSummaryLabel(text: string): HTMLElement {
  const label = document.createElement('span')
  label.textContent = text
  return label
}

function button(label: string, className: string): HTMLButtonElement {
  const element = document.createElement('button')
  element.type = 'button'
  element.className = className
  if (label) element.textContent = label
  return element
}

function iconButton(label: string, glyph: string): HTMLButtonElement {
  const element = button(glyph, 'icon-button')
  element.setAttribute('aria-label', label)
  return element
}

function moveMonth(offset: number): void {
  const absoluteMonth = state.visibleMonth.year * 12 + state.visibleMonth.month - 1 + offset
  const year = Math.floor(absoluteMonth / 12)
  const month = absoluteMonth % 12 + 1
  if (year < YEAR_RANGE.min || year > YEAR_RANGE.max) return
  state.visibleMonth = { year, month }
  render()
}

function selectCalendarDate(date: CivilDate): void {
  const visibleMonth = createVisibleMonth(date.year, date.month)
  if (visibleMonth === null) return
  state.selectedDate = date
  state.visibleMonth = visibleMonth
  render(true, 'selected-day-details')
  const detailsHeading = content.querySelector<HTMLElement>('.day-details__title')
  if (detailsHeading === null) return

  const viewport = content.getBoundingClientRect()
  const heading = detailsHeading.getBoundingClientRect()
  const inset = 12
  if (heading.top < viewport.top + inset || heading.bottom > viewport.bottom - inset) {
    const top = content.scrollTop + heading.top - viewport.top - inset
    const behavior: ScrollBehavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth'
    content.scrollTo({ top: Math.max(0, top), behavior })
  }
}

function openMonthDialog(): void {
  draftMonth = { ...state.visibleMonth }
  yearInput.value = String(draftMonth.year)
  clearYearError()
  renderMonthChoices()
  updateYearStepper()
  if (!dialog.open) dialog.showModal()
  monthPickerGrid.querySelector<HTMLButtonElement>('[aria-pressed="true"]')?.focus()
}

function renderMonthChoices(): void {
  monthPickerGrid.replaceChildren(...MONTHS.map((name, index) => {
    const month = index + 1
    const choice = button(`Tháng ${month}`, 'month-choice')
    choice.dataset.month = String(month)
    choice.setAttribute('aria-label', name)
    choice.setAttribute('aria-pressed', String(draftMonth.month === month))
    return choice
  }))
}

function updateYearStepper(): void {
  decreaseYearButton.disabled = draftMonth.year <= YEAR_RANGE.min
  increaseYearButton.disabled = draftMonth.year >= YEAR_RANGE.max
  yearAnnouncement.textContent = `Năm ${draftMonth.year}`
}

function clearYearError(): void {
  yearError.hidden = true
  yearInput.setAttribute('aria-invalid', 'false')
}

function showYearError(): void {
  yearError.hidden = false
  yearInput.setAttribute('aria-invalid', 'true')
  yearInput.focus()
}

function stepDraftYear(delta: -1 | 1): void {
  const nextYear = draftMonth.year + delta
  if (createVisibleMonth(nextYear, draftMonth.month) === null) return
  draftMonth = { ...draftMonth, year: nextYear }
  yearInput.value = String(nextYear)
  clearYearError()
  updateYearStepper()
}

function getEventSnapshot(dateTime: Date): EventSnapshot {
  try {
    const result = getTodayAndTomorrow(dateTime)
    return { ...result, unavailable: false }
  } catch (error) {
    if (!(error instanceof RangeError)) throw error
    const todayDate = civilDateAtDeviceTime(dateTime)
    const tomorrowDate = julianDayNumberToCivilDate(civilDateToJulianDayNumber(todayDate) + 1)
    if (!isSupportedDate(todayDate) || !isSupportedDate(tomorrowDate)) {
      if (isSupportedDate(todayDate)) {
        return {
          today: { date: todayDate, events: findEventsForDate(todayDate) },
          tomorrowDate,
          unavailable: false,
        }
      }
      return { tomorrowDate, unavailable: true }
    }
    throw error
  }
}

function attachCalendarSwipe(target: HTMLElement): void {
  let startX: number | undefined
  let startY: number | undefined
  target.addEventListener('touchstart', (event: TouchEvent) => {
    const touch = event.changedTouches[0]
    if (touch === undefined) return
    startX = touch.clientX
    startY = touch.clientY
  }, { passive: true })
  target.addEventListener('touchend', (event: TouchEvent) => {
    const touch = event.changedTouches[0]
    if (touch === undefined || startX === undefined || startY === undefined) return
    const deltaX = touch.clientX - startX
    const deltaY = touch.clientY - startY
    startX = undefined
    startY = undefined
    if (Math.abs(deltaX) < 56 || Math.abs(deltaX) < Math.abs(deltaY) * 1.25) return
    moveMonth(deltaX < 0 ? 1 : -1)
  }, { passive: true })
  target.addEventListener('touchcancel', () => {
    startX = undefined
    startY = undefined
  }, { passive: true })
}

function scheduleMidnightRefresh(): void {
  if (midnightTimer !== undefined) window.clearTimeout(midnightTimer)
  const now = new Date()
  const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1)
  const delay = Math.max(1000, nextMidnight.getTime() - now.getTime())
  midnightTimer = window.setTimeout(() => {
    midnightTimer = undefined
    refreshForCurrentDate()
  }, delay)
}

function refreshForCurrentDate(): void {
  const nextSnapshot = getEventSnapshot(new Date())
  const changed = eventSnapshotKey(eventSnapshot) !== eventSnapshotKey(nextSnapshot)
  eventSnapshot = nextSnapshot
  scheduleMidnightRefresh()
  if (changed) render()
}

function eventSnapshotKey(snapshot: EventSnapshot): string {
  const groupKey = (day: EventDay | undefined): string => day === undefined
    ? 'unavailable'
    : `${dateKey(day.date)}:${day.events.map((event) => event.id).join(',')}`
  return [
    snapshot.unavailable,
    groupKey(snapshot.today),
    groupKey(snapshot.tomorrow),
    snapshot.tomorrowDate === undefined ? '' : dateKey(snapshot.tomorrowDate),
  ].join('|')
}

calendarNav.addEventListener('click', () => setActiveTab('calendar'))
eventsNav.addEventListener('click', () => setActiveTab('events'))
content.addEventListener('scroll', () => {
  state.scrollPositions[state.activeTab] = content.scrollTop
}, { passive: true })
closeDialogButton.addEventListener('click', () => dialog.close())
dialog.addEventListener('close', () => {
  queueMicrotask(() => content.querySelector<HTMLButtonElement>('.month-title')?.focus({ preventScroll: true }))
})
monthPickerGrid.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return
  const choice = event.target.closest<HTMLButtonElement>('[data-month]')
  if (choice === null || !monthPickerGrid.contains(choice)) return
  const month = Number(choice.dataset.month)
  if (createVisibleMonth(draftMonth.year, month) === null) return
  draftMonth = { ...draftMonth, month }
  for (const monthButton of monthPickerGrid.querySelectorAll<HTMLButtonElement>('[data-month]')) {
    monthButton.setAttribute('aria-pressed', String(monthButton === choice))
  }
})
yearInput.addEventListener('input', () => {
  const year = parseSupportedYear(yearInput.value)
  if (year !== null) {
    draftMonth = { ...draftMonth, year }
    clearYearError()
  }
  updateYearStepper()
})
decreaseYearButton.addEventListener('click', () => stepDraftYear(-1))
increaseYearButton.addEventListener('click', () => stepDraftYear(1))
monthForm.addEventListener('submit', (event) => {
  event.preventDefault()
  const year = parseSupportedYear(yearInput.value)
  const selection = year === null ? null : createVisibleMonth(year, draftMonth.month)
  if (selection === null) {
    showYearError()
    return
  }
  state.visibleMonth = selection
  dialog.close()
  render()
})
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') refreshForCurrentDate()
})
window.addEventListener('focus', refreshForCurrentDate)
window.addEventListener('pageshow', refreshForCurrentDate)
window.addEventListener('pagehide', () => {
  if (midnightTimer !== undefined) window.clearTimeout(midnightTimer)
  midnightTimer = undefined
})

render()
scheduleMidnightRefresh()
