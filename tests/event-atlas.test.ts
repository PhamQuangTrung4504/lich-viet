import assert from 'node:assert/strict'
import test from 'node:test'
import { createCivilDate, civilDateToJulianDayNumber, julianDayNumberToCivilDate } from '../src/calendar/core.ts'
import { findEventsForDate } from '../src/events/engine.ts'
import { VERIFIED_EVENTS } from '../src/events/data.ts'

type AtlasStatus = 'approved' | 'under_review' | 'out_of_scope'
type AtlasPriority = 'P0' | 'P1' | 'P2'
type AtlasCandidate = {
  readonly id: string
  readonly title: string
  readonly aliases: readonly string[]
  readonly group: 'official' | 'historical' | 'organization' | 'traditional' | 'social' | 'international' | 'seasonal'
  readonly priority: AtlasPriority
  readonly expectedRule: string
  readonly eventRuleOverrides?: Readonly<Record<string, string>>
  readonly scope: string
  readonly effectiveRange: string
  readonly sourceUrls: readonly string[]
  readonly status: AtlasStatus
  readonly eventIds: readonly string[]
  readonly reviewReason?: string
}

// This inventory is compiled from laws, government/organization histories and
  // UN/WHO sources. It is deliberately separate from VERIFIED_EVENTS: the
  // entries record researched observances, including candidates not released.
const VIETNAM_EVENT_ATLAS: readonly AtlasCandidate[] = [
  { id: 'gregorian-new-year', title: 'Tết Dương lịch', aliases: ['Tết Tây'], group: 'official', priority: 'P0', expectedRule: 'solar:1:1', scope: 'Toàn quốc; ngày nghỉ lễ theo luật Việt Nam', effectiveRange: 'Ngày nghỉ lễ theo Bộ luật Lao động hiện hành', sourceUrls: ['https://vanban.chinhphu.vn/?docid=198540&pageid=27160'], status: 'approved', eventIds: ['new-year-day'] },
  { id: 'lunar-new-year', title: 'Mùng 1 Tết Nguyên đán', aliases: ['Mùng Một Tết'], group: 'official', priority: 'P0', expectedRule: 'lunar:1:1:regular_only', scope: 'Toàn quốc; ngày nghỉ lễ, ngày âm tháng thường', effectiveRange: 'Ngày nghỉ lễ theo Bộ luật Lao động hiện hành', sourceUrls: ['https://vanban.chinhphu.vn/?docid=198540&pageid=27160'], status: 'approved', eventIds: ['lunar-new-year-day-1'] },
  { id: 'hung-kings-day', title: 'Giỗ Tổ Hùng Vương', aliases: [], group: 'official', priority: 'P0', expectedRule: 'lunar:3:10:regular_only', scope: 'Toàn quốc; ngày nghỉ lễ và tín ngưỡng thờ cúng Hùng Vương', effectiveRange: 'Ngày nghỉ lễ theo Bộ luật Lao động hiện hành', sourceUrls: ['https://vanban.chinhphu.vn/?docid=198540&pageid=27160', 'https://baochinhphu.vn/huong-ve-coi-nguon-nho-ngay-quoc-le-gio-to-hung-vuong-mung-10-thang-3-am-lich-10266106.htm'], status: 'approved', eventIds: ['hung-kings-day'] },
  { id: 'reunification-day', title: 'Ngày Giải phóng miền Nam, thống nhất đất nước', aliases: ['Ngày 30/4'], group: 'official', priority: 'P0', expectedRule: 'solar:4:30', scope: 'Toàn quốc; ngày nghỉ lễ theo luật Việt Nam', effectiveRange: 'Ngày nghỉ lễ theo Bộ luật Lao động hiện hành', sourceUrls: ['https://vanban.chinhphu.vn/?docid=198540&pageid=27160'], status: 'approved', eventIds: ['reunification-day'] },
  { id: 'international-workers-day', title: 'Ngày Quốc tế Lao động', aliases: ['Ngày 1/5'], group: 'official', priority: 'P0', expectedRule: 'solar:5:1', scope: 'Toàn quốc; ngày nghỉ lễ theo luật Việt Nam', effectiveRange: 'Ngày nghỉ lễ theo Bộ luật Lao động hiện hành', sourceUrls: ['https://vanban.chinhphu.vn/?docid=198540&pageid=27160'], status: 'approved', eventIds: ['international-workers-day'] },
  { id: 'national-day', title: 'Quốc khánh Việt Nam', aliases: ['Ngày Quốc khánh 2/9'], group: 'official', priority: 'P0', expectedRule: 'solar:9:2', scope: 'Toàn quốc; ngày nghỉ lễ theo luật Việt Nam', effectiveRange: 'Ngày nghỉ lễ theo Bộ luật Lao động hiện hành', sourceUrls: ['https://vanban.chinhphu.vn/?docid=198540&pageid=27160'], status: 'approved', eventIds: ['national-day'] },
  { id: 'vietnam-culture-day', title: 'Ngày Văn hóa Việt Nam', aliases: [], group: 'official', priority: 'P0', expectedRule: 'solar:11:24:start=2026', scope: 'Toàn quốc; ngày nghỉ lễ có hiệu lực từ 2026', effectiveRange: 'Từ khi Nghị quyết 28/2026/QH16 có hiệu lực', sourceUrls: ['https://vanban.chinhphu.vn/?docid=218008&pageid=27160'], status: 'approved', eventIds: ['vietnam-culture-day'] },
  { id: 'nguyen-tieu', title: 'Tết Nguyên tiêu (Rằm tháng Giêng)', aliases: ['Tết Thượng Nguyên', 'Rằm tháng Giêng'], group: 'traditional', priority: 'P1', expectedRule: 'lunar:1:15:regular_only', scope: 'Phong tục và lễ tiết văn hóa; hoạt động khác nhau theo địa phương, không phải ngày nghỉ', effectiveRange: 'Lặp theo tháng Giêng âm lịch thường', sourceUrls: ['https://baochinhphu.vn/mua-xuan-va-tet-nguyen-tieu-102138919.htm', 'https://hoianheritage.net/uploads/download/files/ban-tin-01-2023.pdf'], status: 'approved', eventIds: ['nguyen-tieu'] },
  { id: 'vesak', title: 'Lễ Phật đản', aliases: ['Phật Đản'], group: 'traditional', priority: 'P1', expectedRule: 'lunar:4:15:regular_only', scope: 'Lễ Phật giáo; cách cử hành có thể khác theo truyền thống', effectiveRange: 'Ngày Rằm tháng Tư âm lịch theo lịch dùng trong dữ liệu', sourceUrls: ['https://btgcp.gov.vn/pages/detail/1/Doi-net-ve-dao-Phat-va-Giao-hoi-Phat-giao-Viet-Nam.html'], status: 'approved', eventIds: ['vesak'] },
  { id: 'vu-lan', title: 'Lễ Vu Lan', aliases: ['Vu Lan báo hiếu'], group: 'traditional', priority: 'P1', expectedRule: 'lunar:7:15:regular_only', scope: 'Lễ Phật giáo vào Rằm tháng Bảy; cùng ngày với Tết Trung Nguyên nhưng khác truyền thống', effectiveRange: 'Lặp theo tháng Bảy âm lịch thường', sourceUrls: ['https://scov.gov.vn/ban-sac-van-hoa/gioi-thieu-ban-sac-van-hoa/y-nghia-cua-ngay-le-vu-lan-va-phap-bo-thi-cua-phat-giao.html'], status: 'approved', eventIds: ['vu-lan'] },
  { id: 'trung-nguyen', title: 'Tết Trung Nguyên', aliases: [], group: 'traditional', priority: 'P1', expectedRule: 'lunar:7:15:regular_only', scope: 'Tiết lễ Đạo giáo và tập tục dân gian; không đồng nhất với Vu Lan', effectiveRange: 'Lặp theo tháng Bảy âm lịch thường', sourceUrls: ['https://archives.org.vn/gioi-thieu-tai-lieu-nghiep-vu/tet-trung-nguyen-vu-lan-xa-toi-vog-nhan-nguon-goc-va-tam-thuc-dan-gian-viet.htm'], status: 'approved', eventIds: ['trung-nguyen'] },
  { id: 'that-tich', title: 'Thất Tịch (Lễ Ngâu)', aliases: ['Lễ Ngâu'], group: 'traditional', priority: 'P1', expectedRule: 'lunar:7:7:regular_only', scope: 'Ngày theo lịch âm và truyền thuyết dân gian; tập tục không phải lễ nghỉ toàn quốc', effectiveRange: 'Lặp theo tháng Bảy âm lịch thường', sourceUrls: ['https://vtv.vn/doi-song/nguon-goc-va-y-nghia-cua-le-that-tich-2021081414364009.htm', 'https://vov.vn/doi-song/that-tich-2026-la-ngay-nao-thu-may-post1324704.vov'], status: 'approved', eventIds: ['that-tich'] },
  { id: 'mid-autumn-festival', title: 'Tết Trung thu', aliases: ['Tết Trông Trăng', 'Tết Đoàn Viên'], group: 'traditional', priority: 'P1', expectedRule: 'lunar:8:15:regular_only', scope: 'Lễ tiết phổ biến gắn với gia đình và trẻ em; tập tục tùy nơi', effectiveRange: 'Lặp theo tháng Tám âm lịch thường', sourceUrls: ['https://scov.gov.vn/cong-tac-doi-ngoai/ngoai-giao-van-hoa/nguon-goc-va-y-nghia-cua-ram-trung-thu-trong-van-hoa-viet.html'], status: 'approved', eventIds: ['mid-autumn-festival'] },
  { id: 'students-day', title: 'Ngày truyền thống Học sinh, Sinh viên Việt Nam', aliases: ['Ngày truyền thống Học sinh, Sinh viên và Hội Sinh viên Việt Nam'], group: 'historical', priority: 'P1', expectedRule: 'solar:1:9:start=1950', scope: 'Toàn quốc; ngày truyền thống của phong trào và Hội Sinh viên', effectiveRange: 'Từ mốc kỷ niệm năm 1950', sourceUrls: ['https://tphcm.chinhphu.vn/tuyen-duong-396-hoc-sinh-sinh-vien-tieu-bieu-nam-2021-101220107083915689.htm'], status: 'approved', eventIds: ['vietnam-students-day'] },
  { id: 'border-guard-traditional-day', title: 'Ngày truyền thống Bộ đội Biên phòng', aliases: ['Ngày truyền thống BĐBP'], group: 'organization', priority: 'P0', expectedRule: 'solar:3:3:start=1959', scope: 'Toàn quốc; lực lượng Bộ đội Biên phòng', effectiveRange: 'Từ ngày thành lập lực lượng năm 1959', sourceUrls: ['https://tiengchuong.chinhphu.vn/nhieu-hoat-dong-ky-niem-60-nam-ngay-truyen-thong-bo-doi-bien-phong-11327668.htm'], status: 'approved', eventIds: ['vietnam-border-guard-traditional-day'] },
  { id: 'all-people-border-day', title: 'Ngày Biên phòng toàn dân', aliases: ['Ngày Biên phòng (tên đến hết 2003)'], group: 'official', priority: 'P0', expectedRule: 'solar:3:3:start=2004', eventRuleOverrides: { 'vietnam-all-people-border-day-legacy': 'solar:3:3:start=2000:end=2003' }, scope: 'Toàn quốc; vận động trách nhiệm cộng đồng về biên giới', effectiveRange: 'Ngày Biên phòng được chọn năm 1989; tên theo Luật Biên giới quốc gia có hiệu lực 1/1/2004', sourceUrls: ['https://chinhphu.vn/default.aspx?docid=4364&pageid=27160', 'https://chinhphu.vn/default.aspx?docid=93588&pageid=27160'], status: 'approved', eventIds: ['vietnam-all-people-border-day-legacy', 'vietnam-all-people-border-day'] },
  { id: 'consumer-rights-day', title: 'Ngày Quyền của người tiêu dùng Việt Nam', aliases: [], group: 'official', priority: 'P0', expectedRule: 'solar:3:15:start=2016', scope: 'Toàn quốc; không phải ngày nghỉ lễ', effectiveRange: 'Quyết định 1035/QĐ-TTg ban hành năm 2015; các địa phương đồng loạt tổ chức từ 2016', sourceUrls: ['https://vanban.chinhphu.vn/default.aspx?docid=180513&pageid=27160', 'https://moit.gov.vn/tin-tuc/hoat-dong/bo-cong-thuong-ban-hanh-ke-hoach-to-chuc-ngay-quyen-nguoi-ti2.html'], status: 'approved', eventIds: ['vietnam-consumer-rights-day'] },
  { id: 'sports-day', title: 'Ngày Thể thao Việt Nam', aliases: [], group: 'official', priority: 'P0', expectedRule: 'solar:3:27:start=1991', scope: 'Toàn quốc; ngày kỷ niệm thể thao, không phải ngày nghỉ', effectiveRange: 'Quyết định 25/CT năm 1991', sourceUrls: ['https://chinhphu.vn/default.aspx?docid=1311&pageid=27160'], status: 'approved', eventIds: ['vietnam-sports-day'] },
  { id: 'militia-self-defense-day', title: 'Ngày truyền thống Dân quân tự vệ Việt Nam', aliases: [], group: 'organization', priority: 'P0', expectedRule: 'solar:3:28:start=1935', scope: 'Toàn quốc; lực lượng Dân quân tự vệ', effectiveRange: 'Từ nghị quyết ngày 28/3/1935', sourceUrls: ['https://vpctn.gov.vn/tin-tuc-su-kien/chu-tich-nuoc-luong-cuong-du-le-ky-niem-90-nam-ngay-truyen-thong-dan-quan-tu-ve-viet-nam.html'], status: 'approved', eventIds: ['vietnam-militia-self-defense-day'] },
  { id: 'vietnam-disability-day', title: 'Ngày Người khuyết tật Việt Nam', aliases: [], group: 'official', priority: 'P0', expectedRule: 'solar:4:18:start=2011', scope: 'Toàn quốc; ngày theo Điều 11 Luật Người khuyết tật', effectiveRange: 'Từ khi Luật 51/2010/QH12 có hiệu lực năm 2011', sourceUrls: ['https://chinhphu.vn/default.aspx?docid=96045&pageid=27160'], status: 'approved', eventIds: ['vietnam-persons-with-disabilities-day'] },
  { id: 'international-red-cross-day', title: 'Ngày Chữ thập đỏ và Trăng lưỡi liềm đỏ quốc tế', aliases: ['Ngày Chữ thập đỏ quốc tế (tên gọi trước 1984)'], group: 'international', priority: 'P1', expectedRule: 'solar:5:8:start=1984', scope: 'Quốc tế; phong trào Chữ thập đỏ/Trăng lưỡi liềm đỏ', effectiveRange: 'Lễ kỷ niệm từ 1948; tên hiện hành từ 1984', sourceUrls: ['https://redcross.org.vn/wp-content/uploads/2023/10/cuong-tuyen-truyen-thang-nhan-dao2020-final3.pdf'], status: 'approved', eventIds: ['international-red-cross-day'] },
  { id: 'young-pioneers-founding-day', title: 'Ngày thành lập Đội Thiếu niên Tiền phong Hồ Chí Minh', aliases: [], group: 'organization', priority: 'P1', expectedRule: 'solar:5:15:start=1941', scope: 'Toàn quốc; tổ chức thiếu nhi', effectiveRange: 'Từ ngày thành lập tổ chức tiền thân năm 1941', sourceUrls: ['https://thieunhivietnam.vn/pic/FileLibrary/CHUAN-Dieu-le-Doi.pdf'], status: 'approved', eventIds: ['vietnam-young-pioneers-founding-day'] },
  { id: 'older-persons-traditional-day', title: 'Ngày truyền thống Người cao tuổi Việt Nam', aliases: [], group: 'official', priority: 'P0', expectedRule: 'solar:6:6:start=2006', scope: 'Toàn quốc; ngày truyền thống và vận động chăm sóc người cao tuổi', effectiveRange: 'Quyết định 772/QĐ-TTg năm 2006', sourceUrls: ['https://baochinhphu.vn/ngay-6-6-ngay-truyen-thong-nguoi-cao-tuoi-viet-nam-10217643.htm'], status: 'approved', eventIds: ['vietnam-older-persons-traditional-day'] },
  { id: 'health-insurance-day', title: 'Ngày Bảo hiểm y tế Việt Nam', aliases: [], group: 'official', priority: 'P0', expectedRule: 'solar:7:1:start=2009', scope: 'Toàn quốc; truyền thông chính sách bảo hiểm y tế', effectiveRange: 'Quyết định 823/QĐ-TTg năm 2009', sourceUrls: ['https://vanban.chinhphu.vn/default.aspx?docid=88082&pageid=27160'], status: 'approved', eventIds: ['vietnam-health-insurance-day'] },
  { id: 'agent-orange-victims-day', title: 'Ngày Vì nạn nhân chất độc da cam Việt Nam', aliases: ['Ngày Vì nạn nhân chất độc da cam/dioxin'], group: 'social', priority: 'P1', expectedRule: 'solar:8:10:start=2004', scope: 'Toàn quốc; hoạt động nhân đạo và ghi nhận nạn nhân', effectiveRange: 'Ngày được xác lập năm 2004', sourceUrls: ['https://baochinhphu.vn/chung-tay-xoa-diu-noi-dau-da-cam-10235986.htm'], status: 'approved', eventIds: ['vietnam-agent-orange-victims-day'] },
  { id: 'public-security-traditional-day', title: 'Ngày truyền thống Công an nhân dân Việt Nam', aliases: [], group: 'organization', priority: 'P0', expectedRule: 'solar:8:19:start=1945', scope: 'Toàn quốc; lực lượng Công an nhân dân', effectiveRange: 'Từ mốc truyền thống 19/8/1945', sourceUrls: ['https://chinhphu.vn/?docid=210005&pageid=27160'], status: 'approved', eventIds: ['vietnam-public-security-traditional-day'] },
  { id: 'all-people-national-security-day', title: 'Ngày hội toàn dân bảo vệ an ninh Tổ quốc', aliases: [], group: 'official', priority: 'P0', expectedRule: 'solar:8:19:start=2005', scope: 'Toàn quốc; ngày hội vận động cộng đồng', effectiveRange: 'Từ năm 2005', sourceUrls: ['https://chinhphu.vn/?docid=210005&pageid=27160'], status: 'approved', eventIds: ['vietnam-all-people-national-security-day'] },
  { id: 'international-older-persons-day', title: 'Ngày Quốc tế Người cao tuổi', aliases: [], group: 'international', priority: 'P1', expectedRule: 'solar:10:1:start=1991', scope: 'Quốc tế; observance của Liên Hợp Quốc', effectiveRange: 'Kỷ niệm từ năm 1991', sourceUrls: ['https://www.un.org/en/observances/older-persons-day'], status: 'approved', eventIds: ['international-older-persons-day'] },
  { id: 'digital-transformation-day', title: 'Ngày Chuyển đổi số quốc gia', aliases: [], group: 'official', priority: 'P0', expectedRule: 'solar:10:10:start=2022', scope: 'Toàn quốc; hoạt động theo kế hoạch cơ quan và địa phương', effectiveRange: 'Quyết định 505/QĐ-TTg năm 2022', sourceUrls: ['https://datafiles.chinhphu.vn/cpp/files/vbpq/2022/04/505-ttg.signed.pdf'], status: 'approved', eventIds: ['vietnam-digital-transformation-day'] },
  { id: 'entrepreneurs-day', title: 'Ngày Doanh nhân Việt Nam', aliases: [], group: 'official', priority: 'P0', expectedRule: 'solar:10:13:start=2004', scope: 'Toàn quốc; ngày tôn vinh cộng đồng doanh nhân', effectiveRange: 'Quyết định 990/QĐ-TTg năm 2004', sourceUrls: ['https://chinhphu.vn/default.aspx?docid=13435&pageid=27160'], status: 'approved', eventIds: ['vietnam-entrepreneurs-day'] },
  { id: 'farmers-union-founding-day', title: 'Ngày thành lập Hội Nông dân Việt Nam', aliases: [], group: 'organization', priority: 'P0', expectedRule: 'solar:10:14:start=1991', scope: 'Toàn quốc; ngày kỷ niệm của Hội Nông dân Việt Nam', effectiveRange: 'Mốc kỷ niệm được chọn năm 1991', sourceUrls: ['https://www.hoinongdan.org.vn/gioi-thieu/tong-quan-ve-hoi-nong-dan-viet-nam-254049'], status: 'approved', eventIds: ['vietnam-farmers-union-founding-day'] },
  { id: 'vietnam-population-day', title: 'Ngày Dân số Việt Nam', aliases: [], group: 'official', priority: 'P0', expectedRule: 'solar:12:26:start=1997', scope: 'Toàn quốc; hoạt động truyền thông dân số', effectiveRange: 'Từ Quyết định 326 năm 1997', sourceUrls: ['https://vnpa.moh.gov.vn/lich-su-phat-trien/'], status: 'approved', eventIds: ['vietnam-population-day'] },
  { id: 'trade-union-day', title: 'Ngày thành lập Công đoàn Việt Nam', aliases: ['Ngày truyền thống Công đoàn Việt Nam'], group: 'organization', priority: 'P1', expectedRule: 'solar:7:28:start=1983', scope: 'Toàn quốc; ngày truyền thống tổ chức công đoàn', effectiveRange: 'Ngày 28/7/1929 được chọn làm ngày thành lập tại Đại hội Công đoàn toàn quốc lần thứ V năm 1983', sourceUrls: ['https://baochinhphu.vn/phat-bieu-cua-thu-tuong-tai-le-ky-niem-90-nam-thanh-lap-cong-doan-viet-nam-102259319.htm'], status: 'approved', eventIds: ['vietnam-trade-union-traditional-day'] },
  { id: 'world-health-day', title: 'Ngày Sức khỏe Thế giới', aliases: [], group: 'international', priority: 'P1', expectedRule: 'solar:4:7:start=1950', scope: 'Quốc tế; ngày chiến dịch y tế toàn cầu của WHO', effectiveRange: 'Ngày được thiết lập từ năm 1950, gắn với ngày WHO thành lập năm 1948', sourceUrls: ['https://www.who.int/campaigns/world-health-day/2014', 'https://iris.who.int/bitstream/handle/10665/85600/Official_record21_eng.pdf'], status: 'approved', eventIds: ['world-health-day'] },
  { id: 'international-day-of-happiness', title: 'Ngày Quốc tế Hạnh phúc', aliases: [], group: 'international', priority: 'P1', expectedRule: 'solar:3:20:start=2013', scope: 'Quốc tế; observance của Liên Hợp Quốc', effectiveRange: 'Tuyên bố năm 2012, kỷ niệm từ 2013', sourceUrls: ['https://www.un.org/en/observances/international-day-happiness'], status: 'approved', eventIds: ['international-day-of-happiness'] },
  { id: 'earth-day', title: 'Ngày Trái Đất', aliases: [], group: 'international', priority: 'P2', expectedRule: 'solar:4:22:start=1970', scope: 'Chiến dịch môi trường quốc tế; mức hưởng ứng khác nhau theo nơi', effectiveRange: 'Từ năm 1970', sourceUrls: ['https://www.earthday.org/history/'], status: 'approved', eventIds: ['earth-day'] },
  { id: 'world-blood-donor-day', title: 'Ngày Hiến máu Thế giới', aliases: [], group: 'international', priority: 'P1', expectedRule: 'solar:6:14:start=2004', scope: 'Quốc tế; ngày do WHO điều phối', effectiveRange: 'Tổ chức từ 2004, xác lập thường niên năm 2005', sourceUrls: ['https://www.who.int/westernpacific/newsroom/events/world-blood-donor-day'], status: 'approved', eventIds: ['world-blood-donor-day'] },
  { id: 'world-population-day', title: 'Ngày Dân số Thế giới', aliases: [], group: 'international', priority: 'P1', expectedRule: 'solar:7:11:start=1990', scope: 'Quốc tế; observance của Liên Hợp Quốc/UNFPA', effectiveRange: 'Kỷ niệm từ năm 1990', sourceUrls: ['https://www.unfpa.org/events/world-population-day'], status: 'approved', eventIds: ['world-population-day'] },
  { id: 'international-youth-day', title: 'Ngày Quốc tế Thanh niên', aliases: [], group: 'international', priority: 'P1', expectedRule: 'solar:8:12:start=2000', scope: 'Quốc tế; observance của Liên Hợp Quốc', effectiveRange: 'Được tuyên bố năm 1999, kỷ niệm từ 2000', sourceUrls: ['https://www.un.org/development/desa/youth/what-we-do-/international-youth-day.html'], status: 'approved', eventIds: ['international-youth-day'] },
  { id: 'international-day-of-persons-with-disabilities', title: 'Ngày Quốc tế Người khuyết tật', aliases: [], group: 'international', priority: 'P1', expectedRule: 'solar:12:3:start=1992', scope: 'Quốc tế; observance của Liên Hợp Quốc', effectiveRange: 'Từ năm 1992', sourceUrls: ['https://www.un.org/en/observances/day-of-persons-with-disabilities/'], status: 'approved', eventIds: ['international-day-of-persons-with-disabilities'] },
  { id: 'international-volunteer-day', title: 'Ngày Tình nguyện viên Quốc tế', aliases: [], group: 'international', priority: 'P2', expectedRule: 'solar:12:5:start=1985', scope: 'Quốc tế; ngày của Liên Hợp Quốc', effectiveRange: 'Từ năm 1985', sourceUrls: ['https://www.un.org/observances/volunteer-day', 'https://digitallibrary.un.org/record/113305'], status: 'approved', eventIds: ['international-volunteer-day'] },
  { id: 'international-day-of-peace', title: 'Ngày Quốc tế Hòa bình', aliases: [], group: 'international', priority: 'P1', expectedRule: 'solar:9:21:start=2002', eventRuleOverrides: { 'international-day-of-peace-2000': 'year_specific:2000-9-19', 'international-day-of-peace-2001': 'year_specific:2001-9-14' }, scope: 'Quốc tế; ngày observance của Liên Hợp Quốc', effectiveRange: 'Thứ Ba tuần thứ ba tháng 9 trước 2002; lễ tại trụ sở được dời sang 14/9 năm 2001; ngày 21/9 cố định từ 2002', sourceUrls: ['https://www.un.org/en/peaceandsecurity/the-history-of-the-international-day-of-peace', 'https://digitallibrary.un.org/record/447991'], status: 'approved', eventIds: ['international-day-of-peace-2000', 'international-day-of-peace-2001', 'international-day-of-peace'] },
  { id: 'vietnam-cultural-heritage-day', title: 'Ngày Di sản văn hóa Việt Nam', aliases: [], group: 'official', priority: 'P0', expectedRule: 'solar:11:23:start=2005', scope: 'Toàn quốc; ngày kỷ niệm văn hóa, không phải ngày nghỉ lễ', effectiveRange: 'Được chọn theo Quyết định 36/2005/QĐ-TTg; ngày trùng Sắc lệnh bảo tồn cổ tích năm 1945', sourceUrls: ['https://dsvh.gov.vn/quyet-dinh-cua-thu-tuong-chinh-phu-ve-%E2%80%9Cngay-di-san-van-hoa-viet-nam%E2%80%9D-1668', 'https://vanban.chinhphu.vn/default.aspx?docid=477&pageid=27160'], status: 'approved', eventIds: ['vietnam-cultural-heritage-day'] },
  { id: 'vietnam-fire-safety-day', title: 'Ngày Toàn dân phòng cháy, chữa cháy, cứu nạn, cứu hộ', aliases: ['Ngày phòng cháy, chữa cháy toàn dân', 'Ngày toàn dân phòng cháy và chữa cháy'], group: 'official', priority: 'P0', expectedRule: 'solar:10:4:start=2025', eventRuleOverrides: { 'vietnam-fire-safety-day-legacy': 'solar:10:4:start=2000:end=2000', 'vietnam-national-fire-prevention-day': 'solar:10:4:start=2001:end=2024' }, scope: 'Toàn quốc; ngày tuyên truyền, không phải ngày nghỉ lễ', effectiveRange: 'Mốc 4/10 từ Quyết định 369/TTg; tên theo luật 2001; bổ sung cứu nạn, cứu hộ từ khi Luật 55/2024/QH15 có hiệu lực 1/7/2025', sourceUrls: ['https://vanban.chinhphu.vn/default.aspx?docid=3211&pageid=27160', 'https://vanban.chinhphu.vn/?docid=80179&pageid=27160', 'https://vanban.chinhphu.vn/?classid=1&docid=212483&pageid=27160&typegroupid=3'], status: 'approved', eventIds: ['vietnam-fire-safety-day-legacy', 'vietnam-national-fire-prevention-day', 'vietnam-fire-rescue-day'] },
  { id: 'vietnam-anti-drug-day', title: 'Ngày Toàn dân phòng, chống ma túy', aliases: [], group: 'official', priority: 'P0', expectedRule: 'solar:6:26:start=2001', scope: 'Toàn quốc; ngày vận động phòng, chống ma túy, không phải ngày nghỉ lễ', effectiveRange: 'Quyết định 93/2001/QĐ-TTg', sourceUrls: ['https://chinhphu.vn/default.aspx?docid=9124&pageid=27160'], status: 'approved', eventIds: ['vietnam-anti-drug-day'] },
  { id: 'vietnam-voluntary-blood-donation-day', title: 'Ngày Toàn dân hiến máu tình nguyện', aliases: [], group: 'organization', priority: 'P1', expectedRule: 'solar:4:7:start=2000', scope: 'Toàn quốc; ngày vận động hiến máu tình nguyện', effectiveRange: 'Quyết định 43/2000/QĐ-TTg', sourceUrls: ['https://vienhuyethoc.vn/22-nam-ngay-toan-dan-hien-mau-tinh-nguyen-7-4/'], status: 'approved', eventIds: ['vietnam-voluntary-blood-donation-day'] },
  { id: 'vietnam-poetry-day', title: 'Ngày Thơ Việt Nam', aliases: ['Ngày thơ Nguyên tiêu'], group: 'traditional', priority: 'P1', expectedRule: 'lunar:1:15:regular_only:start=2003', scope: 'Toàn quốc; hoạt động văn hóa do Hội Nhà văn Việt Nam khởi xướng, hình thức có thể khác theo địa phương', effectiveRange: 'Tổ chức từ năm 2003 vào Rằm tháng Giêng', sourceUrls: ['https://vanvn.vn/ngay-xuan-tray-hoi-thi-ca/'], status: 'approved', eventIds: ['vietnam-poetry-day'] },
  { id: 'mothers-day', title: 'Ngày của Mẹ', aliases: [], group: 'social', priority: 'P2', expectedRule: 'weekday_rule:5:0:2', scope: 'Dịp văn hóa được một bộ phận gia đình ở Việt Nam hưởng ứng; không phải ngày truyền thống hay ngày nghỉ chính thức', effectiveRange: 'Quy tắc Chủ nhật thứ hai tháng 5 theo cách phổ biến tại Hoa Kỳ; ngày khác nhau giữa các nước', sourceUrls: ['https://baochinhphu.vn/hang-chuc-quoc-gia-mung-ngay-cua-me-102124783.htm'], status: 'approved', eventIds: ['mothers-day'] },
  { id: 'fathers-day', title: 'Ngày của Cha', aliases: [], group: 'social', priority: 'P2', expectedRule: 'weekday_rule:6:0:3', scope: 'Dịp văn hóa hiện đại được hưởng ứng không đồng đều; không phải ngày nghỉ chính thức ở Việt Nam', effectiveRange: 'Quy tắc Chủ nhật thứ ba tháng 6 phổ biến tại Việt Nam; ngày khác nhau giữa các nước', sourceUrls: ['https://vnexpress.net/mon-qua-dac-biet-cho-ngay-cua-cha-trong-thoi-dich-4295517.html'], status: 'approved', eventIds: ['fathers-day'] },
  { id: 'international-mens-day', title: 'Ngày Quốc tế Nam giới', aliases: [], group: 'social', priority: 'P2', expectedRule: 'solar:11:19:start=1999', scope: 'Ngày quốc tế được một số tổ chức và cộng đồng ở Việt Nam hưởng ứng; mức độ phổ biến không đồng đều', effectiveRange: 'Khởi xướng ngày 19/11/1999', sourceUrls: ['https://internationalmensday.com/about/history-background/', 'https://vov.vn/doi-song/vi-sao-1911-tro-thanh-ngay-quoc-te-dan-ong-dtnew-560503.vov'], status: 'approved', eventIds: ['international-mens-day'] },
  { id: 'lunar-new-year-day-2', title: 'Mùng 2 Tết Nguyên đán', aliases: [], group: 'traditional', priority: 'P0', expectedRule: 'lunar:1:2:regular_only', scope: 'Toàn quốc; ngày văn hóa trong dịp Tết, lịch nghỉ cụ thể được công bố riêng từng năm', effectiveRange: 'Lặp theo mùng 2 tháng Giêng âm lịch thường', sourceUrls: ['https://vietnamtourism.vn/index.php/about/items/2453'], status: 'approved', eventIds: ['lunar-new-year-day-2'] },
  { id: 'lunar-new-year-day-3', title: 'Mùng 3 Tết Nguyên đán', aliases: [], group: 'traditional', priority: 'P0', expectedRule: 'lunar:1:3:regular_only', scope: 'Toàn quốc; ngày văn hóa trong dịp Tết, lịch nghỉ cụ thể được công bố riêng từng năm', effectiveRange: 'Lặp theo mùng 3 tháng Giêng âm lịch thường', sourceUrls: ['https://vietnamtourism.vn/index.php/about/items/2453'], status: 'approved', eventIds: ['lunar-new-year-day-3'] },
  { id: 'vietnam-womens-day', title: 'Ngày Phụ nữ Việt Nam', aliases: [], group: 'historical', priority: 'P0', expectedRule: 'solar:10:20:start=2010', eventRuleOverrides: { 'vietnam-womens-union-founding-day': 'solar:10:20:start=2000:end=2009' }, scope: 'Toàn quốc; dịp kỷ niệm phụ nữ Việt Nam', effectiveRange: 'Tên Ngày Phụ nữ Việt Nam được công nhận năm 2010; mốc thành lập tổ chức tiền thân là 1930', sourceUrls: ['https://www.hoilhpn.org.vn/documents/253622/10806301/ST%2Bvan%2Bhoa%2Bto%2Bchuc%2BHoi%2BLHPNVN%2B-%2BB5.pdf/8d1f9aed-a9d1-4ce8-a5fc-643770a98307', 'https://baochinhphu.vn/ban-bi-thu-cong-nhan-ngay-phu-nu-viet-nam-20-10-10241714.htm'], status: 'approved', eventIds: ['vietnam-womens-union-founding-day', 'vietnamese-womens-day'] },
  { id: 'vietnam-national-health-day', title: 'Ngày Sức khỏe toàn dân', aliases: [], group: 'official', priority: 'P0', expectedRule: 'solar:4:7:start=2026', scope: 'Việt Nam; hoạt động nâng cao sức khỏe và phòng bệnh, không phải ngày nghỉ', effectiveRange: 'Từ năm 2026 theo Nghị quyết 72-NQ/TW', sourceUrls: ['https://baochinhphu.vn/nghi-quyet-cua-bo-chinh-tri-ve-mot-so-giai-phap-dot-pha-tang-cuong-bao-ve-cham-soc-va-nang-cao-suc-khoe-nhan-dan-10225091200201604.htm'], status: 'approved', eventIds: ['vietnam-national-health-day'] },
  { id: 'vietnam-ethnic-cultures-day', title: 'Ngày Văn hóa các dân tộc Việt Nam', aliases: [], group: 'official', priority: 'P0', expectedRule: 'solar:4:19:start=2009', scope: 'Toàn quốc; giao lưu, tôn vinh và gìn giữ văn hóa các dân tộc', effectiveRange: 'Quyết định năm 2008; công bố và tổ chức từ năm 2009', sourceUrls: ['https://langvanhoavietnam.vn/qua-trinh-hinh-thanh-va-phat-trien/'], status: 'approved', eventIds: ['vietnam-ethnic-cultures-day'] },
  { id: 'vietnam-social-work-day', title: 'Ngày Công tác xã hội Việt Nam', aliases: [], group: 'organization', priority: 'P1', expectedRule: 'solar:3:25:start=2017', scope: 'Toàn quốc; tôn vinh người làm công tác xã hội và dịch vụ hỗ trợ', effectiveRange: 'Quyết định chọn ngày năm 2016; hoạt động kỷ niệm từ 2017', sourceUrls: ['https://vanban.chinhphu.vn/default.aspx?docid=186399&pageid=27160'], status: 'approved', eventIds: ['vietnam-social-work-day'] },
  { id: 'vietnam-youth-federation-day', title: 'Ngày truyền thống Hội Liên hiệp Thanh niên Việt Nam', aliases: [], group: 'organization', priority: 'P0', expectedRule: 'solar:10:15:start=1956', scope: 'Toàn quốc; ngày truyền thống của tổ chức thanh niên', effectiveRange: 'Từ đại hội thành lập Hội năm 1956', sourceUrls: ['https://baochinhphu.vn/ky-niem-55-nam-ngay-truyen-thong-hoi-lien-hiep-thanh-nien-viet-nam-102106013.htm'], status: 'approved', eventIds: ['vietnam-youth-federation-day'] },
  { id: 'vietnam-lawyers-day', title: 'Ngày truyền thống Luật sư Việt Nam', aliases: [], group: 'organization', priority: 'P1', expectedRule: 'solar:10:10:start=2013', scope: 'Toàn quốc; ngày truyền thống nghề luật sư, không phải ngày nghỉ', effectiveRange: 'Tên ngày truyền thống được công nhận năm 2013; dấu mốc lịch sử 1945', sourceUrls: ['https://baochinhphu.vn/10-10-la-ngay-truyen-thong-cua-luat-su-viet-nam-102137265.htm'], status: 'approved', eventIds: ['vietnam-lawyers-traditional-day'] },
  { id: 'vietnam-overseas-vietnamese-language-day', title: 'Ngày Tôn vinh tiếng Việt trong cộng đồng người Việt Nam ở nước ngoài', aliases: [], group: 'social', priority: 'P1', expectedRule: 'solar:9:8:start=2023', scope: 'Cộng đồng người Việt Nam ở nước ngoài', effectiveRange: 'Đề án triển khai giai đoạn 2023–2030; nguồn chưa quy định chấm dứt observance sau giai đoạn này', sourceUrls: ['https://vanban.chinhphu.vn/?classid=2&docid=206314&pageid=27160'], status: 'approved', eventIds: ['vietnam-overseas-vietnamese-language-day'] },
  { id: 'vietnam-veterans-association-day', title: 'Ngày thành lập Hội Cựu chiến binh Việt Nam', aliases: [], group: 'organization', priority: 'P0', expectedRule: 'solar:12:6:start=1989', scope: 'Toàn quốc; kỷ niệm ngày thành lập tổ chức', effectiveRange: 'Từ ngày thành lập Hội năm 1989', sourceUrls: ['https://www.hoiccbvietnam.vn/lich-su-truyen-thong-pa15.html'], status: 'approved', eventIds: ['vietnam-veterans-association-founding-day'] },
  { id: 'vietnam-national-defense-day', title: 'Ngày hội Quốc phòng toàn dân', aliases: [], group: 'official', priority: 'P0', expectedRule: 'solar:12:22:start=1989', scope: 'Toàn quốc; vận động xây dựng nền quốc phòng toàn dân, không phải ngày nghỉ', effectiveRange: 'Được chọn từ năm 1989', sourceUrls: ['https://btllang.mod.gov.vn/tin-tuc/tin-tong-hop/15323-de-cuong-tuyen-truyen-80-nam-ngay-thanh-lap-quan-doi-nhan-dan-viet-nam-va-35-nam-ngay-hoi-quoc-phong-toan-dan.html'], status: 'approved', eventIds: ['vietnam-national-defense-day'] },
  { id: 'vietnam-mttq-traditional-day', title: 'Ngày truyền thống Mặt trận Tổ quốc Việt Nam', aliases: [], group: 'organization', priority: 'P0', expectedRule: 'solar:11:18:start=1986', scope: 'Toàn quốc; ngày truyền thống của Mặt trận Tổ quốc Việt Nam', effectiveRange: 'Lấy ngày 18/11/1930 làm ngày truyền thống từ năm 1986', sourceUrls: ['https://m.mattran.org.vn/van-ban-huong-dan/ngay-1811-duoc-lay-lam-ngay-ky-niem-thanh-lap-mat-tran-dan-toc-thong-nhat-viet-nam-tu-khi-nao-10575.html'], status: 'approved', eventIds: ['vietnam-mttq-traditional-day'] },
  { id: 'world-tuberculosis-day', title: 'Ngày Thế giới phòng, chống lao', aliases: [], group: 'international', priority: 'P1', expectedRule: 'solar:3:24:start=1982', scope: 'Quốc tế; chiến dịch của WHO', effectiveRange: 'Tổ chức từ năm 1982', sourceUrls: ['https://www.who.int/campaigns/world-tb-day'], status: 'approved', eventIds: ['world-tuberculosis-day'] },
  { id: 'april-fools-day', title: 'Cá tháng Tư', aliases: ['Ngày nói dối'], group: 'international', priority: 'P2', expectedRule: 'solar:4:1', scope: 'Tập tục đùa vui phổ biến ở nhiều nơi; nguồn gốc chính xác chưa rõ', effectiveRange: 'Ngày 1/4 hằng năm', sourceUrls: ['https://cdcsnd1.bocongan.gov.vn/home/tin-tuc-su-kien/nguon-goc-va-y-nghia-ngay-ca-thang-tu-903'], status: 'approved', eventIds: ['april-fools-day'] },
  { id: 'international-nurses-day', title: 'Ngày Quốc tế Điều dưỡng', aliases: [], group: 'international', priority: 'P1', expectedRule: 'solar:5:12:start=1965', scope: 'Quốc tế; chiến dịch của Hội đồng Điều dưỡng Quốc tế', effectiveRange: 'Tổ chức từ năm 1965', sourceUrls: ['https://icn.ch/how-we-do-it/campaigns/international-nurses-day'], status: 'approved', eventIds: ['international-nurses-day'] },
  { id: 'international-day-of-families', title: 'Ngày Quốc tế Gia đình', aliases: [], group: 'international', priority: 'P1', expectedRule: 'solar:5:15:start=1994', scope: 'Quốc tế; ngày quan sát của Liên Hợp Quốc', effectiveRange: 'Đại hội đồng quyết định năm 1993; kỷ niệm từ năm 1994', sourceUrls: ['https://www.un.org/en/observances/international-day-families'], status: 'approved', eventIds: ['international-day-of-families'] },
  { id: 'world-no-tobacco-day', title: 'Ngày Thế giới không thuốc lá', aliases: [], group: 'international', priority: 'P1', expectedRule: 'solar:5:31:start=1988', scope: 'Quốc tế; chiến dịch của WHO', effectiveRange: 'Hằng năm từ năm 1988', sourceUrls: ['https://www.who.int/campaigns/world-no-tobacco-day'], status: 'approved', eventIds: ['world-no-tobacco-day'] },
  { id: 'international-day-against-drug-abuse', title: 'Ngày Quốc tế phòng, chống ma túy', aliases: [], group: 'international', priority: 'P1', expectedRule: 'solar:6:26:start=1988', scope: 'Quốc tế; observance của Liên Hợp Quốc, tách với ngày vận động trong nước', effectiveRange: 'Nghị quyết năm 1987; thường niên từ 1988', sourceUrls: ['https://www.un.org/en/observances/end-drug-abuse-day'], status: 'approved', eventIds: ['international-day-against-drug-abuse'] },
  { id: 'world-food-day', title: 'Ngày Lương thực Thế giới', aliases: [], group: 'international', priority: 'P1', expectedRule: 'solar:10:16:start=1981', scope: 'Quốc tế; ngày của FAO', effectiveRange: 'Quyết định năm 1979; tổ chức lần đầu 1981', sourceUrls: ['https://www.fao.org/world-food-day/en'], status: 'approved', eventIds: ['world-food-day'] },
  { id: 'lim-festival', title: 'Hội Lim', aliases: [], group: 'traditional', priority: 'P2', expectedRule: 'lunar:1:12-13:multi_day', scope: 'Lễ hội địa phương vùng Kinh Bắc', effectiveRange: 'Được tổ chức vào 12–13 tháng Giêng; hoạt động có thể điều chỉnh', sourceUrls: ['https://svhttdl.bacninh.gov.vn/news/-/details/188850/le-on-nhan-danh-hieu-di-san-van-hoa-phi-vat-the-quoc-gia-hoi-lim-va-khai-mac-le-hoi-lim-xuan-binh-ngo-2026-93704931'], status: 'under_review', eventIds: [], reviewReason: 'Ngày và tính địa phương đã có nguồn; chưa triển khai vì đây là lễ hội hai ngày và cần quyết định rõ có hiển thị từng ngày hay một khoảng lễ hội.' },
  { id: 'perfume-pagoda-festival', title: 'Lễ hội chùa Hương', aliases: [], group: 'traditional', priority: 'P2', expectedRule: 'lunar:1:6-through-3-end:multi_day', scope: 'Lễ hội hành hương tại Hương Sơn, Hà Nội, kéo dài nhiều tháng', effectiveRange: 'Thông lệ từ mùng 6 tháng Giêng đến hết tháng Ba; lịch hoạt động thực tế có thể điều chỉnh', sourceUrls: ['https://tphcm.chinhphu.vn/le-hoi-chua-huong-1014628.htm'], status: 'under_review', eventIds: [], reviewReason: 'Mô hình sự kiện hiện tại không biểu diễn chính xác khoảng nhiều tháng và ngoại lệ hủy/đổi kế hoạch từng năm.' },
  { id: 'yen-tu-festival', title: 'Lễ hội Yên Tử', aliases: [], group: 'traditional', priority: 'P2', expectedRule: 'lunar:1:10-through-3-end:multi_day', scope: 'Lễ hội địa phương tại Yên Tử, Quảng Ninh', effectiveRange: 'Khai hội mùng 10 tháng Giêng; mùa hội kéo dài mùa xuân', sourceUrls: ['https://www.quangninh.gov.vn/Trang/ChiTietBVGioiThieu.aspx?bvid=599'], status: 'under_review', eventIds: [], reviewReason: 'Cần mô hình khoảng ngày để thể hiện mùa hội và lịch mở cửa/tổ chức cụ thể; không chỉ hiển thị ngày khai hội như toàn bộ sự kiện.' },
  { id: 'ba-chua-xu-festival', title: 'Lễ hội Vía Bà Chúa Xứ Núi Sam', aliases: [], group: 'traditional', priority: 'P2', expectedRule: 'lunar:4:22-27:multi_day', scope: 'Lễ hội tín ngưỡng tại Núi Sam, An Giang', effectiveRange: 'Lễ hội thường từ 22 đến 27 tháng Tư âm lịch; nghi thức chính vào các ngày riêng', sourceUrls: ['https://angiang.gov.vn/vi/an-giang-chuc-khai-hoi-le-ba-chua-xu-nui-sam-nam-2026', 'https://hoilhpn.angiang.gov.vn/wp-content/uploads/2025/03/DC_UNESCO.pdf'], status: 'under_review', eventIds: [], reviewReason: 'Đã có nguồn xác nhận địa điểm và khoảng lễ hội; EventRule hiện tại không biểu diễn dải ngày và từng nghi lễ con.' },
  { id: 'oc-om-boc-festival', title: 'Lễ hội Oóc Om Bóc', aliases: ['Lễ cúng trăng'], group: 'traditional', priority: 'P2', expectedRule: 'khmer_calendar:full_moon_10', scope: 'Lễ hội của cộng đồng Khmer Nam Bộ', effectiveRange: 'Rằm tháng Ka-Đât theo lịch Khmer, xấp xỉ rằm tháng Mười âm lịch Việt', sourceUrls: ['https://baochinhphu.vn/le-hoi-ok-om-bok-tro-thanh-di-san-van-hoa-phi-vat-the-quoc-gia-102169972.htm'], status: 'under_review', eventIds: [], reviewReason: 'Nguồn xác nhận lịch Khmer, không phải ngày 15 tháng Mười theo lịch Việt cho mọi năm; cần lịch Khmer và phép chuyển đổi độc lập.' },
  { id: 'kate-festival', title: 'Lễ hội Katê', aliases: [], group: 'traditional', priority: 'P2', expectedRule: 'cham_calendar:month-7', scope: 'Lễ hội của cộng đồng Chăm Bàlamôn tại một số địa phương', effectiveRange: 'Theo ngày 1 tháng Bảy lịch Chăm; tương ứng thay đổi trên lịch Gregory', sourceUrls: ['https://baochinhphu.vn/cong-nhan-le-hoi-kate-cua-nguoi-cham-tinh-binh-thuan-la-di-san-van-hoa-quoc-gia-102220405104423984.htm', 'https://dsvh.gov.vn/di-tich-kien-truc-nghe-thuat-thap-po-klong-garai-2995'], status: 'under_review', eventIds: [], reviewReason: 'Nguồn xác nhận lịch Chăm và phạm vi cộng đồng; không thể quy đổi bằng lịch âm Việt Nam, cần lịch Chăm có đối chiếu riêng.' },
  { id: 'easter-western', title: 'Lễ Phục sinh (truyền thống phương Tây)', aliases: [], group: 'international', priority: 'P2', expectedRule: 'western_easter:gregorian', scope: 'Lễ Kitô giáo; ngày lễ phụ thuộc quy tắc lịch giáo hội', effectiveRange: 'Chưa triển khai', sourceUrls: ['https://www.vatican.va/'], status: 'under_review', eventIds: [], reviewReason: 'Cần xác minh thuật toán và xử lý khác biệt với các truyền thống dùng lịch Julius trước khi đưa ngày Phục sinh vào production.' },
  { id: 'vietnamese-solar-terms', title: '24 tiết khí', aliases: ['Tiết khí'], group: 'seasonal', priority: 'P2', expectedRule: 'apparent_solar_longitude:15-degree-steps:UTC+7', scope: 'Mốc thiên văn theo kinh độ biểu kiến Mặt Trời; không phải ngày nghỉ hay một sự kiện lễ đơn lẻ', effectiveRange: 'Chưa xác minh sai số cho toàn phạm vi 2000–2099', sourceUrls: ['https://www.xemamlich.uhm.vn/calrules_en.html'], status: 'out_of_scope', eventIds: [], reviewReason: 'Calendar Core chưa có engine tiết khí; cần phương pháp thiên văn, nguồn ephemeris và kiểm chứng biên trước khi hiển thị ngày.' },
]

function eventRule(event: (typeof VERIFIED_EVENTS)[number]): string {
  const rule = event.rule
  switch (rule.type) {
    case 'solar_fixed': return `solar:${rule.month}:${rule.day}${rule.startYear === undefined ? '' : `:start=${rule.startYear}`}${rule.endYear === undefined ? '' : `:end=${rule.endYear}`}`
    case 'lunar_fixed': return `lunar:${rule.month}:${rule.day}:${rule.leapMonthPolicy}${rule.startYear === undefined ? '' : `:start=${rule.startYear}`}${rule.endYear === undefined ? '' : `:end=${rule.endYear}`}`
    case 'lunar_month_end': return `lunar_month_end:${rule.month}`
    case 'weekday_rule': return `weekday_rule:${rule.month}:${rule.weekday}:${rule.occurrence}`
    case 'year_specific': return `year_specific:${rule.date.year}-${rule.date.month}-${rule.date.day}`
  }
}

test('independent Vietnam Event Atlas has stable, sourced candidate contracts', () => {
  assert.equal(new Set(VIETNAM_EVENT_ATLAS.map(({ id }) => id)).size, VIETNAM_EVENT_ATLAS.length)
  for (const candidate of VIETNAM_EVENT_ATLAS) {
    assert.ok(candidate.title.trim())
    assert.ok(candidate.scope.trim())
    assert.ok(candidate.effectiveRange.trim())
    assert.ok(candidate.sourceUrls.length > 0)
    for (const url of candidate.sourceUrls) assert.equal(new URL(url).protocol, 'https:')
    if (candidate.status !== 'approved') assert.ok(candidate.reviewReason?.trim(), `${candidate.id} needs a review reason`)
  }
})

test('every approved Atlas candidate is represented with its independently specified rule and sources', () => {
  const productionById = new Map(VERIFIED_EVENTS.map((event) => [event.id, event]))
  const required = VIETNAM_EVENT_ATLAS.filter(({ status }) => status === 'approved')
  assert.ok(required.length > 0)
  for (const candidate of required) {
    assert.ok(candidate.eventIds.length > 0, `${candidate.id} has no production mapping`)
    for (const eventId of candidate.eventIds) {
      const event = productionById.get(eventId)
      assert.ok(event, `${candidate.id} is missing production event ${eventId}`)
      assert.equal(eventRule(event), candidate.eventRuleOverrides?.[eventId] ?? candidate.expectedRule, `${candidate.id} rule differs from the researched date/effective range`)
      if (event.rule.type === 'solar_fixed'
        && (event.rule.startYear === undefined || event.rule.startYear <= 2026)
        && (event.rule.endYear === undefined || event.rule.endYear >= 2026)) {
        const occurrence = findEventsForDate(createCivilDate(2026, event.rule.month, event.rule.day), [event])
        assert.deepEqual(occurrence.map(({ id }) => id), [event.id], `${candidate.id} should match its researched 2026 solar date`)
      }
    }
    const mappedEvents = candidate.eventIds.map((eventId) => productionById.get(eventId))
    for (const sourceUrl of candidate.sourceUrls) {
      assert.ok(mappedEvents.some((event) => event?.sources.some(({ url }) => url === sourceUrl)), `${candidate.id} mappings do not retain ${sourceUrl}`)
    }
  }
})

test('priority coverage is measured against researched candidates rather than production record totals', () => {
  for (const priority of ['P0', 'P1'] as const) {
    const candidates = VIETNAM_EVENT_ATLAS.filter((candidate) => candidate.priority === priority)
    const approved = candidates.filter((candidate) => candidate.status === 'approved')
    const pending = candidates.filter((candidate) => candidate.status === 'under_review')
    const excluded = candidates.filter((candidate) => candidate.status === 'out_of_scope')
    assert.equal(approved.length + pending.length + excluded.length, candidates.length)
    assert.deepEqual([...pending, ...excluded].filter((candidate) => candidate.eventIds.length > 0), [])
  }
})

test('2026 official observances, effective years, overlaps and classifications match the Atlas', () => {
  const at = (month: number, day: number) => findEventsForDate(createCivilDate(2026, month, day))
  const marchThird = at(3, 3).map(({ id }) => id)
  assert.ok(marchThird.includes('vietnam-border-guard-traditional-day'))
  assert.ok(marchThird.includes('vietnam-all-people-border-day'))
  const augustNineteenth = at(8, 19).map(({ id }) => id)
  assert.ok(augustNineteenth.includes('august-revolution-day'))
  assert.ok(augustNineteenth.includes('vietnam-public-security-traditional-day'))
  assert.ok(augustNineteenth.includes('vietnam-all-people-national-security-day'))
  assert.ok(at(11, 20).some(({ id }) => id === 'vietnamese-teachers-day'))
  assert.ok(at(11, 20).some(({ id }) => id === 'world-childrens-day'))
  for (const event of VERIFIED_EVENTS.filter(({ id }) => id.startsWith('vietnam-') && id !== 'vietnam-culture-day')) {
    if (event.rule.type === 'solar_fixed' && event.rule.month === 3 && event.rule.day === 3) {
      assert.equal(event.category, 'commemoration')
    }
  }
  for (const eventId of [
    'vietnam-students-day', 'vietnam-border-guard-traditional-day', 'vietnam-all-people-border-day',
    'vietnam-consumer-rights-day', 'vietnam-sports-day', 'vietnam-militia-self-defense-day',
    'vietnam-persons-with-disabilities-day', 'vietnam-young-pioneers-founding-day',
    'vietnam-older-persons-traditional-day', 'vietnam-health-insurance-day', 'vietnam-agent-orange-victims-day',
    'vietnam-public-security-traditional-day', 'vietnam-all-people-national-security-day',
    'vietnam-digital-transformation-day', 'vietnam-entrepreneurs-day', 'vietnam-farmers-union-founding-day',
    'vietnam-population-day', 'vietnam-trade-union-traditional-day',
  ]) assert.notEqual(VERIFIED_EVENTS.find(({ id }) => id === eventId)?.category, 'official_holiday', `${eventId} is not a statutory day off`)
})

test('effective start years exclude newly designated observances from earlier years', () => {
  const eventIdsOn = (year: number, month: number, day: number) =>
    findEventsForDate(createCivilDate(year, month, day)).map(({ id }) => id)
  assert.ok(!eventIdsOn(2015, 3, 15).includes('vietnam-consumer-rights-day'))
  assert.ok(eventIdsOn(2016, 3, 15).includes('vietnam-consumer-rights-day'))
  assert.ok(!eventIdsOn(2008, 7, 1).includes('vietnam-health-insurance-day'))
  assert.ok(eventIdsOn(2009, 7, 1).includes('vietnam-health-insurance-day'))
  assert.ok(!eventIdsOn(2021, 10, 10).includes('vietnam-digital-transformation-day'))
  assert.ok(eventIdsOn(2022, 10, 10).includes('vietnam-digital-transformation-day'))
  assert.ok(!eventIdsOn(2004, 8, 19).includes('vietnam-all-people-national-security-day'))
  assert.ok(eventIdsOn(2005, 8, 19).includes('vietnam-all-people-national-security-day'))
  assert.ok(eventIdsOn(2000, 3, 3).includes('vietnam-all-people-border-day-legacy'))
  assert.ok(!eventIdsOn(2010, 4, 18).includes('vietnam-persons-with-disabilities-day'))
  assert.ok(eventIdsOn(2011, 4, 18).includes('vietnam-persons-with-disabilities-day'))
})

test('research-backed historical names, exceptional dates and newly catalogued overlaps are exact', () => {
  const ids = (year: number, month: number, day: number) =>
    findEventsForDate(createCivilDate(year, month, day)).map(({ id }) => id)

  assert.ok(ids(2000, 9, 19).includes('international-day-of-peace-2000'))
  assert.ok(!ids(2000, 9, 21).some((id) => id.startsWith('international-day-of-peace')))
  assert.ok(ids(2001, 9, 14).includes('international-day-of-peace-2001'))
  assert.ok(!ids(2001, 9, 18).some((id) => id.startsWith('international-day-of-peace')))
  assert.ok(!ids(2001, 9, 21).some((id) => id.startsWith('international-day-of-peace')))
  assert.ok(ids(2002, 9, 21).includes('international-day-of-peace'))
  assert.ok(ids(2026, 9, 21).includes('international-day-of-peace'))

  for (const year of [2000, 2003]) {
    const borderNames = ids(year, 3, 3).filter((id) => id.includes('all-people-border-day'))
    assert.deepEqual(borderNames, ['vietnam-all-people-border-day-legacy'])
  }
  assert.deepEqual(ids(2004, 3, 3).filter((id) => id.includes('all-people-border-day')), ['vietnam-all-people-border-day'])
  assert.ok(ids(2004, 3, 3).includes('vietnam-border-guard-traditional-day'))

  const november23 = ids(2026, 11, 23)
  for (const id of ['ha-nguyen', 'vietnam-red-cross-founding-day', 'vietnam-cultural-heritage-day']) assert.ok(november23.includes(id), `${id} should appear on 23/11/2026`)
  const april7 = ids(2026, 4, 7)
  assert.ok(april7.includes('world-health-day'))
  assert.ok(april7.includes('vietnam-voluntary-blood-donation-day'))

  assert.deepEqual(ids(2024, 10, 4).filter((id) => id.startsWith('vietnam-') && id.includes('fire-')), ['vietnam-national-fire-prevention-day'])
  assert.deepEqual(ids(2026, 10, 4).filter((id) => id.startsWith('vietnam-') && id.includes('fire-')), ['vietnam-fire-rescue-day'])
  assert.ok(ids(2026, 6, 26).includes('vietnam-anti-drug-day'))

  // Calendar anchors: 2002 Rằm tháng Giêng = 26/02/2002 (Báo Nghệ An);
  // 2003 = 15/02/2003 (Amlich.org); 2026 = 03/03/2026 (Quảng Ninh provincial portal).
  assert.ok(!ids(2002, 2, 26).includes('vietnam-poetry-day'))
  assert.ok(ids(2003, 2, 15).includes('vietnam-poetry-day'))
  assert.ok(ids(2026, 3, 3).includes('vietnam-poetry-day'))
  assert.ok(!ids(2026, 3, 2).includes('vietnam-poetry-day'))
})

test('independent 2025–2026 anchors retain distinct same-day observances and historical naming', () => {
  const ids = (year: number, month: number, day: number) =>
    findEventsForDate(createCivilDate(year, month, day)).map(({ id }) => id)
  assert.ok(!ids(2025, 4, 7).includes('vietnam-national-health-day'))
  const aprilSeventhEvents = new Set(['world-health-day', 'vietnam-voluntary-blood-donation-day', 'vietnam-national-health-day'])
  assert.deepEqual(ids(2026, 4, 7).filter((id) => aprilSeventhEvents.has(id)), ['vietnam-national-health-day', 'vietnam-voluntary-blood-donation-day', 'world-health-day'])
  assert.ok(ids(2026, 4, 19).includes('vietnam-ethnic-cultures-day'))
  assert.ok(ids(2026, 3, 25).includes('vietnam-social-work-day'))
  assert.ok(ids(2026, 10, 15).includes('vietnam-youth-federation-day'))
  assert.ok(ids(2026, 10, 10).includes('vietnam-lawyers-traditional-day'))
  assert.ok(ids(2026, 9, 8).includes('vietnam-overseas-vietnamese-language-day'))
  assert.ok(ids(2031, 9, 8).includes('international-literacy-day'))
  assert.ok(ids(2026, 12, 6).includes('vietnam-veterans-association-founding-day'))
  assert.ok(ids(2026, 12, 22).includes('vietnam-national-defense-day'))
  assert.ok(ids(2026, 12, 22).includes('vietnam-peoples-army-day'))
  assert.ok(ids(2026, 11, 18).includes('vietnam-mttq-traditional-day'))
  assert.ok(ids(2026, 11, 18).includes('vietnam-national-unity-day'))
  assert.ok(ids(2000, 10, 20).includes('vietnam-womens-union-founding-day'))
  assert.ok(!ids(2000, 10, 20).includes('vietnamese-womens-day'))
  assert.ok(ids(2009, 10, 20).includes('vietnam-womens-union-founding-day'))
  assert.deepEqual(ids(2010, 10, 20).filter((id) => id.includes('womens') || id.includes('women')), ['vietnamese-womens-day'])
  assert.deepEqual(ids(2026, 10, 20).filter((id) => id.includes('womens') || id.includes('women')), ['vietnamese-womens-day'])
})

test('new recurring family and international observances use their documented dates', () => {
  const ids = (year: number, month: number, day: number) =>
    findEventsForDate(createCivilDate(year, month, day)).map(({ id }) => id)
  assert.ok(ids(2026, 3, 24).includes('world-tuberculosis-day'))
  assert.ok(ids(2026, 4, 1).includes('april-fools-day'))
  assert.ok(ids(2026, 5, 12).includes('international-nurses-day'))
  assert.ok(ids(2026, 5, 15).includes('international-day-of-families'))
  assert.ok(ids(2026, 5, 31).includes('world-no-tobacco-day'))
  assert.ok(ids(2026, 6, 26).includes('international-day-against-drug-abuse'))
  assert.ok(ids(2026, 6, 26).includes('vietnam-anti-drug-day'))
  assert.ok(ids(2026, 10, 16).includes('world-food-day'))
  assert.ok(ids(2026, 11, 19).includes('international-mens-day'))
  assert.ok(ids(2026, 5, 10).includes('mothers-day'))
  assert.ok(ids(2025, 5, 11).includes('mothers-day'))
  assert.ok(ids(2026, 6, 21).includes('fathers-day'))
  assert.ok(ids(2025, 6, 15).includes('fathers-day'))
  for (const id of ['mothers-day', 'fathers-day', 'international-mens-day', 'april-fools-day']) {
    assert.notEqual(VERIFIED_EVENTS.find((event) => event.id === id)?.category, 'official_holiday')
  }
})

test('Tết day 2 and day 3 match independent 2026 calendar references', () => {
  // Independent references: https://amlich.vn/lich-am and the 2026 Government
  // schedule https://baochinhphu.vn/bo-noi-vu-thong-bao-lich-nghi-tet-am-lich-va-nghi-le-quoc-khanh-nam-2026-102251017095507785.htm
  assert.ok(findEventsForDate(createCivilDate(2026, 2, 18)).some(({ id }) => id === 'lunar-new-year-day-2'))
  assert.ok(findEventsForDate(createCivilDate(2026, 2, 19)).some(({ id }) => id === 'lunar-new-year-day-3'))
  assert.ok(!findEventsForDate(createCivilDate(2026, 2, 17)).some(({ id }) => id === 'lunar-new-year-day-2' || id === 'lunar-new-year-day-3'))
})

test('event engine sweep is safe, deterministic, unique, and respects one active name per Atlas occasion for 2000–2099', () => {
  const occasionByEventId = new Map<string, string>()
  for (const candidate of VIETNAM_EVENT_ATLAS) {
    const occasion = candidate.id === 'vietnam-womens-day' ? 'vietnam-womens-day' : candidate.id
    for (const eventId of candidate.eventIds) occasionByEventId.set(eventId, occasion)
  }
  const firstJdn = civilDateToJulianDayNumber(createCivilDate(2000, 1, 1))
  const lastJdn = civilDateToJulianDayNumber(createCivilDate(2099, 12, 31))
  for (let jdn = firstJdn; jdn <= lastJdn; jdn += 1) {
    const date = julianDayNumberToCivilDate(jdn)
    const events = findEventsForDate(date)
    const ids = events.map(({ id }) => id)
    assert.equal(new Set(ids).size, ids.length, `duplicate event ID on ${date.year}-${date.month}-${date.day}`)
    assert.deepEqual(findEventsForDate(date).map(({ id }) => id), ids, 'sort order should be deterministic')
    const activeOccasions = ids.map((id) => occasionByEventId.get(id)).filter((value): value is string => value !== undefined)
    assert.equal(new Set(activeOccasions).size, activeOccasions.length, `two names for one Atlas occasion on ${date.year}-${date.month}-${date.day}`)
  }
})

test('August 2024 overlap remains two distinct observances, and no new entry is incorrectly a day off', () => {
  const ids = findEventsForDate(createCivilDate(2024, 8, 10)).map(({ id }) => id)
  assert.ok(ids.includes('that-tich'))
  assert.ok(ids.includes('vietnam-agent-orange-victims-day'))
  const nonHolidayIds = [
    'vietnam-students-day', 'vietnam-border-guard-traditional-day', 'vietnam-all-people-border-day',
    'vietnam-consumer-rights-day', 'vietnam-sports-day', 'vietnam-militia-self-defense-day',
    'vietnam-persons-with-disabilities-day', 'international-red-cross-day', 'vietnam-young-pioneers-founding-day',
    'vietnam-older-persons-traditional-day', 'vietnam-health-insurance-day', 'vietnam-agent-orange-victims-day',
    'vietnam-public-security-traditional-day', 'vietnam-all-people-national-security-day',
    'international-older-persons-day', 'vietnam-digital-transformation-day', 'vietnam-entrepreneurs-day',
    'vietnam-farmers-union-founding-day', 'vietnam-population-day', 'vietnam-trade-union-traditional-day',
    'world-health-day', 'international-day-of-happiness', 'earth-day', 'world-blood-donor-day',
    'world-population-day', 'international-youth-day', 'international-day-of-persons-with-disabilities',
    'international-volunteer-day',
  ]
  const byId = new Map(VERIFIED_EVENTS.map((event) => [event.id, event]))
  for (const id of nonHolidayIds) {
    const event = byId.get(id)
    assert.ok(event)
    assert.notEqual(event.category, 'official_holiday', `${id} is an observance, not a statutory day off`)
  }
})
