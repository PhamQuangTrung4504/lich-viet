import assert from 'node:assert/strict'
import test from 'node:test'
import { VERIFIED_EVENTS } from '../src/events/data.ts'

type CandidateStatus = 'approved' | 'under_review' | 'out_of_scope'
type Candidate = {
  readonly id: string
  readonly title: string
  readonly category: string
  readonly expectedRule: string
  readonly status: CandidateStatus
  readonly aliases?: readonly string[]
  readonly reviewNote?: string
}

// Contract baseline maintained separately from production data. Source-derived
// omissions are tracked independently in REFERENCE_CANDIDATES below.
const CANDIDATES: readonly Candidate[] = [
  { id: 'new-year-day', title: 'Tết Dương lịch', category: 'official_holiday', expectedRule: 'solar:1:1', status: 'approved' },
  { id: 'lunar-new-year-day-1', title: 'Mùng 1 Tết Nguyên đán', category: 'official_holiday', expectedRule: 'lunar:1:1:regular_only', status: 'approved', aliases: ['Mùng Một Tết'] },
  { id: 'lunar-new-year-eve', title: 'Giao thừa Tết Nguyên đán', category: 'traditional', expectedRule: 'lunar_month_end:12', status: 'approved' },
  { id: 'nguyen-tieu', title: 'Tết Nguyên tiêu (Rằm tháng Giêng)', category: 'traditional', expectedRule: 'lunar:1:15:regular_only', status: 'approved', aliases: ['Tết Thượng Nguyên', 'Rằm tháng Giêng'] },
  { id: 'tao-quan', title: 'Lễ tiễn Táo quân', category: 'traditional', expectedRule: 'lunar:12:23:regular_only', status: 'approved', aliases: ['Ông Công Ông Táo'] },
  { id: 'than-tai-day', title: 'Ngày vía Thần Tài', category: 'traditional', expectedRule: 'lunar:1:10:regular_only', status: 'approved' },
  { id: 'han-thuc', title: 'Tết Hàn thực', category: 'traditional', expectedRule: 'lunar:3:3:regular_only', status: 'approved' },
  { id: 'vesak', title: 'Lễ Phật đản', category: 'traditional', expectedRule: 'lunar:4:15:regular_only', status: 'approved' },
  { id: 'valentines-day', title: 'Ngày Lễ tình nhân', category: 'international', expectedRule: 'solar:2:14', status: 'approved', aliases: ['Valentine'] },
  { id: 'international-womens-day', title: 'Ngày Quốc tế Phụ nữ', category: 'international', expectedRule: 'solar:3:8', status: 'approved' },
  { id: 'hung-kings-day', title: 'Giỗ Tổ Hùng Vương', category: 'official_holiday', expectedRule: 'lunar:3:10:regular_only', status: 'approved' },
  { id: 'world-water-day', title: 'Ngày Nước Thế giới', category: 'international', expectedRule: 'solar:3:22', status: 'approved' },
  { id: 'vietnam-doctors-day', title: 'Ngày Thầy thuốc Việt Nam', category: 'commemoration', expectedRule: 'solar:2:27:start=1985', status: 'approved' },
  { id: 'vietnam-book-day-legacy', title: 'Ngày Sách Việt Nam', category: 'commemoration', expectedRule: 'solar:4:21:start=2014:end=2021', status: 'approved' },
  { id: 'vietnam-book-reading-culture-day', title: 'Ngày Sách và Văn hóa đọc Việt Nam', category: 'commemoration', expectedRule: 'solar:4:21:start=2022', status: 'approved' },
  { id: 'reunification-day', title: 'Ngày Giải phóng miền Nam, thống nhất đất nước', category: 'official_holiday', expectedRule: 'solar:4:30', status: 'approved', aliases: ['Ngày 30/4'] },
  { id: 'international-workers-day', title: 'Ngày Quốc tế Lao động', category: 'official_holiday', expectedRule: 'solar:5:1', status: 'approved' },
  { id: 'international-childrens-day', title: 'Ngày Quốc tế Thiếu nhi', category: 'international', expectedRule: 'solar:6:1', status: 'approved' },
  { id: 'doan-ngo', title: 'Tết Đoan Ngọ', category: 'traditional', expectedRule: 'lunar:5:5:regular_only', status: 'approved', aliases: ['Tết Đoan Dương'] },
  { id: 'vu-lan', title: 'Lễ Vu Lan', category: 'traditional', expectedRule: 'lunar:7:15:regular_only', status: 'approved', aliases: ['Vu Lan'] },
  { id: 'trung-nguyen', title: 'Tết Trung Nguyên', category: 'traditional', expectedRule: 'lunar:7:15:regular_only', status: 'approved' },
  { id: 'that-tich', title: 'Thất Tịch (Lễ Ngâu)', category: 'traditional', expectedRule: 'lunar:7:7:regular_only', status: 'approved', aliases: ['Lễ Ngâu', 'Ngày ông Ngâu bà Ngâu'] },
  { id: 'trung-thap', title: 'Tết Trùng Thập', category: 'traditional', expectedRule: 'lunar:10:10:regular_only', status: 'approved', aliases: ['Trùng Thập', 'Tết Song Thập'] },
  { id: 'ha-nguyen', title: 'Tết Hạ Nguyên (Rằm tháng Mười)', category: 'traditional', expectedRule: 'lunar:10:15:regular_only', status: 'approved', aliases: ['Hạ Nguyên', 'Rằm tháng Mười'] },
  { id: 'world-environment-day', title: 'Ngày Môi trường Thế giới', category: 'international', expectedRule: 'solar:6:5', status: 'approved' },
  { id: 'vietnam-press-day', title: 'Ngày Báo chí Cách mạng Việt Nam', category: 'commemoration', expectedRule: 'solar:6:21:start=1925', status: 'approved' },
  { id: 'vietnam-red-cross-founding-day', title: 'Ngày thành lập Hội Chữ thập đỏ Việt Nam', category: 'commemoration', expectedRule: 'solar:11:23:start=1946', status: 'approved' },
  { id: 'vietnam-law-day', title: 'Ngày Pháp luật Việt Nam', category: 'commemoration', expectedRule: 'solar:11:9:start=2013', status: 'approved' },
  { id: 'vietnam-communist-party-founding-day', title: 'Ngày thành lập Đảng Cộng sản Việt Nam', category: 'commemoration', expectedRule: 'solar:2:3:start=1930', status: 'approved' },
  { id: 'vietnam-youth-union-founding-day', title: 'Ngày thành lập Đoàn TNCS Hồ Chí Minh', category: 'commemoration', expectedRule: 'solar:3:26:start=1931', status: 'approved' },
  { id: 'ho-chi-minh-birthday', title: 'Ngày sinh Chủ tịch Hồ Chí Minh', category: 'commemoration', expectedRule: 'solar:5:19:start=1890', status: 'approved' },
  { id: 'vietnam-science-technology-day', title: 'Ngày Khoa học và Công nghệ Việt Nam', category: 'commemoration', expectedRule: 'solar:5:18:start=2014:end=2025', status: 'approved' },
  { id: 'vietnam-science-technology-innovation-day', title: 'Ngày Khoa học, Công nghệ và Đổi mới sáng tạo Việt Nam', category: 'commemoration', expectedRule: 'solar:5:18:start=2026', status: 'approved' },
  { id: 'dien-bien-phu-victory-day', title: 'Ngày Chiến thắng Điện Biên Phủ', category: 'commemoration', expectedRule: 'solar:5:7:start=1954', status: 'approved' },
  { id: 'vietnam-family-day', title: 'Ngày Gia đình Việt Nam', category: 'commemoration', expectedRule: 'solar:6:28:start=2001', status: 'approved' },
  { id: 'war-invalids-martyrs-day', title: 'Ngày Thương binh - Liệt sĩ', category: 'commemoration', expectedRule: 'solar:7:27:start=1947', status: 'approved' },
  { id: 'august-revolution-day', title: 'Ngày Cách mạng Tháng Tám', category: 'commemoration', expectedRule: 'solar:8:19:start=1945', status: 'approved' },
  { id: 'national-day', title: 'Quốc khánh Việt Nam', category: 'official_holiday', expectedRule: 'solar:9:2', status: 'approved' },
  { id: 'international-literacy-day', title: 'Ngày Quốc tế Xóa mù chữ', category: 'international', expectedRule: 'solar:9:8', status: 'approved' },
  { id: 'international-day-of-peace', title: 'Ngày Quốc tế Hòa bình', category: 'international', expectedRule: 'solar:9:21', status: 'approved' },
  { id: 'mid-autumn-festival', title: 'Tết Trung thu', category: 'traditional', expectedRule: 'lunar:8:15:regular_only', status: 'approved', aliases: ['Tết Trông Trăng', 'Tết Đoàn Viên'] },
  { id: 'trung-cuu', title: 'Tết Trùng Cửu (Trùng Dương)', category: 'traditional', expectedRule: 'lunar:9:9:regular_only', status: 'approved' },
  { id: 'hanoi-liberation-day', title: 'Ngày Giải phóng Thủ đô', category: 'commemoration', expectedRule: 'solar:10:10:start=1954', status: 'approved' },
  { id: 'halloween', title: 'Halloween', category: 'international', expectedRule: 'solar:10:31', status: 'approved' },
  { id: 'world-teachers-day', title: 'Ngày Nhà giáo Thế giới', category: 'international', expectedRule: 'solar:10:5', status: 'approved' },
  { id: 'vietnamese-womens-day', title: 'Ngày Phụ nữ Việt Nam', category: 'commemoration', expectedRule: 'solar:10:20:start=1930', status: 'approved' },
  { id: 'world-childrens-day', title: 'Ngày Trẻ em Thế giới', category: 'international', expectedRule: 'solar:11:20:start=1954', status: 'approved' },
  { id: 'vietnam-national-unity-day', title: 'Ngày hội Đại đoàn kết toàn dân tộc', category: 'commemoration', expectedRule: 'solar:11:18:start=2003', status: 'approved' },
  { id: 'vietnamese-teachers-day', title: 'Ngày Nhà giáo Việt Nam', category: 'commemoration', expectedRule: 'solar:11:20:start=1982', status: 'approved' },
  { id: 'vietnam-culture-day', title: 'Ngày Văn hóa Việt Nam', category: 'official_holiday', expectedRule: 'solar:11:24:start=2026', status: 'approved' },
  { id: 'world-aids-day', title: 'Ngày Thế giới Phòng chống AIDS', category: 'international', expectedRule: 'solar:12:1', status: 'approved' },
  { id: 'human-rights-day', title: 'Ngày Nhân quyền Thế giới', category: 'international', expectedRule: 'solar:12:10', status: 'approved' },
  { id: 'vietnam-peoples-army-day', title: 'Ngày thành lập Quân đội nhân dân Việt Nam', category: 'commemoration', expectedRule: 'solar:12:22:start=1944', status: 'approved' },
  { id: 'national-resistance-day', title: 'Ngày Toàn quốc kháng chiến', category: 'commemoration', expectedRule: 'solar:12:19:start=1946', status: 'approved' },
  { id: 'christmas-day', title: 'Lễ Giáng sinh', category: 'international', expectedRule: 'solar:12:25', status: 'approved' },
  { id: 'mothers-day', title: 'Ngày của Mẹ', category: 'international', expectedRule: 'weekday_rule:5:0:2', status: 'under_review', reviewNote: 'Quy tắc phổ biến quốc tế đã biết, nhưng độ phổ biến và cách dùng tại Việt Nam chưa được nghiên cứu đủ.' },
  { id: 'fathers-day', title: 'Ngày của Cha', category: 'international', expectedRule: 'weekday_rule:6:0:3', status: 'under_review', reviewNote: 'Quy tắc phổ biến quốc tế đã biết, nhưng độ phổ biến và cách dùng tại Việt Nam chưa được nghiên cứu đủ.' },
  { id: 'substitute-holiday-schedules', title: 'Lịch nghỉ bù theo từng năm', category: 'official_holiday', expectedRule: 'year_specific', status: 'out_of_scope', reviewNote: 'Cần văn bản/điều chỉnh chính thức cho từng năm; không suy ra từ ngày lễ lặp.' },
]

type SourceCandidate = {
  readonly id: string
  readonly priority: 'P0' | 'P1'
  readonly status: 'approved' | 'under_review' | 'out_of_scope'
  readonly eventIds: readonly string[]
  readonly referenceUrls: readonly string[]
  readonly referenceUrlsByEventId?: Readonly<Record<string, readonly string[]>>
}

// P0: formal national designation by law/government/central institution.
// P1: broadly familiar Vietnamese observance or custom, not a statutory day off.
// Seeded from independent sources; this list is not generated by VERIFIED_EVENTS.
const REFERENCE_CANDIDATES: readonly SourceCandidate[] = [
  { id: 'doctors-day', priority: 'P0', status: 'approved', eventIds: ['vietnam-doctors-day'], referenceUrls: [
    'https://vnpa.moh.gov.vn/chuc-mung-ngay-thay-thuoc-viet-nam-27-02/',
    'https://thuvienphapluat.vn/van-ban/The-thao-Y-te/Quyet-dinh-39-HDBT-ngay-Thay-thuoc-Viet-Nam-17756.aspx',
  ] },
  { id: 'book-day-previous-name', priority: 'P0', status: 'approved', eventIds: ['vietnam-book-day-legacy'], referenceUrls: [
    'https://vanban.chinhphu.vn/default.aspx?docid=172490&pageid=27160',
  ] },
  { id: 'book-and-reading-culture-day', priority: 'P0', status: 'approved', eventIds: ['vietnam-book-reading-culture-day'], referenceUrls: [
    'https://vanban.chinhphu.vn/default.aspx?docid=172490&pageid=27160',
    'https://vanban.chinhphu.vn/default.aspx?docid=204408&pageid=27160',
  ] },
  { id: 'science-and-technology-day', priority: 'P0', status: 'approved', eventIds: ['vietnam-science-technology-day', 'vietnam-science-technology-innovation-day'], referenceUrls: [
      'https://vbpl.moj.gov.vn/bovanhoathethao/Pages/vbpq-toanvan.aspx?ItemID=32522',
      'https://www.most.gov.vn/Images/editor/files/CV%20961_BKHCN_VP%20_7_4.pdf',
    ], referenceUrlsByEventId: {
      'vietnam-science-technology-innovation-day': [
      'https://chinhphu.vn/?classid=1&docid=214603&orggroupid=1&pageid=27160',
      'https://eav.gov.vn/d/vi-VN/news-o/Ngay-185-chinh-thuc-tro-thanh-Ngay-Khoa-hoc-Cong-nghe-va-Doi-moi-sang-tao-Viet-Nam-60-38-59081',
      ],
    } },
  { id: 'national-unity-day', priority: 'P0', status: 'approved', eventIds: ['vietnam-national-unity-day'], referenceUrls: [
    'https://mattran.org.vn/hoat-dong/mot-so-van-de-ly-luan-ve-to-chuc-ngay-hoi-dai-doan-ket-toan-dan-toc-trong-giai-doan-moi-51227.html',
  ] },
  { id: 'than-tai-observance', priority: 'P1', status: 'approved', eventIds: ['than-tai-day'], referenceUrls: [
    'https://hoianheritage.net/uploads/download/4-khanh-van.pdf',
    'https://tuoitre.vn/mung-10-thang-gieng-ngay-via-than-tai-hay-ngay-via-than-dat-20220211093522245.htm',
  ] },
  { id: 'trung-nguyen-observance', priority: 'P1', status: 'approved', eventIds: ['trung-nguyen'], referenceUrls: [
    'https://archives.org.vn/gioi-thieu-tai-lieu-nghiep-vu/tet-trung-nguyen-vu-lan-xa-toi-vog-nhan-nguon-goc-va-tam-thuc-dan-gian-viet.htm',
    'https://tuoitre.vn/dulichtphcm/tet-trung-nguyen-vu-lan-xa-toi-vong-nhan-trong-tin-nguong-viet-10759329.htm',
  ] },
  { id: 'that-tich-observance', priority: 'P1', status: 'approved', eventIds: ['that-tich'], referenceUrls: [
    'https://vov.vn/doi-song/that-tich-2026-la-ngay-nao-thu-may-post1324704.vov',
    'https://vtv.vn/doi-song/nguon-goc-va-y-nghia-cua-le-that-tich-2021081414364009.htm',
  ] },
  { id: 'trung-thap-observance', priority: 'P1', status: 'approved', eventIds: ['trung-thap'], referenceUrls: [
    'https://vjol.info.vn/index.php/khxhvn/article/download/108698/91296/',
    'https://vjol.info.vn/index.php/khxh/article/download/57555/54282/',
  ] },
  { id: 'ha-nguyen-observance', priority: 'P1', status: 'approved', eventIds: ['ha-nguyen'], referenceUrls: [
    'https://vjol.info.vn/index.php/khxh/article/download/57555/54282/',
    'https://baochinhphu.vn/mua-xuan-va-tet-nguyen-tieu-102138919.htm',
  ] },
]

function actualRule(event: (typeof VERIFIED_EVENTS)[number]): string {
  const rule = event.rule
  switch (rule.type) {
    case 'solar_fixed': return `solar:${rule.month}:${rule.day}${rule.startYear === undefined ? '' : `:start=${rule.startYear}`}${rule.endYear === undefined ? '' : `:end=${rule.endYear}`}`
    case 'lunar_fixed': return `lunar:${rule.month}:${rule.day}:${rule.leapMonthPolicy}`
    case 'lunar_month_end': return `lunar_month_end:${rule.month}`
    case 'weekday_rule': return `weekday_rule:${rule.month}:${rule.weekday}:${rule.occurrence}`
    case 'year_specific': return `year_specific:${rule.date.year}-${rule.date.month}-${rule.date.day}`
  }
}

test('contract regression: production matches approved IDs, names, categories and recurrence rules', () => {
  const candidateIds = CANDIDATES.map(({ id }) => id)
  const productionIds = VERIFIED_EVENTS.map(({ id }) => id)
  assert.equal(new Set(candidateIds).size, candidateIds.length, 'candidate IDs must be unique')
  assert.equal(new Set(productionIds).size, productionIds.length, 'production IDs must be unique')

  const candidatesById = new Map(CANDIDATES.map((candidate) => [candidate.id, candidate]))
  for (const event of VERIFIED_EVENTS) {
    const candidate = candidatesById.get(event.id)
    assert.ok(candidate, `${event.id} is missing from the independent candidate inventory`)
    assert.equal(candidate.status, 'approved', `${event.id} is not approved for production`)
    assert.equal(event.title, candidate.title, `${event.id} title/alias review differs`)
    assert.equal(event.category, candidate.category, `${event.id} holiday classification differs`)
    assert.equal(actualRule(event), candidate.expectedRule, `${event.id} recurrence/effective-date rule differs`)
    assert.ok(event.sources.length > 0, `${event.id} needs a source to be considered approved`)
  }
  assert.equal(CANDIDATES.filter(({ status }) => status === 'approved').length, productionIds.length)
  for (const candidate of CANDIDATES.filter(({ status }) => status !== 'approved')) {
    assert.ok(candidate.reviewNote?.trim(), `${candidate.id} needs a reason for its non-production status`)
    assert.ok(!productionIds.includes(candidate.id), `${candidate.id} is not approved and must not enter production`)
  }
})
test('candidate aliases do not silently identify two distinct occasions', () => {
  const aliases = new Map<string, string>()
  for (const candidate of CANDIDATES) {
    for (const alias of [candidate.title, ...(candidate.aliases ?? [])]) {
      const normalized = alias.normalize('NFC').toLocaleLowerCase('vi').replace(/[()]/g, '').trim()
      const previous = aliases.get(normalized)
      assert.ok(previous === undefined || previous === candidate.id, `Alias "${alias}" collides between ${previous} and ${candidate.id}`)
      aliases.set(normalized, candidate.id)
    }
  }
  assert.notEqual(candidatesById('trung-thap').expectedRule, candidatesById('ha-nguyen').expectedRule)
})

test('verified event details retain evidence and distinguish Trùng Thập from Hạ Nguyên', () => {
  const eventsById = new Map(VERIFIED_EVENTS.map((event) => [event.id, event]))
  const trungThap = eventsById.get('trung-thap')
  const haNguyen = eventsById.get('ha-nguyen')
  assert.ok(trungThap?.details)
  assert.ok(haNguyen?.details)
  assert.deepEqual(trungThap.details.aliases, ['Tết Song Thập'])
  assert.match(trungThap.details.customs ?? '', /một số nhà thầy thuốc/i)
  assert.match(trungThap.details.customs ?? '', /không đồng nghĩa hoàn toàn với Thường Tân hay Cơm mới/)
  assert.match(trungThap.details.customs ?? '', /27\/2 hiện nay/)
  assert.match(haNguyen.description, /khác ngày Trùng Thập 10\/10/)
  assert.notDeepEqual(trungThap.rule, haNguyen.rule)
  assert.ok(trungThap.sources.some(({ url }) => url === 'https://vjol.info.vn/index.php/khxhvn/article/download/108698/91296/'))
})

test('detail metadata is optional, non-empty when present, and Wikipedia links are explicit Vietnamese pages', () => {
  const wikipediaEvents = VERIFIED_EVENTS.filter(({ wikipediaUrl }) => wikipediaUrl !== undefined)
  assert.deepEqual(wikipediaEvents.map(({ id }) => id).sort(), ['doan-ngo', 'mid-autumn-festival'])
  for (const event of VERIFIED_EVENTS) {
    assert.ok(event.sources.length > 0, `${event.id} must keep source metadata outside the cards`)
    assert.ok(event.description.trim().length >= 40, `${event.id} needs a useful card description`)
    const details = event.details
    if (details === undefined) continue
    assert.equal('notes' in details, false, `${event.id} should not have a separate notes section`)
    for (const alias of details.aliases ?? []) assert.ok(alias.trim().length > 0, `${event.id} has an empty alias`)
    for (const text of [details.origin, details.significance, details.customs]) {
      if (text !== undefined) assert.ok(text.trim().length > 0, `${event.id} has an empty detail paragraph`)
    }
    if (event.wikipediaUrl !== undefined) {
      const url = new URL(event.wikipediaUrl)
      assert.equal(url.protocol, 'https:')
      assert.equal(url.hostname, 'vi.wikipedia.org')
      assert.ok(url.pathname.startsWith('/wiki/'))
    }
  }
})

function candidatesById(id: string): Candidate {
  const candidate = CANDIDATES.find((entry) => entry.id === id)
  assert.ok(candidate, `Missing candidate ${id}`)
  return candidate
}

test('source coverage: independently referenced P0/P1 candidates are in production with their evidence links', () => {
  const productionById = new Map(VERIFIED_EVENTS.map((event) => [event.id, event]))
  assert.equal(new Set(REFERENCE_CANDIDATES.map(({ id }) => id)).size, REFERENCE_CANDIDATES.length)
  assert.equal(REFERENCE_CANDIDATES.filter(({ priority }) => priority === 'P0').length, 5)
  assert.equal(REFERENCE_CANDIDATES.filter(({ priority }) => priority === 'P1').length, 5)
  for (const candidate of REFERENCE_CANDIDATES.filter(({ status }) => status === 'approved')) {
    for (const eventId of candidate.eventIds) {
      const event = productionById.get(eventId)
      assert.ok(event, `Source candidate ${candidate.id} is missing production event ${eventId}`)
      const eventUrls = new Set(event.sources.map(({ url }) => url))
      const referenceUrls = candidate.referenceUrlsByEventId?.[eventId] ?? candidate.referenceUrls
      assert.ok(referenceUrls.length > 0, `${candidate.id} needs source references for ${eventId}`)
      for (const url of referenceUrls) {
        assert.ok(eventUrls.has(url), `${eventId} does not retain candidate reference ${url}`)
      }
    }
  }
})
