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
  readonly occasionKey?: string
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
  { id: 'international-day-of-peace-2000', title: 'Ngày Quốc tế Hòa bình', category: 'international', expectedRule: 'year_specific:2000-9-19', status: 'approved', occasionKey: 'international-day-of-peace' },
  { id: 'international-day-of-peace-2001', title: 'Ngày Quốc tế Hòa bình', category: 'international', expectedRule: 'year_specific:2001-9-14', status: 'approved', occasionKey: 'international-day-of-peace' },
  { id: 'international-day-of-peace', title: 'Ngày Quốc tế Hòa bình', category: 'international', expectedRule: 'solar:9:21:start=2002', status: 'approved', occasionKey: 'international-day-of-peace' },
  { id: 'mid-autumn-festival', title: 'Tết Trung thu', category: 'traditional', expectedRule: 'lunar:8:15:regular_only', status: 'approved', aliases: ['Tết Trông Trăng', 'Tết Đoàn Viên'] },
  { id: 'trung-cuu', title: 'Tết Trùng Cửu (Trùng Dương)', category: 'traditional', expectedRule: 'lunar:9:9:regular_only', status: 'approved' },
  { id: 'hanoi-liberation-day', title: 'Ngày Giải phóng Thủ đô', category: 'commemoration', expectedRule: 'solar:10:10:start=1954', status: 'approved' },
  { id: 'halloween', title: 'Halloween', category: 'international', expectedRule: 'solar:10:31', status: 'approved' },
  { id: 'world-teachers-day', title: 'Ngày Nhà giáo Thế giới', category: 'international', expectedRule: 'solar:10:5', status: 'approved' },
  { id: 'vietnamese-womens-day', title: 'Ngày Phụ nữ Việt Nam', category: 'commemoration', expectedRule: 'solar:10:20:start=2010', status: 'approved', occasionKey: 'vietnam-womens-day' },
  { id: 'world-childrens-day', title: 'Ngày Trẻ em Thế giới', category: 'international', expectedRule: 'solar:11:20:start=1954', status: 'approved' },
  { id: 'vietnam-national-unity-day', title: 'Ngày hội Đại đoàn kết toàn dân tộc', category: 'commemoration', expectedRule: 'solar:11:18:start=2003', status: 'approved' },
  { id: 'vietnamese-teachers-day', title: 'Ngày Nhà giáo Việt Nam', category: 'commemoration', expectedRule: 'solar:11:20:start=1982', status: 'approved' },
  { id: 'vietnam-culture-day', title: 'Ngày Văn hóa Việt Nam', category: 'official_holiday', expectedRule: 'solar:11:24:start=2026', status: 'approved' },
  { id: 'world-aids-day', title: 'Ngày Thế giới Phòng chống AIDS', category: 'international', expectedRule: 'solar:12:1', status: 'approved' },
  { id: 'human-rights-day', title: 'Ngày Nhân quyền Thế giới', category: 'international', expectedRule: 'solar:12:10', status: 'approved' },
  { id: 'vietnam-peoples-army-day', title: 'Ngày thành lập Quân đội nhân dân Việt Nam', category: 'commemoration', expectedRule: 'solar:12:22:start=1944', status: 'approved' },
  { id: 'national-resistance-day', title: 'Ngày Toàn quốc kháng chiến', category: 'commemoration', expectedRule: 'solar:12:19:start=1946', status: 'approved' },
  { id: 'christmas-day', title: 'Lễ Giáng sinh', category: 'international', expectedRule: 'solar:12:25', status: 'approved' },
  { id: 'vietnam-students-day', title: 'Ngày truyền thống Học sinh, Sinh viên Việt Nam', category: 'commemoration', expectedRule: 'solar:1:9:start=1950', status: 'approved' },
  { id: 'vietnam-border-guard-traditional-day', title: 'Ngày truyền thống Bộ đội Biên phòng', category: 'commemoration', expectedRule: 'solar:3:3:start=1959', status: 'approved' },
  { id: 'vietnam-all-people-border-day-legacy', title: 'Ngày Biên phòng', category: 'commemoration', expectedRule: 'solar:3:3:start=2000:end=2003', status: 'approved' },
  { id: 'vietnam-all-people-border-day', title: 'Ngày Biên phòng toàn dân', category: 'commemoration', expectedRule: 'solar:3:3:start=2004', status: 'approved' },
  { id: 'vietnam-consumer-rights-day', title: 'Ngày Quyền của người tiêu dùng Việt Nam', category: 'commemoration', expectedRule: 'solar:3:15:start=2016', status: 'approved' },
  { id: 'vietnam-sports-day', title: 'Ngày Thể thao Việt Nam', category: 'commemoration', expectedRule: 'solar:3:27:start=1991', status: 'approved' },
  { id: 'vietnam-militia-self-defense-day', title: 'Ngày truyền thống Dân quân tự vệ Việt Nam', category: 'commemoration', expectedRule: 'solar:3:28:start=1935', status: 'approved' },
  { id: 'vietnam-persons-with-disabilities-day', title: 'Ngày Người khuyết tật Việt Nam', category: 'commemoration', expectedRule: 'solar:4:18:start=2011', status: 'approved' },
  { id: 'international-red-cross-day', title: 'Ngày Chữ thập đỏ và Trăng lưỡi liềm đỏ quốc tế', category: 'international', expectedRule: 'solar:5:8:start=1984', status: 'approved' },
  { id: 'vietnam-young-pioneers-founding-day', title: 'Ngày thành lập Đội Thiếu niên Tiền phong Hồ Chí Minh', category: 'commemoration', expectedRule: 'solar:5:15:start=1941', status: 'approved' },
  { id: 'vietnam-older-persons-traditional-day', title: 'Ngày truyền thống Người cao tuổi Việt Nam', category: 'commemoration', expectedRule: 'solar:6:6:start=2006', status: 'approved' },
  { id: 'vietnam-health-insurance-day', title: 'Ngày Bảo hiểm y tế Việt Nam', category: 'commemoration', expectedRule: 'solar:7:1:start=2009', status: 'approved' },
  { id: 'vietnam-agent-orange-victims-day', title: 'Ngày Vì nạn nhân chất độc da cam Việt Nam', category: 'commemoration', expectedRule: 'solar:8:10:start=2004', status: 'approved' },
  { id: 'vietnam-public-security-traditional-day', title: 'Ngày truyền thống Công an nhân dân Việt Nam', category: 'commemoration', expectedRule: 'solar:8:19:start=1945', status: 'approved' },
  { id: 'vietnam-all-people-national-security-day', title: 'Ngày hội toàn dân bảo vệ an ninh Tổ quốc', category: 'commemoration', expectedRule: 'solar:8:19:start=2005', status: 'approved' },
  { id: 'international-older-persons-day', title: 'Ngày Quốc tế Người cao tuổi', category: 'international', expectedRule: 'solar:10:1:start=1991', status: 'approved' },
  { id: 'vietnam-digital-transformation-day', title: 'Ngày Chuyển đổi số quốc gia', category: 'commemoration', expectedRule: 'solar:10:10:start=2022', status: 'approved' },
  { id: 'vietnam-entrepreneurs-day', title: 'Ngày Doanh nhân Việt Nam', category: 'commemoration', expectedRule: 'solar:10:13:start=2004', status: 'approved' },
  { id: 'vietnam-farmers-union-founding-day', title: 'Ngày thành lập Hội Nông dân Việt Nam', category: 'commemoration', expectedRule: 'solar:10:14:start=1991', status: 'approved' },
  { id: 'vietnam-population-day', title: 'Ngày Dân số Việt Nam', category: 'commemoration', expectedRule: 'solar:12:26:start=1997', status: 'approved' },
  { id: 'vietnam-trade-union-traditional-day', title: 'Ngày thành lập Công đoàn Việt Nam', category: 'commemoration', expectedRule: 'solar:7:28:start=1983', status: 'approved' },
  { id: 'world-health-day', title: 'Ngày Sức khỏe Thế giới', category: 'international', expectedRule: 'solar:4:7:start=1950', status: 'approved' },
  { id: 'international-day-of-happiness', title: 'Ngày Quốc tế Hạnh phúc', category: 'international', expectedRule: 'solar:3:20:start=2013', status: 'approved' },
  { id: 'earth-day', title: 'Ngày Trái Đất', category: 'international', expectedRule: 'solar:4:22:start=1970', status: 'approved' },
  { id: 'world-blood-donor-day', title: 'Ngày Hiến máu Thế giới', category: 'international', expectedRule: 'solar:6:14:start=2004', status: 'approved' },
  { id: 'world-population-day', title: 'Ngày Dân số Thế giới', category: 'international', expectedRule: 'solar:7:11:start=1990', status: 'approved' },
  { id: 'international-youth-day', title: 'Ngày Quốc tế Thanh niên', category: 'international', expectedRule: 'solar:8:12:start=2000', status: 'approved' },
  { id: 'international-day-of-persons-with-disabilities', title: 'Ngày Quốc tế Người khuyết tật', category: 'international', expectedRule: 'solar:12:3:start=1992', status: 'approved' },
  { id: 'international-volunteer-day', title: 'Ngày Tình nguyện viên Quốc tế', category: 'international', expectedRule: 'solar:12:5:start=1985', status: 'approved' },
  { id: 'vietnam-cultural-heritage-day', title: 'Ngày Di sản văn hóa Việt Nam', category: 'commemoration', expectedRule: 'solar:11:23:start=2005', status: 'approved' },
  { id: 'vietnam-fire-safety-day-legacy', title: 'Ngày phòng cháy, chữa cháy toàn dân', category: 'commemoration', expectedRule: 'solar:10:4:start=2000:end=2000', status: 'approved' },
  { id: 'vietnam-national-fire-prevention-day', title: 'Ngày toàn dân phòng cháy và chữa cháy', category: 'commemoration', expectedRule: 'solar:10:4:start=2001:end=2024', status: 'approved' },
  { id: 'vietnam-fire-rescue-day', title: 'Ngày toàn dân phòng cháy, chữa cháy, cứu nạn, cứu hộ', category: 'commemoration', expectedRule: 'solar:10:4:start=2025', status: 'approved' },
  { id: 'vietnam-anti-drug-day', title: 'Ngày Toàn dân phòng, chống ma túy', category: 'commemoration', expectedRule: 'solar:6:26:start=2001', status: 'approved' },
  { id: 'vietnam-voluntary-blood-donation-day', title: 'Ngày Toàn dân hiến máu tình nguyện', category: 'commemoration', expectedRule: 'solar:4:7:start=2000', status: 'approved' },
  { id: 'vietnam-poetry-day', title: 'Ngày Thơ Việt Nam', category: 'commemoration', expectedRule: 'lunar:1:15:regular_only:start=2003', status: 'approved' },
  { id: 'mothers-day', title: 'Ngày của Mẹ', category: 'international', expectedRule: 'weekday_rule:5:0:2', status: 'approved' },
  { id: 'fathers-day', title: 'Ngày của Cha', category: 'international', expectedRule: 'weekday_rule:6:0:3', status: 'approved' },
  { id: 'lunar-new-year-day-2', title: 'Mùng 2 Tết Nguyên đán', category: 'traditional', expectedRule: 'lunar:1:2:regular_only', status: 'approved', occasionKey: 'lunar-new-year' },
  { id: 'lunar-new-year-day-3', title: 'Mùng 3 Tết Nguyên đán', category: 'traditional', expectedRule: 'lunar:1:3:regular_only', status: 'approved', occasionKey: 'lunar-new-year' },
  { id: 'vietnam-womens-union-founding-day', title: 'Ngày thành lập Hội Liên hiệp Phụ nữ Việt Nam', category: 'commemoration', expectedRule: 'solar:10:20:start=2000:end=2009', status: 'approved', occasionKey: 'vietnam-womens-day' },
  { id: 'vietnam-national-health-day', title: 'Ngày Sức khỏe toàn dân', category: 'commemoration', expectedRule: 'solar:4:7:start=2026', status: 'approved' },
  { id: 'vietnam-ethnic-cultures-day', title: 'Ngày Văn hóa các dân tộc Việt Nam', category: 'commemoration', expectedRule: 'solar:4:19:start=2009', status: 'approved' },
  { id: 'vietnam-social-work-day', title: 'Ngày Công tác xã hội Việt Nam', category: 'commemoration', expectedRule: 'solar:3:25:start=2017', status: 'approved' },
  { id: 'vietnam-youth-federation-day', title: 'Ngày truyền thống Hội Liên hiệp Thanh niên Việt Nam', category: 'commemoration', expectedRule: 'solar:10:15:start=1956', status: 'approved' },
  { id: 'vietnam-lawyers-traditional-day', title: 'Ngày truyền thống Luật sư Việt Nam', category: 'commemoration', expectedRule: 'solar:10:10:start=2013', status: 'approved' },
  { id: 'vietnam-overseas-vietnamese-language-day', title: 'Ngày Tôn vinh tiếng Việt trong cộng đồng người Việt Nam ở nước ngoài', category: 'commemoration', expectedRule: 'solar:9:8:start=2023', status: 'approved' },
  { id: 'vietnam-veterans-association-founding-day', title: 'Ngày thành lập Hội Cựu chiến binh Việt Nam', category: 'commemoration', expectedRule: 'solar:12:6:start=1989', status: 'approved' },
  { id: 'vietnam-national-defense-day', title: 'Ngày hội Quốc phòng toàn dân', category: 'commemoration', expectedRule: 'solar:12:22:start=1989', status: 'approved' },
  { id: 'vietnam-mttq-traditional-day', title: 'Ngày truyền thống Mặt trận Tổ quốc Việt Nam', category: 'commemoration', expectedRule: 'solar:11:18:start=1986', status: 'approved' },
  { id: 'world-tuberculosis-day', title: 'Ngày Thế giới phòng, chống lao', category: 'international', expectedRule: 'solar:3:24:start=1982', status: 'approved' },
  { id: 'april-fools-day', title: 'Cá tháng Tư', category: 'international', expectedRule: 'solar:4:1', status: 'approved' },
  { id: 'international-nurses-day', title: 'Ngày Quốc tế Điều dưỡng', category: 'international', expectedRule: 'solar:5:12:start=1965', status: 'approved' },
  { id: 'international-day-of-families', title: 'Ngày Quốc tế Gia đình', category: 'international', expectedRule: 'solar:5:15:start=1994', status: 'approved' },
  { id: 'world-no-tobacco-day', title: 'Ngày Thế giới không thuốc lá', category: 'international', expectedRule: 'solar:5:31:start=1989', status: 'approved' },
  { id: 'international-day-against-drug-abuse', title: 'Ngày Quốc tế phòng, chống ma túy', category: 'international', expectedRule: 'solar:6:26:start=1988', status: 'approved' },
  { id: 'world-food-day', title: 'Ngày Lương thực Thế giới', category: 'international', expectedRule: 'solar:10:16:start=1981', status: 'approved' },
  { id: 'international-mens-day', title: 'Ngày Quốc tế Nam giới', category: 'international', expectedRule: 'solar:11:19:start=1999', status: 'approved' },
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
  { id: 'consumer-rights-observance', priority: 'P0', status: 'approved', eventIds: ['vietnam-consumer-rights-day'], referenceUrls: [
    'https://vanban.chinhphu.vn/default.aspx?docid=180513&pageid=27160',
    'https://moit.gov.vn/tin-tuc/hoat-dong/bo-cong-thuong-ban-hanh-ke-hoach-to-chuc-ngay-quyen-nguoi-ti2.html',
  ] },
  { id: 'all-people-border-observance', priority: 'P0', status: 'approved', eventIds: ['vietnam-all-people-border-day-legacy', 'vietnam-all-people-border-day'], referenceUrls: [], referenceUrlsByEventId: {
    'vietnam-all-people-border-day-legacy': [
      'https://chinhphu.vn/default.aspx?docid=4364&pageid=27160',
      'https://chinhphu.vn/default.aspx?docid=93588&pageid=27160',
    ],
    'vietnam-all-people-border-day': [
      'https://tiengchuong.chinhphu.vn/nhieu-hoat-dong-ky-niem-60-nam-ngay-truyen-thong-bo-doi-bien-phong-11327668.htm',
    ],
  } },
  { id: 'vietnam-cultural-heritage-observance', priority: 'P0', status: 'approved', eventIds: ['vietnam-cultural-heritage-day'], referenceUrls: [
    'https://dsvh.gov.vn/quyet-dinh-cua-thu-tuong-chinh-phu-ve-%E2%80%9Cngay-di-san-van-hoa-viet-nam%E2%80%9D-1668',
    'https://vanban.chinhphu.vn/default.aspx?docid=477&pageid=27160',
  ] },
  { id: 'fire-safety-observance', priority: 'P0', status: 'approved', eventIds: ['vietnam-fire-safety-day-legacy', 'vietnam-national-fire-prevention-day', 'vietnam-fire-rescue-day'], referenceUrls: [], referenceUrlsByEventId: {
    'vietnam-fire-safety-day-legacy': ['https://vanban.chinhphu.vn/default.aspx?docid=3211&pageid=27160'],
    'vietnam-national-fire-prevention-day': ['https://vanban.chinhphu.vn/?docid=80179&pageid=27160'],
    'vietnam-fire-rescue-day': ['https://vanban.chinhphu.vn/?classid=1&docid=212483&pageid=27160&typegroupid=3'],
  } },
  { id: 'anti-drug-day-observance', priority: 'P0', status: 'approved', eventIds: ['vietnam-anti-drug-day'], referenceUrls: [
    'https://chinhphu.vn/default.aspx?docid=9124&pageid=27160',
  ] },
  { id: 'international-day-of-peace-observance', priority: 'P1', status: 'approved', eventIds: ['international-day-of-peace-2000', 'international-day-of-peace-2001', 'international-day-of-peace'], referenceUrls: [], referenceUrlsByEventId: {
    'international-day-of-peace-2000': ['https://www.un.org/en/peaceandsecurity/the-history-of-the-international-day-of-peace'],
    'international-day-of-peace-2001': ['https://www.un.org/en/peaceandsecurity/the-history-of-the-international-day-of-peace'],
    'international-day-of-peace': ['https://digitallibrary.un.org/record/447991'],
  } },
  { id: 'voluntary-blood-donation-day-observance', priority: 'P1', status: 'approved', eventIds: ['vietnam-voluntary-blood-donation-day'], referenceUrls: [
    'https://vienhuyethoc.vn/22-nam-ngay-toan-dan-hien-mau-tinh-nguyen-7-4/',
  ] },
  { id: 'vietnam-poetry-day-observance', priority: 'P1', status: 'approved', eventIds: ['vietnam-poetry-day'], referenceUrls: [
    'https://vanvn.vn/ngay-xuan-tray-hoi-thi-ca/',
  ] },
  { id: 'vietnam-national-health-day-observance', priority: 'P0', status: 'approved', eventIds: ['vietnam-national-health-day'], referenceUrls: ['https://baochinhphu.vn/nghi-quyet-cua-bo-chinh-tri-ve-mot-so-giai-phap-dot-pha-tang-cuong-bao-ve-cham-soc-va-nang-cao-suc-khoe-nhan-dan-10225091200201604.htm', 'https://baochinhphu.vn/ngay-suc-khoe-toan-dan-2026-lay-phong-benh-lam-trong-tam-102260405103933858.htm'] },
  { id: 'vietnam-ethnic-cultures-day-observance', priority: 'P0', status: 'approved', eventIds: ['vietnam-ethnic-cultures-day'], referenceUrls: ['https://langvanhoavietnam.vn/qua-trinh-hinh-thanh-va-phat-trien/'] },
  { id: 'vietnam-social-work-day-observance', priority: 'P1', status: 'approved', eventIds: ['vietnam-social-work-day'], referenceUrls: ['https://vanban.chinhphu.vn/default.aspx?docid=186399&pageid=27160'] },
  { id: 'vietnam-youth-federation-day-observance', priority: 'P0', status: 'approved', eventIds: ['vietnam-youth-federation-day'], referenceUrls: ['https://baochinhphu.vn/ky-niem-55-nam-ngay-truyen-thong-hoi-lien-hiep-thanh-nien-viet-nam-102106013.htm'] },
  { id: 'vietnam-lawyers-day-observance', priority: 'P1', status: 'approved', eventIds: ['vietnam-lawyers-traditional-day'], referenceUrls: ['https://baochinhphu.vn/10-10-la-ngay-truyen-thong-cua-luat-su-viet-nam-102137265.htm'] },
  { id: 'vietnam-overseas-vietnamese-language-day-observance', priority: 'P1', status: 'approved', eventIds: ['vietnam-overseas-vietnamese-language-day'], referenceUrls: ['https://vanban.chinhphu.vn/?classid=2&docid=206314&pageid=27160', 'https://baochinhphu.vn/8-9-la-ngay-ton-vinh-tieng-viet-trong-cong-dong-nguoi-viet-nam-o-nuoc-ngoai-10222080317153996.htm'] },
  { id: 'vietnam-veterans-association-day-observance', priority: 'P0', status: 'approved', eventIds: ['vietnam-veterans-association-founding-day'], referenceUrls: ['https://www.hoiccbvietnam.vn/lich-su-truyen-thong-pa15.html'] },
  { id: 'vietnam-national-defense-day-observance', priority: 'P0', status: 'approved', eventIds: ['vietnam-national-defense-day'], referenceUrls: ['https://btllang.mod.gov.vn/tin-tuc/tin-tong-hop/15323-de-cuong-tuyen-truyen-80-nam-ngay-thanh-lap-quan-doi-nhan-dan-viet-nam-va-35-nam-ngay-hoi-quoc-phong-toan-dan.html'] },
  { id: 'vietnam-mttq-traditional-day-observance', priority: 'P0', status: 'approved', eventIds: ['vietnam-mttq-traditional-day'], referenceUrls: ['https://m.mattran.org.vn/van-ban-huong-dan/ngay-1811-duoc-lay-lam-ngay-ky-niem-thanh-lap-mat-tran-dan-toc-thong-nhat-viet-nam-tu-khi-nao-10575.html'] },
  { id: 'world-tuberculosis-day-observance', priority: 'P1', status: 'approved', eventIds: ['world-tuberculosis-day'], referenceUrls: ['https://www.who.int/campaigns/world-tb-day'] },
  { id: 'international-nurses-day-observance', priority: 'P1', status: 'approved', eventIds: ['international-nurses-day'], referenceUrls: ['https://icn.ch/how-we-do-it/campaigns/international-nurses-day'] },
  { id: 'international-families-day-observance', priority: 'P1', status: 'approved', eventIds: ['international-day-of-families'], referenceUrls: ['https://www.un.org/en/observances/international-day-families'] },
  { id: 'world-no-tobacco-day-observance', priority: 'P1', status: 'approved', eventIds: ['world-no-tobacco-day'], referenceUrls: ['https://www.who.int/campaigns/world-no-tobacco-day'] },
  { id: 'international-drug-day-observance', priority: 'P1', status: 'approved', eventIds: ['international-day-against-drug-abuse'], referenceUrls: ['https://www.un.org/en/observances/end-drug-abuse-day'] },
  { id: 'world-food-day-observance', priority: 'P1', status: 'approved', eventIds: ['world-food-day'], referenceUrls: ['https://www.fao.org/world-food-day/en'] },
]

function actualRule(event: (typeof VERIFIED_EVENTS)[number]): string {
  const rule = event.rule
  switch (rule.type) {
    case 'solar_fixed': return `solar:${rule.month}:${rule.day}${rule.startYear === undefined ? '' : `:start=${rule.startYear}`}${rule.endYear === undefined ? '' : `:end=${rule.endYear}`}`
    case 'lunar_fixed': return `lunar:${rule.month}:${rule.day}:${rule.leapMonthPolicy}${rule.startYear === undefined ? '' : `:start=${rule.startYear}`}${rule.endYear === undefined ? '' : `:end=${rule.endYear}`}`
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
      const occasionKey = candidate.occasionKey ?? candidate.id
      assert.ok(previous === undefined || previous === occasionKey, `Alias "${alias}" collides between ${previous} and ${occasionKey}`)
      aliases.set(normalized, occasionKey)
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

test('historical source corrections retain the established start years and exact source metadata', () => {
  const eventsById = new Map(VERIFIED_EVENTS.map((event) => [event.id, event]))
  const noTobacco = eventsById.get('world-no-tobacco-day')
  const nurses = eventsById.get('international-nurses-day')
  const mothersDay = eventsById.get('mothers-day')

  assert.ok(noTobacco && nurses && mothersDay)
  assert.equal(actualRule(noTobacco), 'solar:5:31:start=1989')
  assert.match(noTobacco.details?.origin ?? '', /7\/4\/1988/)
  assert.match(noTobacco.details?.origin ?? '', /17\/5\/1989/)
  assert.equal(actualRule(nurses), 'solar:5:12:start=1965')
  assert.match(nurses.details?.origin ?? '', /năm 1965/)
  assert.doesNotMatch(nurses.details?.origin ?? '', /năm 1974/)
  assert.ok(nurses.sources.some(({ url }) => url.includes('May-1973')))
  assert.ok(nurses.sources.some(({ url }) => url.includes('nnw-timeline.html')))
  const mothersDaySource = mothersDay.sources.find(({ publisher }) => publisher === 'Hội Liên hiệp Phụ nữ Việt Nam')
  assert.equal(mothersDaySource?.title, 'Từ tuyên ngôn ‘Ngày hiền mẫu’ đến sự ra đời Ngày của mẹ')
  assert.equal(mothersDaySource?.url, 'https://www.hoilhpn.org.vn/web/guest/tin-chi-tiet/-/chi-tiet/tu-tuyen-ngon-ngay-hien-mau-%C4%91en-su-ra-%C4%91oi-ngay-cua-me-30211-1.html')
})

test('requested core event popups have non-empty researched detail beyond their card description', () => {
  const eventsById = new Map(VERIFIED_EVENTS.map((event) => [event.id, event]))
  for (const eventId of [
    'new-year-day', 'lunar-new-year-day-1', 'lunar-new-year-eve', 'ho-chi-minh-birthday',
    'vietnam-science-technology-day', 'vietnam-science-technology-innovation-day', 'vietnam-culture-day',
    'vietnam-peoples-army-day', 'national-resistance-day',
  ]) {
    const event = eventsById.get(eventId)
    assert.ok(event?.details, `${eventId} needs popup detail`)
    const detailText = [event.details.origin, event.details.significance, event.details.customs]
      .filter((value): value is string => value !== undefined)
    assert.ok(detailText.length > 0)
    assert.ok(detailText.every((text) => text.trim() !== event.description.trim()), `${eventId} repeats its description as detail`)
  }
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
  assert.equal(REFERENCE_CANDIDATES.filter(({ priority }) => priority === 'P0').length, 16)
  assert.equal(REFERENCE_CANDIDATES.filter(({ priority }) => priority === 'P1').length, 17)
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
