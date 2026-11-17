import assert from 'node:assert/strict'
import test from 'node:test'
import { createCivilDate } from '../src/calendar/core.ts'
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
  { id: 'all-people-border-day', title: 'Ngày Biên phòng toàn dân', aliases: [], group: 'official', priority: 'P0', expectedRule: 'solar:3:3:start=1989', scope: 'Toàn quốc; vận động trách nhiệm cộng đồng về biên giới', effectiveRange: 'Từ năm 1989', sourceUrls: ['https://tiengchuong.chinhphu.vn/nhieu-hoat-dong-ky-niem-60-nam-ngay-truyen-thong-bo-doi-bien-phong-11327668.htm'], status: 'approved', eventIds: ['vietnam-all-people-border-day'] },
  { id: 'consumer-rights-day', title: 'Ngày Quyền của người tiêu dùng Việt Nam', aliases: [], group: 'official', priority: 'P0', expectedRule: 'solar:3:15:start=2015', scope: 'Toàn quốc; không phải ngày nghỉ lễ', effectiveRange: 'Theo Quyết định 1035/QĐ-TTg năm 2015', sourceUrls: ['https://moit.gov.vn/tin-tuc/hoat-dong/quyet-dinh-cua-thu-tuong-chinh-phu-ve-ngay-quyen-cua-nguoi-t2.html'], status: 'approved', eventIds: ['vietnam-consumer-rights-day'] },
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
  { id: 'mothers-day', title: 'Ngày của Mẹ', aliases: [], group: 'social', priority: 'P2', expectedRule: 'weekday_rule:5:0:2', scope: 'Ngày Chủ nhật thứ hai tháng 5 tại một số quốc gia; cách hưởng ứng ở Việt Nam chưa đủ đại diện để xếp là dịp phổ biến', effectiveRange: 'Không xác lập phạm vi Việt Nam', sourceUrls: ['https://www.history.com/articles/mothers-day-second-sunday-may'], status: 'under_review', eventIds: [], reviewReason: 'Cần nguồn Việt Nam độc lập chứng minh mức độ phổ biến, không chỉ quy tắc Hoa Kỳ.' },
  { id: 'fathers-day', title: 'Ngày của Cha', aliases: [], group: 'social', priority: 'P2', expectedRule: 'weekday_rule:6:0:3', scope: 'Ngày Chủ nhật thứ ba tháng 6 tại một số quốc gia; cách hưởng ứng ở Việt Nam chưa đủ đại diện', effectiveRange: 'Không xác lập phạm vi Việt Nam', sourceUrls: ['https://www.history.com/articles/fathers-day'], status: 'under_review', eventIds: [], reviewReason: 'Cần nguồn Việt Nam độc lập và quy tắc phạm vi phù hợp.' },
  { id: 'international-mens-day', title: 'Ngày Quốc tế Nam giới', aliases: [], group: 'social', priority: 'P2', expectedRule: 'solar:11:19', scope: 'Hưởng ứng không đồng đều; chưa xác minh mức độ phổ biến tại Việt Nam', effectiveRange: 'Chưa xác lập cho sản phẩm', sourceUrls: ['https://internationalmensday.com/about/history-background/'], status: 'under_review', eventIds: [], reviewReason: 'Thiếu bằng chứng về mức độ phổ biến và nguồn chuẩn hóa tại Việt Nam.' },
  { id: 'vietnamese-solar-terms', title: '24 tiết khí', aliases: ['Tiết khí'], group: 'seasonal', priority: 'P2', expectedRule: 'apparent_solar_longitude:15-degree-steps:UTC+7', scope: 'Mốc thiên văn theo kinh độ biểu kiến Mặt Trời; không phải ngày nghỉ hay một sự kiện lễ đơn lẻ', effectiveRange: 'Chưa xác minh sai số cho toàn phạm vi 2000–2099', sourceUrls: ['https://www.xemamlich.uhm.vn/calrules_en.html'], status: 'out_of_scope', eventIds: [], reviewReason: 'Calendar Core chưa có engine tiết khí; cần phương pháp thiên văn, nguồn ephemeris và kiểm chứng biên trước khi hiển thị ngày.' },
]

function eventRule(event: (typeof VERIFIED_EVENTS)[number]): string {
  const rule = event.rule
  switch (rule.type) {
    case 'solar_fixed': return `solar:${rule.month}:${rule.day}${rule.startYear === undefined ? '' : `:start=${rule.startYear}`}${rule.endYear === undefined ? '' : `:end=${rule.endYear}`}`
    case 'lunar_fixed': return `lunar:${rule.month}:${rule.day}:${rule.leapMonthPolicy}`
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

test('every approved P0/P1 Atlas candidate is represented with its independently specified rule and sources', () => {
  const productionById = new Map(VERIFIED_EVENTS.map((event) => [event.id, event]))
  const required = VIETNAM_EVENT_ATLAS.filter(({ status, priority }) => status === 'approved' && priority !== 'P2')
  assert.ok(required.length > 0)
  for (const candidate of required) {
    assert.ok(candidate.eventIds.length > 0, `${candidate.id} has no production mapping`)
    for (const eventId of candidate.eventIds) {
      const event = productionById.get(eventId)
      assert.ok(event, `${candidate.id} is missing production event ${eventId}`)
      assert.equal(eventRule(event), candidate.expectedRule, `${candidate.id} rule differs from the researched date/effective range`)
      if (event.rule.type === 'solar_fixed'
        && (event.rule.startYear === undefined || event.rule.startYear <= 2026)
        && (event.rule.endYear === undefined || event.rule.endYear >= 2026)) {
        const occurrence = findEventsForDate(createCivilDate(2026, event.rule.month, event.rule.day), [event])
        assert.deepEqual(occurrence.map(({ id }) => id), [event.id], `${candidate.id} should match its researched 2026 solar date`)
      }
      for (const sourceUrl of candidate.sourceUrls) {
        assert.ok(event.sources.some(({ url }) => url === sourceUrl), `${eventId} does not retain ${sourceUrl}`)
      }
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
  assert.ok(!eventIdsOn(2014, 3, 15).includes('vietnam-consumer-rights-day'))
  assert.ok(eventIdsOn(2015, 3, 15).includes('vietnam-consumer-rights-day'))
  assert.ok(!eventIdsOn(2008, 7, 1).includes('vietnam-health-insurance-day'))
  assert.ok(eventIdsOn(2009, 7, 1).includes('vietnam-health-insurance-day'))
  assert.ok(!eventIdsOn(2021, 10, 10).includes('vietnam-digital-transformation-day'))
  assert.ok(eventIdsOn(2022, 10, 10).includes('vietnam-digital-transformation-day'))
  assert.ok(!eventIdsOn(2004, 8, 19).includes('vietnam-all-people-national-security-day'))
  assert.ok(eventIdsOn(2005, 8, 19).includes('vietnam-all-people-national-security-day'))
  assert.ok(eventIdsOn(2000, 3, 3).includes('vietnam-all-people-border-day'))
  assert.ok(!eventIdsOn(2010, 4, 18).includes('vietnam-persons-with-disabilities-day'))
  assert.ok(eventIdsOn(2011, 4, 18).includes('vietnam-persons-with-disabilities-day'))
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
