import type { CalendarEvent } from './model.ts'

/** Curated recurring observances and statutory holidays; no year-specific leave schedules. */
export const VERIFIED_EVENTS: readonly CalendarEvent[] = [
  {
    id: 'new-year-day', title: 'Tết Dương lịch', category: 'official_holiday',
    rule: { type: 'solar_fixed', month: 1, day: 1 },
    description: 'Tết Dương lịch mở đầu năm mới theo lịch Gregory. Nhiều người đón thời khắc chuyển năm cùng gia đình hoặc tại các sự kiện cộng đồng; ở Việt Nam đây là ngày nghỉ lễ theo luật.', sortOrder: 10,
    sources: [{ publisher: 'Chính phủ Việt Nam', title: 'Bộ luật Lao động 45/2019/QH14, Điều 112', url: 'https://vanban.chinhphu.vn/?docid=198540&pageid=27160' }],
  },
  {
    id: 'lunar-new-year-day-1', title: 'Mùng 1 Tết Nguyên đán', category: 'official_holiday',
    rule: { type: 'lunar_fixed', month: 1, day: 1, leapMonthPolicy: 'regular_only' },
    description: 'Mùng 1 Tết mở đầu năm mới âm lịch và là dịp sum họp quan trọng của nhiều gia đình Việt. Mọi người thường chúc Tết, thăm hỏi người thân và tưởng nhớ tổ tiên; kỳ nghỉ cụ thể được công bố theo từng năm.', sortOrder: 20,
    sources: [{ publisher: 'Chính phủ Việt Nam', title: 'Bộ luật Lao động 45/2019/QH14, Điều 112', url: 'https://vanban.chinhphu.vn/?docid=198540&pageid=27160' }],
  },
  {
    id: 'lunar-new-year-eve', title: 'Giao thừa Tết Nguyên đán', category: 'traditional',
    rule: { type: 'lunar_month_end', month: 12 },
    description: 'Giao thừa là thời khắc chuyển từ ngày cuối tháng Chạp sang mùng 1 Tết. Nhiều gia đình làm lễ đón năm mới và quây quần bên nhau; tháng Chạp kết thúc vào ngày 29 hoặc 30 tùy năm.', sortOrder: 25,
    sources: [
      { publisher: 'Cổng Thông tin điện tử Chính phủ', title: 'Các phong tục Tết cổ truyền tại các quốc gia châu Á', url: 'https://baochinhphu.vn/cac-phong-tuc-tet-co-truyen-tai-cac-quoc-gia-chau-a-102179307.htm' },
      { publisher: 'Đài Tiếng nói Việt Nam', title: 'Vì sao 8 năm liền kể từ 2025, Tết Nguyên đán không có ngày 30 Tết?', url: 'https://vov.gov.vn/vi-sao-8-nam-lien-ke-tu-2025-tet-nguyen-dan-khong-co-ngay-30-tet-dtnew-1045532' },
    ],
  },
  {
    id: 'nguyen-tieu', title: 'Tết Nguyên tiêu (Rằm tháng Giêng)', category: 'traditional',
    rule: { type: 'lunar_fixed', month: 1, day: 15, leapMonthPolicy: 'regular_only' },
    description: 'Tết Nguyên tiêu là đêm rằm đầu tiên của năm âm lịch, còn gọi là Tết Thượng Nguyên. Nhiều người đi lễ chùa cầu an; ở Hội An, dịp này có lễ hội địa phương đặc sắc.', sortOrder: 30,
    details: {
      aliases: ['Tết Thượng Nguyên', 'Rằm tháng Giêng'],
      origin: 'Tên gọi Nguyên tiêu chỉ đêm rằm đầu tiên của năm. Tết này có lịch sử lâu đời ở Việt Nam; các ghi chép về triều Trần nhắc đến lễ đèn trong đêm rằm.',
      significance: 'Trong cách gọi của lịch cũ, Rằm tháng Giêng là Thượng Nguyên; Rằm tháng Bảy và tháng Mười lần lượt là Trung Nguyên và Hạ Nguyên.',
      customs: 'Ở Hội An, người dân tổ chức Tết Nguyên tiêu với nghi lễ và sinh hoạt cộng đồng mang dấu ấn địa phương. Lễ hội tại đây được ghi danh là di sản văn hóa phi vật thể quốc gia.',
    },
    sources: [
      { publisher: 'Cổng Thông tin điện tử Chính phủ', title: 'Mùa xuân và Tết Nguyên tiêu', url: 'https://baochinhphu.vn/mua-xuan-va-tet-nguyen-tieu-102138919.htm' },
      { publisher: 'Trung tâm Quản lý Bảo tồn Di sản Văn hóa Hội An', title: 'Tết Nguyên tiêu ở Hội An', url: 'https://hoianheritage.net/uploads/download/files/ban-tin-01-2023.pdf' },
    ],
  },
  {
    id: 'tao-quan', title: 'Lễ tiễn Táo quân', category: 'traditional',
    rule: { type: 'lunar_fixed', month: 12, day: 23, leapMonthPolicy: 'regular_only' },
    description: 'Ngày 23 tháng Chạp, nhiều gia đình làm lễ tiễn Táo quân, thường gọi là Ông Công Ông Táo. Tục lệ bắt nguồn từ tín ngưỡng dân gian về các vị thần trông coi bếp núc và việc trong nhà.', sortOrder: 26,
    details: {
      origin: 'Truyện dân gian kể Táo quân là các vị thần gắn với bếp lửa và gia đình. Các dị bản về sự tích có chi tiết khác nhau, nên được hiểu là truyền thuyết chứ không phải ghi chép lịch sử.',
      customs: 'Nhiều gia đình làm lễ tiễn Táo quân vào ngày 23 tháng Chạp. Lễ vật và cách cúng thay đổi theo tập quán từng nhà, từng vùng.',
    },
    sources: [{ publisher: 'Cổng Thông tin điện tử Chính phủ', title: 'Tết ông Công, ông Táo: Sự tích và nét văn hóa', url: 'https://baochinhphu.vn/tet-ong-cong-ong-tao-su-tich-va-net-van-hoa-102215743.htm' }],
  },
  {
    id: 'than-tai-day', title: 'Ngày vía Thần Tài', category: 'traditional',
    rule: { type: 'lunar_fixed', month: 1, day: 10, leapMonthPolicy: 'regular_only' },
    description: 'Ngày vía Thần Tài được nhiều người làm nghề buôn bán chú ý vào mùng 10 tháng Giêng. Người ta thường dâng lễ cầu may trong việc làm ăn; tập tục và cách thờ cúng khác nhau giữa các cộng đồng.', sortOrder: 35,
    details: {
      significance: 'Thần Tài được thờ với mong ước làm ăn thuận lợi. Ngày vía đầu năm trở thành dịp nhiều cửa hàng và gia đình kinh doanh hướng về vị thần này.',
      customs: 'Lễ vật và cách thờ cúng khác nhau giữa các gia đình. Nghiên cứu tại Hội An ghi nhận tín ngưỡng thờ Thần Tài trong các hội quán người Hoa; đó là một bối cảnh cụ thể, không đại diện cho mọi tập tục ở Việt Nam.',
    },
    sources: [
      { publisher: 'Trung tâm Quản lý Bảo tồn Di sản Văn hóa Hội An', title: 'Tín ngưỡng thờ cúng thần Tài của người Hoa ở Hội An', url: 'https://hoianheritage.net/uploads/download/4-khanh-van.pdf' },
      { publisher: 'Tuổi Trẻ', title: 'Mùng 10 tháng giêng: Ngày vía Thần Tài hay ngày vía Thần Đất?', url: 'https://tuoitre.vn/mung-10-thang-gieng-ngay-via-than-tai-hay-ngay-via-than-dat-20220211093522245.htm' },
    ],
  },
  {
    id: 'han-thuc', title: 'Tết Hàn thực', category: 'traditional',
    rule: { type: 'lunar_fixed', month: 3, day: 3, leapMonthPolicy: 'regular_only' },
    description: 'Tết Hàn thực gắn với tục làm bánh trôi, bánh chay để dâng cúng tổ tiên ở một số vùng. Phong tục này không phổ biến đồng đều trên cả nước.', sortOrder: 27,
    details: {
      customs: 'Tại Việt Nam, bánh trôi và bánh chay là những món thường gắn với dịp này; một số gia đình dâng bánh lên bàn thờ tổ tiên.',
    },
    sources: [{ publisher: 'Cục Du lịch Quốc gia Việt Nam', title: 'Lễ tết - Việt Nam - Đất nước Con người', url: 'https://vietnamtourism.vn/index.php/about/items/2453' }],
  },
  {
    id: 'vesak', title: 'Lễ Phật đản', category: 'traditional',
    rule: { type: 'lunar_fixed', month: 4, day: 15, leapMonthPolicy: 'regular_only' },
    description: 'Lễ Phật đản kỷ niệm ngày Đức Phật Thích Ca ra đời theo truyền thống Phật giáo Bắc tông. Các chùa tổ chức nghi lễ và hoạt động cộng đồng; ngày cử hành có thể khác theo hệ phái.', sortOrder: 28,
    details: {
      significance: 'Đây là một trong những ngày lễ lớn của Phật giáo, hướng đến việc tưởng niệm Đức Phật và các giá trị từ bi, tỉnh thức trong giáo lý.',
      customs: 'Tại Việt Nam, các chùa thường tổ chức lễ tụng niệm, thuyết giảng và hoạt động thiện nguyện. Ngày cử hành và nghi thức có thể khác giữa các truyền thống Phật giáo.',
    },
    sources: [{ publisher: 'Ban Tôn giáo Chính phủ', title: 'Đôi nét về đạo Phật và Giáo hội Phật giáo Việt Nam', url: 'https://btgcp.gov.vn/pages/detail/1/Doi-net-ve-dao-Phat-va-Giao-hoi-Phat-giao-Viet-Nam.html' }],
  },
  {
    id: 'valentines-day', title: 'Ngày Lễ tình nhân', category: 'international',
    rule: { type: 'solar_fixed', month: 2, day: 14 },
    description: 'Valentine là dịp nhiều người bày tỏ tình cảm với người thương bằng lời chúc, hoa hoặc quà tặng. Ngày lễ gắn với nhiều truyền thống lịch sử khác nhau, nên không có một nguồn gốc duy nhất được xác lập.', sortOrder: 40,
    details: {
      origin: 'Tên Valentine gắn với một số vị thánh tử đạo cùng tên và các câu chuyện được lưu truyền qua nhiều thời kỳ. Các tư liệu lịch sử không xác lập một nguồn gốc duy nhất cho tập tục hiện đại.',
      customs: 'Ngày nay, nhiều người trao thiệp, hoa hoặc quà cho người mình yêu quý. Cách kỷ niệm mang tính cá nhân và không giới hạn ở các cặp đôi.',
    },
    sources: [{ publisher: 'Cổng Thông tin điện tử Chính phủ', title: 'Ngày Lễ tình nhân - Valentine', url: 'https://baochinhphu.vn/ngay-le-tinh-nhan-valentine-10231292.htm' }],
  },
  {
    id: 'international-womens-day', title: 'Ngày Quốc tế Phụ nữ', category: 'international',
    rule: { type: 'solar_fixed', month: 3, day: 8 },
    description: 'Ngày Quốc tế Phụ nữ ghi nhận đóng góp của phụ nữ và nhắc đến các phong trào đấu tranh cho quyền bình đẳng. Liên Hợp Quốc kỷ niệm ngày này trên phạm vi quốc tế.', sortOrder: 50,
    details: {
      origin: 'Ngày này hình thành từ các phong trào lao động và đòi quyền của phụ nữ đầu thế kỷ XX. Liên Hợp Quốc bắt đầu kỷ niệm Ngày Quốc tế Phụ nữ vào năm 1975.',
      significance: 'Dịp này ghi nhận những thành tựu của phụ nữ và nhấn mạnh các vấn đề bình đẳng giới còn cần giải quyết.',
      customs: 'Ở Việt Nam, cơ quan, trường học và gia đình thường tổ chức gặp mặt hoặc gửi lời chúc. Hình thức hưởng ứng không phải nghi thức bắt buộc.',
    },
    sources: [{ publisher: 'Liên Hợp Quốc', title: 'Background | International Women’s Day', url: 'https://www.un.org/en/observances/womens-day/background' }],
  },
  {
    id: 'hung-kings-day', title: 'Giỗ Tổ Hùng Vương', category: 'official_holiday',
    rule: { type: 'lunar_fixed', month: 3, day: 10, leapMonthPolicy: 'regular_only' },
    description: 'Giỗ Tổ Hùng Vương tưởng nhớ các Vua Hùng và những người được xem là có công dựng nước. Ngày lễ gắn với tín ngưỡng thờ cúng Hùng Vương, biểu tượng của cội nguồn và sự gắn kết cộng đồng Việt.', sortOrder: 60,
    details: {
      significance: 'Tín ngưỡng thờ cúng Hùng Vương thể hiện ý thức hướng về cội nguồn trong văn hóa Việt. Các truyền thuyết về thời đại Hùng Vương thuộc ký ức và huyền sử dân tộc, không phải toàn bộ đều là ghi chép lịch sử có thể kiểm chứng.',
      customs: 'Lễ hội chính diễn ra tại Đền Hùng ở Phú Thọ với nghi lễ dâng hương và các hoạt động văn hóa. Nhiều địa phương và gia đình cũng tưởng niệm tổ tiên theo cách riêng.',
    },
    sources: [
      { publisher: 'Chính phủ Việt Nam', title: 'Bộ luật Lao động 45/2019/QH14, Điều 112', url: 'https://vanban.chinhphu.vn/?docid=198540&pageid=27160' },
      { publisher: 'Cổng Thông tin điện tử Chính phủ', title: 'Hướng về cội nguồn nhớ ngày Quốc lễ giỗ tổ Hùng Vương mùng 10 tháng 3 âm lịch', url: 'https://baochinhphu.vn/huong-ve-coi-nguon-nho-ngay-quoc-le-gio-to-hung-vuong-mung-10-thang-3-am-lich-10266106.htm' },
    ],
  },
  {
    id: 'world-water-day', title: 'Ngày Nước Thế giới', category: 'international',
    rule: { type: 'solar_fixed', month: 3, day: 22 },
    description: 'Ngày Nước Thế giới nhấn mạnh vai trò của nước sạch và việc quản lý bền vững nguồn nước. Liên Hợp Quốc chọn dịp này để các quốc gia cùng chia sẻ vấn đề và thúc đẩy hành động.', sortOrder: 70,
    details: {
      significance: 'Mỗi năm, chiến dịch tập trung vào một vấn đề về nước và vệ sinh, từ bảo vệ nguồn nước đến khả năng tiếp cận nước sạch. Chủ đề cụ thể thay đổi theo năm.',
    },
    sources: [{ publisher: 'Liên Hợp Quốc', title: 'World Water Day', url: 'https://www.un.org/en/yearbook/article/happy-world-water-day' }],
  },
  {
    id: 'vietnam-doctors-day', title: 'Ngày Thầy thuốc Việt Nam', category: 'commemoration',
    rule: { type: 'solar_fixed', month: 2, day: 27, startYear: 1985 },
    description: 'Ngày Thầy thuốc Việt Nam tôn vinh bác sĩ, điều dưỡng và những người làm công tác y tế. Dịp này gắn với bức thư Chủ tịch Hồ Chí Minh gửi Hội nghị cán bộ y tế năm 1955.', sortOrder: 51,
    details: {
      origin: 'Ngày kỷ niệm gắn với bức thư Chủ tịch Hồ Chí Minh gửi Hội nghị cán bộ y tế ngày 27/2/1955. Ngày 27/2 hằng năm được chọn làm Ngày Thầy thuốc Việt Nam từ năm 1985.',
      significance: 'Dịp này ghi nhận công việc chăm sóc sức khỏe của đội ngũ y tế và nhắc đến trách nhiệm chuyên môn, đạo đức trong nghề.',
    },
    sources: [
      { publisher: 'Bộ Y tế – Cục Dân số', title: 'Chúc mừng Ngày Thầy thuốc Việt Nam 27/02', url: 'https://vnpa.moh.gov.vn/chuc-mung-ngay-thay-thuoc-viet-nam-27-02/' },
      { publisher: 'Hội đồng Bộ trưởng', title: 'Quyết định 39-HĐBT về Ngày Thầy thuốc Việt Nam', url: 'https://thuvienphapluat.vn/van-ban/The-thao-Y-te/Quyet-dinh-39-HDBT-ngay-Thay-thuoc-Viet-Nam-17756.aspx' },
    ],
  },
  {
    id: 'vietnam-book-day-legacy', title: 'Ngày Sách Việt Nam', category: 'commemoration',
    rule: { type: 'solar_fixed', month: 4, day: 21, startYear: 2014, endYear: 2021 },
    description: 'Từ năm 2014 đến năm 2021, ngày 21/4 được gọi là Ngày Sách Việt Nam. Dịp này tôn vinh sách, người làm sách và khuyến khích thói quen đọc trong cộng đồng.', sortOrder: 52,
    details: {
      origin: 'Ngày Sách Việt Nam được chọn theo quyết định năm 2014. Tên gọi này được sử dụng đến năm 2021, trước khi đổi thành Ngày Sách và Văn hóa đọc Việt Nam.',
      significance: 'Ngày kỷ niệm khuyến khích đọc sách và ghi nhận vai trò của xuất bản, thư viện, nhà trường cùng những người đưa sách đến bạn đọc.',
    },
    sources: [{ publisher: 'Thủ tướng Chính phủ', title: 'Quyết định 284/QĐ-TTg về Ngày Sách Việt Nam', url: 'https://vanban.chinhphu.vn/default.aspx?docid=172490&pageid=27160' }],
  },
  {
    id: 'vietnam-book-reading-culture-day', title: 'Ngày Sách và Văn hóa đọc Việt Nam', category: 'commemoration',
    rule: { type: 'solar_fixed', month: 4, day: 21, startYear: 2022 },
    description: 'Từ năm 2022, ngày 21/4 mang tên Ngày Sách và Văn hóa đọc Việt Nam. Dịp này khuyến khích đọc sách trong gia đình, trường học và cộng đồng, đồng thời ghi nhận những người góp phần đưa sách đến với bạn đọc.', sortOrder: 52,
    details: {
      origin: 'Tên gọi hiện nay được dùng từ năm 2022, kế tiếp Ngày Sách Việt Nam. Ngày 21/4 vẫn được giữ làm mốc kỷ niệm.',
      significance: 'Ngày này hướng sự chú ý đến việc duy trì thói quen đọc và tạo cơ hội để người dân tiếp cận sách ở nhiều môi trường khác nhau.',
      customs: 'Thư viện, trường học, nhà xuất bản và địa phương thường tổ chức giới thiệu sách, giao lưu tác giả hoặc hoạt động khuyến đọc.',
    },
    sources: [
      { publisher: 'Thủ tướng Chính phủ', title: 'Quyết định 1862/QĐ-TTg về Ngày Sách và Văn hóa đọc Việt Nam', url: 'https://vanban.chinhphu.vn/default.aspx?docid=204408&pageid=27160' },
      { publisher: 'Thủ tướng Chính phủ', title: 'Quyết định 284/QĐ-TTg về Ngày Sách Việt Nam', url: 'https://vanban.chinhphu.vn/default.aspx?docid=172490&pageid=27160' },
    ],
  },
  {
    id: 'reunification-day', title: 'Ngày Giải phóng miền Nam, thống nhất đất nước', category: 'official_holiday',
    rule: { type: 'solar_fixed', month: 4, day: 30 },
    description: 'Ngày 30/4/1975, Chiến dịch Hồ Chí Minh kết thúc với sự kiện xe tăng tiến vào Dinh Độc Lập, mở ra thời kỳ thống nhất đất nước. Đây là ngày nghỉ lễ chính thức tại Việt Nam.', sortOrder: 80,
    details: {
      origin: 'Ngày 30/4/1975, chính quyền Việt Nam Cộng hòa sụp đổ sau khi lực lượng cách mạng tiến vào Dinh Độc Lập tại Sài Gòn. Sự kiện đánh dấu kết thúc chiến tranh ở miền Nam.',
      significance: 'Ngày kỷ niệm gắn với việc chấm dứt chia cắt đất nước và tiến trình thống nhất Việt Nam sau chiến tranh.',
      customs: 'Trên cả nước thường có lễ kỷ niệm, hoạt động văn hóa và treo cờ; nhiều người cũng dành dịp nghỉ để thăm gia đình hoặc đi lại.',
    },
    sources: [
      { publisher: 'Chính phủ Việt Nam', title: 'Bộ luật Lao động 45/2019/QH14, Điều 112', url: 'https://vanban.chinhphu.vn/?docid=198540&pageid=27160' },
      { publisher: 'Cổng Thông tin điện tử Chính phủ', title: '30/4 – Đất nước trọn niềm vui', url: 'https://baochinhphu.vn/30-4-dat-nuoc-tron-niem-vui-10225042906314326.htm' },
    ],
  },
  {
    id: 'international-workers-day', title: 'Ngày Quốc tế Lao động', category: 'official_holiday',
    rule: { type: 'solar_fixed', month: 5, day: 1 },
    description: 'Ngày Quốc tế Lao động gắn với phong trào công nhân đấu tranh cho quyền lợi và ngày làm việc tám giờ. Tại Việt Nam, đây là ngày nghỉ lễ chính thức.', sortOrder: 90,
    details: {
      origin: 'Ngày 1/5 gắn với phong trào công nhân quốc tế cuối thế kỷ XIX, đặc biệt là cuộc đấu tranh đòi ngày làm việc tám giờ tại Hoa Kỳ năm 1886. Ngày kỷ niệm được phong trào công nhân quốc tế xác lập sau đó.',
      significance: 'Dịp này ghi nhận đóng góp của người lao động và lịch sử đấu tranh cho quyền lợi trong công việc.',
    },
    sources: [
      { publisher: 'Chính phủ Việt Nam', title: 'Bộ luật Lao động 45/2019/QH14, Điều 112', url: 'https://vanban.chinhphu.vn/?docid=198540&pageid=27160' },
      { publisher: 'Cổng Thông tin điện tử Chính phủ', title: 'Ngày Quốc tế Lao động 1/5: Lịch sử và ý nghĩa', url: 'https://baochinhphu.vn/ngay-quoc-te-lao-dong-1-5-lich-su-va-y-nghia-102220394.htm' },
    ],
  },
  {
    id: 'international-childrens-day', title: 'Ngày Quốc tế Thiếu nhi', category: 'international',
    rule: { type: 'solar_fixed', month: 6, day: 1 },
    description: 'Ngày Quốc tế Thiếu nhi dành sự quan tâm đến quyền được chăm sóc, học tập và vui chơi của trẻ em. Ở Việt Nam, dịp này thường có hoạt động dành cho thiếu nhi và gia đình.', sortOrder: 100,
    details: {
      significance: 'Ngày này hướng sự quan tâm đến sức khỏe, học tập, vui chơi và sự an toàn của trẻ em. Ngày 1/6 được nhiều quốc gia kỷ niệm, nhưng không phải ngày thiếu nhi chung duy nhất trên thế giới.',
      customs: 'Ở Việt Nam, trường học, địa phương và gia đình thường tổ chức vui chơi hoặc tặng quà cho trẻ em.',
    },
    sources: [{ publisher: 'Ủy ban nhân dân quận Ba Đình, Hà Nội', title: 'Nguồn gốc và ý nghĩa Ngày Quốc tế Thiếu nhi 1/6', url: 'https://badinh.hanoi.gov.vn/tin-tuc-su-kien-noi-bat/nguon-goc-va-y-nghia-ngay-quoc-te-thieu-nhi-1-6-2800260601104336119.htm' }],
  },
  {
    id: 'doan-ngo', title: 'Tết Đoan Ngọ', category: 'traditional',
    rule: { type: 'lunar_fixed', month: 5, day: 5, leapMonthPolicy: 'regular_only' },
    description: 'Tết Đoan Ngọ, còn gọi là Tết Đoan Dương, thường gắn với rượu nếp, trái cây đầu mùa và lễ cúng gia tiên ở Việt Nam.', sortOrder: 110,
    details: {
      aliases: ['Tết Đoan Dương'],
      significance: 'Đoan Ngọ là tiết lễ giữa năm theo lịch âm. Tên gọi Đoan Dương cũng xuất hiện trong tư liệu về nghi lễ cung đình triều Nguyễn.',
      customs: 'Tư liệu về triều Nguyễn ghi các nghi lễ cung đình và lễ vật của tiết Đoan Dương. Trong dân gian, rượu nếp, trái cây và lễ cúng gia tiên vẫn là những nét quen thuộc; cách thực hành tùy vùng.',
    },
    wikipediaUrl: 'https://vi.wikipedia.org/wiki/T%E1%BA%BFt_%C4%90oan_Ng%E1%BB%8D',
    sources: [{ publisher: 'Bộ Văn hóa, Thể thao và Du lịch', title: 'Khám phá nét đẹp Tết Đoan Ngọ', url: 'https://bvhttdl.gov.vn/Pages/chi-tiet.aspx?url=%2Fkham-pha-net-dep-tet-doan-ngo-qua-trung-bay-chuyen-de-tai-hoang-thanh-thang-long.htm' }],
  },
  {
    id: 'vu-lan', title: 'Lễ Vu Lan', category: 'traditional',
    rule: { type: 'lunar_fixed', month: 7, day: 15, leapMonthPolicy: 'regular_only' },
    description: 'Vu Lan là lễ báo hiếu trong Phật giáo, diễn ra vào Rằm tháng Bảy. Dịp này nhắc mỗi người tri ân cha mẹ và tổ tiên qua nghi lễ tại chùa, việc thăm hỏi và những hành động sẻ chia.', sortOrder: 29,
    details: {
      aliases: ['Lễ Báo hiếu'],
      origin: 'Tên Vu Lan bắt nguồn từ tiếng Phạn “Ullambana”, qua thuật ngữ Vu Lan Bồn trong kinh điển Phật giáo. Tại Việt Nam, lễ gắn với việc tưởng niệm và báo hiếu.',
      significance: 'Vu Lan đề cao lòng hiếu kính và sự biết ơn đối với cha mẹ, tổ tiên. Dịp này cùng ngày với tiết Trung Nguyên nhưng có nền tảng riêng trong Phật giáo.',
      customs: 'Nghi lễ tại chùa có thể gồm tụng kinh, cầu nguyện và các hoạt động thiện nguyện. Cách tổ chức thay đổi theo từng cộng đồng.',
    },
    sources: [{ publisher: 'Ủy ban Nhà nước về người Việt Nam ở nước ngoài', title: 'Ý nghĩa của ngày lễ Vu Lan và pháp bố thí của Phật giáo', url: 'https://scov.gov.vn/ban-sac-van-hoa/gioi-thieu-ban-sac-van-hoa/y-nghia-cua-ngay-le-vu-lan-va-phap-bo-thi-cua-phat-giao.html' }],
  },
  {
    id: 'trung-nguyen', title: 'Tết Trung Nguyên', category: 'traditional',
    rule: { type: 'lunar_fixed', month: 7, day: 15, leapMonthPolicy: 'regular_only' },
    description: 'Trung Nguyên là tiết lễ Đạo giáo vào Rằm tháng Bảy, về sau cùng ngày với Lễ Vu Lan trong Phật giáo. Ở Việt Nam, các nghi thức Trung Nguyên, Vu Lan và Xá tội vong nhân giao thoa nhưng không phải một dịp duy nhất.', sortOrder: 30,
    details: {
      origin: 'Trong Đạo giáo, Trung Nguyên là một trong ba tiết Thượng Nguyên, Trung Nguyên và Hạ Nguyên, lần lượt vào Rằm tháng Giêng, tháng Bảy và tháng Mười.',
      significance: 'Tại Việt Nam, ngày này cùng Rằm tháng Bảy với Vu Lan và tục Xá tội vong nhân. Các truyền thống đã ảnh hưởng lẫn nhau nhưng có nghi thức và cách lý giải riêng.',
    },
    sources: [
      { publisher: 'Cục Văn thư và Lưu trữ nhà nước', title: 'Tiết Trung nguyên, Vu lan, Xá tội vong nhân: nguồn gốc và tâm thức dân gian Việt', url: 'https://archives.org.vn/gioi-thieu-tai-lieu-nghiep-vu/tet-trung-nguyen-vu-lan-xa-toi-vog-nhan-nguon-goc-va-tam-thuc-dan-gian-viet.htm' },
      { publisher: 'Tuổi Trẻ', title: 'Tết Trung nguyên, Vu Lan, Xá tội vong nhân trong tín ngưỡng Việt', url: 'https://tuoitre.vn/dulichtphcm/tet-trung-nguyen-vu-lan-xa-toi-vong-nhan-trong-tin-nguong-viet-10759329.htm' },
    ],
  },
  {
    id: 'that-tich', title: 'Thất Tịch (Lễ Ngâu)', category: 'traditional',
    rule: { type: 'lunar_fixed', month: 7, day: 7, leapMonthPolicy: 'regular_only' },
    description: 'Thất Tịch gắn với truyện dân gian Ngưu Lang – Chức Nữ và còn được gọi là Lễ Ngâu. Ở Việt Nam, ngày này cũng gắn với mùa mưa ngâu trong dân gian; đây không phải ngày nghỉ lễ.', sortOrder: 28,
    details: {
      aliases: ['Lễ Ngâu'],
      origin: 'Truyện Ngưu Lang – Chức Nữ là truyền thuyết được lưu truyền ở nhiều cộng đồng Đông Á, với các dị bản khác nhau. Không có căn cứ để xem câu chuyện là sự kiện lịch sử.',
      significance: 'Trong văn hóa Việt, “mưa ngâu” là cách gọi những đợt mưa giữa mùa hè, thường được liên hệ với truyện Thất Tịch.',
    },
    sources: [
      { publisher: 'Đài Tiếng nói Việt Nam', title: 'Thất tịch 2026 là ngày nào, thứ mấy?', url: 'https://vov.vn/doi-song/that-tich-2026-la-ngay-nao-thu-may-post1324704.vov' },
      { publisher: 'Đài Truyền hình Việt Nam (theo TTXVN)', title: 'Nguồn gốc và ý nghĩa của lễ Thất Tịch', url: 'https://vtv.vn/doi-song/nguon-goc-va-y-nghia-cua-le-that-tich-2021081414364009.htm' },
      { publisher: 'Việt Nam học – Kỷ yếu Hội thảo Quốc tế lần thứ Tư', title: 'Lễ hội cung đình triều Nguyễn và vấn đề khai thác các lễ hội cung đình', url: 'https://dulieu.itrithuc.vn/media/dataset/2020_08/ky_05778.pdf' },
    ],
  },
  {
    id: 'trung-thap', title: 'Tết Trùng Thập', category: 'traditional',
    rule: { type: 'lunar_fixed', month: 10, day: 10, leapMonthPolicy: 'regular_only' },
    description: 'Tết Trùng Thập diễn ra ngày mùng 10 tháng Mười âm lịch, còn gọi là Tết Song Thập. Tư liệu làng xã ghi nhận những cách tổ chức khác nhau, từ lễ riêng đến dịp dâng cơm mới; ngày này khác Hạ Nguyên vào Rằm tháng Mười.', sortOrder: 30,
    details: {
      aliases: ['Tết Song Thập'],
      significance: 'Nghiên cứu văn bản tục lệ cho thấy Trùng Thập không có một cách thực hành thống nhất: có làng làm thành lễ riêng, nơi khác lại tổ chức cơm mới vào dịp này.',
      customs: 'Một số nhà thầy thuốc và người hành nghề nghi lễ được ghi nhận có tổ chức lễ vào dịp này. Ở một số làng, người dân dâng sản vật mới thu hoạch để tạ ơn mùa màng. Những tục này không đồng nghĩa hoàn toàn với Thường Tân hay Cơm mới; “tết thầy thuốc” xưa cũng khác Ngày Thầy thuốc Việt Nam 27/2 hiện nay.',
    },
    sources: [
      { publisher: 'Tạp chí Khoa học xã hội Việt Nam', title: 'Đào Phương Chi, “Nghiên cứu tiết Thường tân và các tiết lễ liên quan”, số 12 (204), 2024', url: 'https://vjol.info.vn/index.php/khxhvn/article/download/108698/91296/' },
      { publisher: 'Báo Giáo dục và Thời đại', title: 'Người Việt đón... 10 cái Tết trong năm', url: 'https://giaoducthoidai.vn/nguoi-viet-don-10-cai-tet-trong-nam-post464134.html' },
      { publisher: 'Tạp chí Khoa học Xã hội', title: 'Tín ngưỡng Thần Nông qua các tiết lễ thờ cúng trong năm', url: 'https://vjol.info.vn/index.php/khxh/article/download/57555/54282/' },
    ],
  },
  {
    id: 'ha-nguyen', title: 'Tết Hạ Nguyên (Rằm tháng Mười)', category: 'traditional',
    rule: { type: 'lunar_fixed', month: 10, day: 15, leapMonthPolicy: 'regular_only' },
    description: 'Hạ Nguyên là tiết lễ vào Rằm tháng Mười âm lịch, nằm trong bộ ba Thượng Nguyên, Trung Nguyên và Hạ Nguyên. Dịp này được một số nơi gắn với lễ vật mùa vụ và việc tưởng nhớ tổ tiên; khác ngày Trùng Thập 10/10.', sortOrder: 31,
    details: {
      aliases: ['Rằm tháng Mười'],
      origin: 'Trong cách chia lễ tiết của lịch cũ, ba ngày rằm đầu, giữa và cuối mùa được gọi là Thượng Nguyên, Trung Nguyên và Hạ Nguyên.',
      significance: 'Hạ Nguyên được tổ chức vào Rằm tháng Mười. Tư liệu triều Nguyễn ghi lễ tiết này trong các dịp cúng ở miếu và điện; phong tục dân gian về sau thay đổi theo nơi.',
      customs: 'Ở một số cộng đồng, ngày rằm gắn với lễ vật mùa vụ hoặc lễ cúng tại gia. Đây là ngày 15/10 âm lịch, không phải Tết Trùng Thập ngày 10/10.',
    },
    sources: [
      { publisher: 'Cổng Thông tin điện tử Chính phủ', title: 'Mùa xuân và Tết Nguyên tiêu', url: 'https://baochinhphu.vn/mua-xuan-va-tet-nguyen-tieu-102138919.htm' },
      { publisher: 'Tạp chí Khoa học Xã hội', title: 'Tín ngưỡng Thần Nông qua các tiết lễ thờ cúng trong năm', url: 'https://vjol.info.vn/index.php/khxh/article/download/57555/54282/' },
    ],
  },
  {
    id: 'world-environment-day', title: 'Ngày Môi trường Thế giới', category: 'international',
    rule: { type: 'solar_fixed', month: 6, day: 5 },
    description: 'Ngày Môi trường Thế giới là dịp Liên Hợp Quốc đưa một vấn đề môi trường cấp thiết vào tâm điểm thảo luận. Mỗi năm thường có một chủ đề để cộng đồng và tổ chức cùng hưởng ứng.', sortOrder: 120,
    details: {
      origin: 'Ngày Môi trường Thế giới được thiết lập sau Hội nghị Liên Hợp Quốc về Môi trường Con người năm 1972 và được tổ chức lần đầu năm 1973.',
      significance: 'Đây là dịp vận động cộng đồng và chính phủ chú ý đến một thách thức môi trường cụ thể, với chủ đề được lựa chọn theo từng năm.',
    },
    sources: [{ publisher: 'Chương trình Môi trường Liên Hợp Quốc', title: 'International Days', url: 'https://www.unep.org/en/international-days' }],
  },
  {
    id: 'vietnam-press-day', title: 'Ngày Báo chí Cách mạng Việt Nam', category: 'commemoration',
    rule: { type: 'solar_fixed', month: 6, day: 21, startYear: 1925 },
    description: 'Ngày Báo chí Cách mạng Việt Nam gắn với số đầu tiên của báo Thanh Niên, ra ngày 21/6/1925 dưới sự sáng lập của Nguyễn Ái Quốc. Dịp này ghi nhận vai trò của báo chí cách mạng trong lịch sử Việt Nam.', sortOrder: 130,
    details: {
      origin: 'Báo Thanh Niên ra số đầu tiên ngày 21/6/1925 tại Quảng Châu, do Nguyễn Ái Quốc sáng lập và trực tiếp chỉ đạo.',
      significance: 'Ngày kỷ niệm nhắc đến lịch sử báo chí cách mạng và vai trò của báo chí trong truyền tải thông tin, phản ánh đời sống xã hội.',
    },
    sources: [{ publisher: 'Cổng Thông tin điện tử Chính phủ', title: 'Báo chí cách mạng Việt Nam giai đoạn 1925-1945', url: 'https://baochinhphu.vn/bao-chi-cach-mang-viet-nam-giai-doan-1925-1945-luc-luong-chu-luc-tien-phong-vu-khi-sac-ben-trong-cong-tac-tu-tuong-van-hoa-cua-dang-102250617164503349.htm' }],
  },
  {
    id: 'vietnam-red-cross-founding-day', title: 'Ngày thành lập Hội Chữ thập đỏ Việt Nam', category: 'commemoration',
    rule: { type: 'solar_fixed', month: 11, day: 23, startYear: 1946 },
    description: 'Hội Chữ thập đỏ Việt Nam được thành lập ngày 23/11/1946. Ngày kỷ niệm gắn với hoạt động nhân đạo, cứu trợ và chăm sóc những người cần giúp đỡ của Hội.', sortOrder: 32,
    details: {
      origin: 'Đại hội đại biểu đầu tiên diễn ra ngày 23/11/1946 tại đình làng Thanh Ấm, Vân Đình. Đại hội suy tôn Chủ tịch Hồ Chí Minh làm chủ tịch danh dự và bầu bác sĩ Vũ Đình Tụng làm hội trưởng đầu tiên.',
      significance: 'Hội tổ chức hoạt động nhân đạo, cứu trợ khẩn cấp và hỗ trợ những người có hoàn cảnh khó khăn.',
    },
    sources: [{ publisher: 'Hội Chữ thập đỏ Việt Nam', title: 'Lịch sử Hội Chữ thập đỏ Việt Nam', url: 'https://www.redcross.org.vn/gioi-thieu/lich-su' }],
  },
  {
    id: 'vietnam-law-day', title: 'Ngày Pháp luật Việt Nam', category: 'commemoration',
    rule: { type: 'solar_fixed', month: 11, day: 9, startYear: 2013 },
    description: 'Ngày Pháp luật Việt Nam nhắc đến vai trò của Hiến pháp và pháp luật trong đời sống xã hội. Ngày 9/11 được chọn gắn với mốc ban hành Hiến pháp đầu tiên của nước Việt Nam Dân chủ Cộng hòa năm 1946.', sortOrder: 33,
    details: {
      origin: 'Ngày 9/11/1946, Quốc hội thông qua bản Hiến pháp đầu tiên của nước Việt Nam Dân chủ Cộng hòa. Ngày Pháp luật Việt Nam được tổ chức hằng năm từ 2013.',
      significance: 'Dịp này tập trung giới thiệu pháp luật, khuyến khích tìm hiểu và tôn trọng Hiến pháp, pháp luật trong đời sống.',
    },
    sources: [{ publisher: 'Bộ Tư pháp', title: 'Luật Phổ biến, giáo dục pháp luật, Điều 8', url: 'https://vbpl.moj.gov.vn/botuphap/Pages/vbpq-toanvan.aspx?ItemID=27698' }],
  },
  {
    id: 'vietnam-communist-party-founding-day', title: 'Ngày thành lập Đảng Cộng sản Việt Nam', category: 'commemoration',
    rule: { type: 'solar_fixed', month: 2, day: 3, startYear: 1930 },
    description: 'Ngày 3/2 kỷ niệm hội nghị hợp nhất các tổ chức cộng sản đầu năm 1930, sự kiện dẫn tới việc thành lập Đảng Cộng sản Việt Nam. Đây là mốc lớn trong lịch sử chính trị hiện đại của đất nước.', sortOrder: 34,
    details: {
      origin: 'Hội nghị hợp nhất các tổ chức cộng sản họp đầu năm 1930 dưới sự chủ trì của Nguyễn Ái Quốc. Ngày 3/2 được chọn làm mốc kỷ niệm sự kiện thành lập Đảng.',
      significance: 'Đây là dấu mốc hình thành một tổ chức chính trị có vai trò trung tâm trong lịch sử Việt Nam thế kỷ XX.',
    },
    sources: [{ publisher: 'Cổng Thông tin điện tử Chính phủ', title: 'Đảng Cộng sản Việt Nam qua các kỳ Đại hội', url: 'https://baochinhphu.vn/dang-cong-san-viet-nam-qua-cac-ky-dai-hoi-102286517.htm' }],
  },
  {
    id: 'vietnam-youth-union-founding-day', title: 'Ngày thành lập Đoàn TNCS Hồ Chí Minh', category: 'commemoration',
    rule: { type: 'solar_fixed', month: 3, day: 26, startYear: 1931 },
    description: 'Ngày 26/3/1931 đánh dấu sự ra đời của tổ chức Đoàn Thanh niên Cộng sản Hồ Chí Minh, tổ chức chính trị - xã hội của thanh niên Việt Nam. Dịp kỷ niệm gắn với hoạt động giáo dục và tình nguyện của đoàn viên.', sortOrder: 35,
    details: {
      origin: 'Tổ chức Đoàn xác định ngày 26/3/1931 là ngày thành lập. Tên gọi và cơ cấu của tổ chức đã thay đổi qua các giai đoạn lịch sử.',
      significance: 'Dịp kỷ niệm nhắc đến lịch sử tổ chức thanh niên và các hoạt động giáo dục, tình nguyện, sinh hoạt cộng đồng của đoàn viên.',
    },
    sources: [{ publisher: 'Cổng Thông tin điện tử Chính phủ', title: 'Phát hành bộ tem 80 năm thành lập Đoàn', url: 'https://baochinhphu.vn/phat-hanh-bo-tem-80-nam-thanh-lap-doan-10269146.htm' }],
  },
  {
    id: 'ho-chi-minh-birthday', title: 'Ngày sinh Chủ tịch Hồ Chí Minh', category: 'commemoration',
    rule: { type: 'solar_fixed', month: 5, day: 19, startYear: 1890 },
    description: 'Ngày 19/5/1890 là ngày sinh Chủ tịch Hồ Chí Minh. Hằng năm, người dân tưởng niệm và tìm hiểu về cuộc đời, sự nghiệp cùng những dấu ấn của ông trong lịch sử Việt Nam hiện đại.', sortOrder: 36,
    sources: [{ publisher: 'Cổng Thông tin điện tử Chính phủ', title: 'Chủ tịch nước dâng hương tưởng nhớ Chủ tịch Hồ Chí Minh', url: 'https://baochinhphu.vn/chu-tich-nuoc-nguyen-xuan-phuc-dang-huong-tuong-nho-chu-tich-ho-chi-minh-102292572.htm' }],
  },
  {
    id: 'vietnam-science-technology-day', title: 'Ngày Khoa học và Công nghệ Việt Nam', category: 'commemoration',
    rule: { type: 'solar_fixed', month: 5, day: 18, startYear: 2014, endYear: 2025 },
    description: 'Từ năm 2014 đến kỳ kỷ niệm tháng 5/2025, ngày 18/5 mang tên Ngày Khoa học và Công nghệ Việt Nam. Dịp này tôn vinh đóng góp của giới nghiên cứu và khuyến khích ứng dụng khoa học vào đời sống.', sortOrder: 53,
    sources: [
      { publisher: 'Quốc hội', title: 'Luật Khoa học và Công nghệ 29/2013/QH13, Điều 7', url: 'https://vbpl.moj.gov.vn/bovanhoathethao/Pages/vbpq-toanvan.aspx?ItemID=32522' },
      { publisher: 'Bộ Khoa học và Công nghệ', title: 'Hướng dẫn tổ chức kỷ niệm Ngày KH&CN Việt Nam năm 2023', url: 'https://www.most.gov.vn/Images/editor/files/CV%20961_BKHCN_VP%20_7_4.pdf' },
    ],
  },
  {
    id: 'vietnam-science-technology-innovation-day', title: 'Ngày Khoa học, Công nghệ và Đổi mới sáng tạo Việt Nam', category: 'commemoration',
    rule: { type: 'solar_fixed', month: 5, day: 18, startYear: 2026 },
    description: 'Từ năm 2026, ngày 18/5 mang tên Ngày Khoa học, Công nghệ và Đổi mới sáng tạo Việt Nam. Dịp này ghi nhận đóng góp của hoạt động nghiên cứu, ứng dụng công nghệ và đổi mới sáng tạo.', sortOrder: 53,
    sources: [
      { publisher: 'Quốc hội', title: 'Luật 93/2025/QH15, Điều 7', url: 'https://chinhphu.vn/?classid=1&docid=214603&orggroupid=1&pageid=27160' },
      { publisher: 'Cục Điện lực - Bộ Công Thương', title: 'Ngày 18/5 chính thức trở thành Ngày Khoa học, Công nghệ và Đổi mới sáng tạo Việt Nam', url: 'https://eav.gov.vn/d/vi-VN/news-o/Ngay-185-chinh-thuc-tro-thanh-Ngay-Khoa-hoc-Cong-nghe-va-Doi-moi-sang-tao-Viet-Nam-60-38-59081' },
    ],
  },
  {
    id: 'dien-bien-phu-victory-day', title: 'Ngày Chiến thắng Điện Biên Phủ', category: 'commemoration',
    rule: { type: 'solar_fixed', month: 5, day: 7, startYear: 1954 },
    description: 'Chiến dịch Điện Biên Phủ kết thúc ngày 7/5/1954 với thắng lợi của quân đội Việt Nam. Chiến thắng này góp phần quyết định vào việc chấm dứt chiến tranh Đông Dương lần thứ nhất.', sortOrder: 37,
    details: {
      origin: 'Sau 56 ngày đêm chiến đấu, quân đội Việt Nam giành thắng lợi tại Điện Biên Phủ ngày 7/5/1954.',
      significance: 'Chiến thắng góp phần dẫn tới Hiệp định Genève năm 1954 và kết thúc chiến tranh Đông Dương lần thứ nhất.',
    },
    sources: [{ publisher: 'Cổng Thông tin điện tử Chính phủ', title: 'Kỷ niệm Chiến thắng Điện Biên Phủ', url: 'https://baochinhphu.vn/ky-niem-57-nam-chien-thang-dien-bien-phu-7-5-1954-7-5-2011-chien-thang-lich-su-dien-bien-phu-vang-mai-khuc-anh-hung-ca-10274697.htm' }],
  },
  {
    id: 'vietnam-family-day', title: 'Ngày Gia đình Việt Nam', category: 'commemoration',
    rule: { type: 'solar_fixed', month: 6, day: 28, startYear: 2001 },
    description: 'Ngày Gia đình Việt Nam tôn vinh mái ấm và những giá trị gắn kết các thế hệ. Dịp này cũng nhắc đến việc chăm sóc, giáo dục trẻ em và xây dựng quan hệ gia đình bình đẳng, hạnh phúc.', sortOrder: 140,
    details: {
      origin: 'Ngày 28/6 được chọn làm Ngày Gia đình Việt Nam từ năm 2001, trong khuôn khổ các hoạt động về công tác gia đình.',
      significance: 'Dịp này hướng sự chú ý đến vai trò của gia đình trong đời sống mỗi người và cộng đồng, đồng thời đề cao sự bình đẳng, tiến bộ và hạnh phúc giữa các thành viên.',
      customs: 'Các hoạt động thường gồm gặp gỡ, giao lưu văn hóa, tuyên truyền và sinh hoạt cộng đồng; hình thức tổ chức thay đổi theo từng địa phương và năm.',
    },
    sources: [
      { publisher: 'Chính phủ Việt Nam', title: 'Quyết định 72/2001/QĐ-TTg', url: 'https://vanban.chinhphu.vn/default.aspx?docid=8912&pageid=27160' },
      { publisher: 'Cổng Thông tin điện tử Chính phủ', title: 'Triển khai nhiều hoạt động kỷ niệm Ngày Gia đình Việt Nam 28/6', url: 'https://baochinhphu.vn/trien-khai-nhieu-hoat-dong-ky-niem-ngay-gia-dinh-viet-nam-28-6-102124615.htm' },
    ],
  },
  {
    id: 'war-invalids-martyrs-day', title: 'Ngày Thương binh - Liệt sĩ', category: 'commemoration',
    rule: { type: 'solar_fixed', month: 7, day: 27, startYear: 1947 },
    description: 'Ngày Thương binh - Liệt sĩ tưởng nhớ những người đã hy sinh và tri ân thương binh, bệnh binh cùng các gia đình có công với đất nước. Đây là dịp nhắc lại sự khởi đầu của phong trào chăm lo thương binh, liệt sĩ năm 1947.', sortOrder: 150,
    details: {
      origin: 'Ngày 27/7 bắt nguồn từ cuộc họp năm 1947 về công tác thương binh, liệt sĩ, khi ngày này được chọn làm Ngày Thương binh toàn quốc.',
      significance: 'Dịp kỷ niệm thể hiện sự tưởng nhớ và tri ân đối với người đã hy sinh, bị thương trong chiến tranh và những gia đình chịu mất mát.',
      customs: 'Hoạt động thường có thăm hỏi gia đình chính sách, dâng hương tại nghĩa trang liệt sĩ và chăm sóc người có công.',
    },
    sources: [{ publisher: 'Cổng Thông tin điện tử Chính phủ', title: 'Ngày 27/7: Một ngày để biết ơn, một đời để tiếp bước', url: 'https://xaydungchinhsach.chinhphu.vn/ngay-27-7-mot-ngay-de-biet-on-mot-doi-de-tiep-buoc-119250727102534219.htm' }],
  },
  {
    id: 'august-revolution-day', title: 'Ngày Cách mạng Tháng Tám', category: 'commemoration',
    rule: { type: 'solar_fixed', month: 8, day: 19, startYear: 1945 },
    description: 'Ngày 19/8/1945, cuộc khởi nghĩa giành chính quyền tại Hà Nội giành thắng lợi, mở đầu cao trào cách mạng trên cả nước. Mốc này là một phần của Cách mạng Tháng Tám năm 1945.', sortOrder: 160,
    details: {
      origin: 'Ngày kỷ niệm gắn với thắng lợi của cuộc khởi nghĩa tại Hà Nội ngày 19/8/1945; các cuộc khởi nghĩa ở nhiều địa phương diễn ra trong những ngày tiếp theo.',
      significance: 'Cách mạng Tháng Tám dẫn tới sự ra đời của nước Việt Nam Dân chủ Cộng hòa vào tháng 9/1945.',
    },
    sources: [{ publisher: 'Cổng Thông tin điện tử Chính phủ', title: 'Khởi nghĩa giành chính quyền ở Hà Nội - Sự kiện đặc biệt trong Cách mạng tháng Tám 1945', url: 'https://baochinhphu.vn/khoi-nghia-gianh-chinh-quyen-o-ha-noi-su-kien-dac-biet-trong-cach-mang-thang-tam-1945-102277816.htm' }],
  },
  {
    id: 'national-day', title: 'Quốc khánh Việt Nam', category: 'official_holiday',
    rule: { type: 'solar_fixed', month: 9, day: 2 },
    description: 'Quốc khánh kỷ niệm ngày nước Việt Nam Dân chủ Cộng hòa ra đời. Ngày 2/9/1945, Chủ tịch Hồ Chí Minh đọc Tuyên ngôn Độc lập tại Quảng trường Ba Đình; đây là ngày nghỉ lễ chính thức ở Việt Nam.', sortOrder: 170,
    details: {
      origin: 'Ngày 2/9/1945, tại Ba Đình, Chủ tịch Hồ Chí Minh đọc Tuyên ngôn Độc lập, tuyên bố thành lập nước Việt Nam Dân chủ Cộng hòa.',
      significance: 'Quốc khánh đánh dấu sự ra đời của nhà nước Việt Nam độc lập sau Cách mạng Tháng Tám và là dịp kỷ niệm nền độc lập dân tộc.',
      customs: 'Trên cả nước thường diễn ra lễ kỷ niệm, hoạt động văn hóa và trang trí cờ; quy mô chương trình thay đổi theo từng năm.',
    },
    sources: [
      { publisher: 'Chính phủ Việt Nam', title: 'Bộ luật Lao động 45/2019/QH14, Điều 112', url: 'https://vanban.chinhphu.vn/?docid=198540&pageid=27160' },
      { publisher: 'Cổng Thông tin điện tử Chính phủ', title: 'Vẹn nguyên Lời thề Độc lập', url: 'https://baochinhphu.vn/ven-nguyen-loi-the-doc-lap-102226268.htm' },
    ],
  },
  {
    id: 'international-literacy-day', title: 'Ngày Quốc tế Xóa mù chữ', category: 'international',
    rule: { type: 'solar_fixed', month: 9, day: 8 },
    description: 'Ngày Quốc tế Xóa mù chữ nhấn mạnh rằng khả năng đọc, viết là nền tảng để tiếp cận tri thức và nhiều quyền khác. UNESCO tổ chức ngày này hằng năm từ 1967.', sortOrder: 180,
    details: {
      origin: 'UNESCO tổ chức kỳ kỷ niệm Ngày Quốc tế Xóa mù chữ đầu tiên vào năm 1967; từ đó ngày này được tổ chức hằng năm vào 8/9.',
      significance: 'Ngày này làm nổi bật vai trò của biết chữ đối với học tập suốt đời, cơ hội tham gia xã hội và việc tiếp cận các quyền cơ bản.',
    },
    sources: [{ publisher: 'UNESCO', title: 'International Literacy Day', url: 'https://www.unesco.org/en/days/literacy' }],
  },
  {
    id: 'international-day-of-peace', title: 'Ngày Quốc tế Hòa bình', category: 'international',
    rule: { type: 'solar_fixed', month: 9, day: 21 },
    description: 'Ngày Quốc tế Hòa bình là dịp nhấn mạnh việc xây dựng hòa bình và chấm dứt bạo lực. Liên Hợp Quốc chọn ngày 21/9 làm ngày ngừng bắn và bất bạo động trên toàn cầu.', sortOrder: 190,
    details: {
      origin: 'Đại hội đồng Liên Hợp Quốc lập ngày kỷ niệm này năm 1981; đến năm 2001, ngày 21/9 được ấn định hằng năm và gắn với lời kêu gọi ngừng bắn, bất bạo động.',
      significance: 'Dịp này khuyến khích giáo dục về hòa bình và sự hợp tác giữa cộng đồng, quốc gia.',
    },
    sources: [{ publisher: 'Liên Hợp Quốc', title: 'International Day of Peace', url: 'https://www.un.org/observances/international-day-peace' }],
  },
  {
    id: 'mid-autumn-festival', title: 'Tết Trung thu', category: 'traditional',
    rule: { type: 'lunar_fixed', month: 8, day: 15, leapMonthPolicy: 'regular_only' },
    description: 'Tết Trung thu diễn ra vào Rằm tháng Tám âm lịch, là dịp sum họp gia đình và vui chơi của trẻ em ở Việt Nam. Đèn lồng, bánh Trung thu và rước đèn là những hình ảnh quen thuộc.', sortOrder: 200,
    details: {
      aliases: ['Tết Trông Trăng', 'Tết Đoàn Viên'],
      significance: 'Ở Việt Nam, Trung thu thường hướng đến trẻ em và sự sum họp gia đình. Ý nghĩa và cách tổ chức có những khác biệt theo vùng miền.',
      customs: 'Trẻ em thường rước đèn, xem múa lân và phá cỗ; gia đình cùng ngắm trăng, chia bánh. Mỗi địa phương có thể giữ những nét riêng.',
    },
    wikipediaUrl: 'https://vi.wikipedia.org/wiki/T%E1%BA%BFt_Trung_thu',
    sources: [{ publisher: 'Ủy ban Nhà nước về người Việt Nam ở nước ngoài', title: 'Nguồn gốc và ý nghĩa của Rằm Trung thu trong văn hóa Việt', url: 'https://scov.gov.vn/cong-tac-doi-ngoai/ngoai-giao-van-hoa/nguon-goc-va-y-nghia-cua-ram-trung-thu-trong-van-hoa-viet.html' }],
  },
  {
    id: 'trung-cuu', title: 'Tết Trùng Cửu (Trùng Dương)', category: 'traditional',
    rule: { type: 'lunar_fixed', month: 9, day: 9, leapMonthPolicy: 'regular_only' },
    description: 'Lễ tiết vào mùng 9 tháng Chín âm lịch, có nguồn gốc từ Trung Hoa và dấu vết trong văn hóa Việt; hiện không được thực hành đồng đều ở mọi nơi.', sortOrder: 32,
    details: {
      aliases: ['Tết Trùng Dương'],
      significance: 'Tên Trùng Cửu nhắc đến số chín lặp lại trong ngày và tháng âm lịch. Lễ tiết này được ghi nhận trong giao lưu văn hóa Đông Á, nhưng không còn được thực hành phổ biến đồng đều ở Việt Nam.',
    },
    sources: [{ publisher: 'Đài Tiếng nói Việt Nam', title: 'Ý nghĩa những ngày Tết tính theo âm lịch', url: 'https://vov.vn/van-hoa-giai-tri/y-nghia-nhung-ngay-tet-tinh-theo-am-lich-198117.vov' }],
  },
  {
    id: 'hanoi-liberation-day', title: 'Ngày Giải phóng Thủ đô', category: 'commemoration',
    rule: { type: 'solar_fixed', month: 10, day: 10, startYear: 1954 },
    description: 'Ngày Giải phóng Thủ đô kỷ niệm sự kiện các đơn vị Quân đội nhân dân Việt Nam tiếp quản Hà Nội ngày 10/10/1954, sau khi Hiệp định Genève được ký kết.', sortOrder: 38,
    details: {
      origin: 'Sáng 10/10/1954, các đơn vị quân đội tiến vào tiếp quản Hà Nội theo các tuyến đã định. Sự kiện diễn ra sau khi quân Pháp rút khỏi thành phố.',
      significance: 'Ngày này đánh dấu việc Hà Nội được tiếp quản và trở thành thủ đô của nước Việt Nam Dân chủ Cộng hòa.',
    },
    sources: [{ publisher: 'Cổng Thông tin điện tử Chính phủ', title: 'Nhớ Ngày về lịch sử năm 1954', url: 'https://baochinhphu.vn/nho-ngay-ve-lich-su-nam-1954-102150746.htm' }],
  },
  {
    id: 'halloween', title: 'Halloween', category: 'international',
    rule: { type: 'solar_fixed', month: 10, day: 31 },
    description: 'Halloween diễn ra vào đêm 31/10, trước Lễ Các Thánh trong lịch Kitô giáo phương Tây. Ngày nay, nhiều nơi tổ chức hóa trang, trang trí bí ngô và hoạt động xin kẹo; đây không phải ngày nghỉ lễ ở Việt Nam.', sortOrder: 39,
    details: {
      origin: 'Halloween phát triển qua nhiều lớp truyền thống, trong đó có lễ Samhain của người Celt và các phong tục Kitô giáo dịp áp lễ Các Thánh. Lịch sử hình thành không quy về một nguồn duy nhất.',
      customs: 'Các hoạt động phổ biến gồm hóa trang, trang trí nhà cửa, khắc bí ngô và trẻ em đi xin kẹo. Hình thức tổ chức khác nhau giữa các quốc gia và cộng đồng.',
    },
    sources: [{ publisher: 'NASA Earth Observatory', title: 'Halloween History', url: 'https://science.nasa.gov/earth/earth-observatory/halloween-history-84643/' }],
  },
  {
    id: 'world-teachers-day', title: 'Ngày Nhà giáo Thế giới', category: 'international',
    rule: { type: 'solar_fixed', month: 10, day: 5 },
    description: 'Ngày Nhà giáo Thế giới ghi nhận đóng góp của giáo viên và nhấn mạnh điều kiện cần thiết để nghề dạy học phát triển. Ngày 5/10 gắn với khuyến nghị chung của ILO và UNESCO năm 1966 về vị thế nhà giáo.', sortOrder: 210,
    details: {
      origin: 'UNESCO tổ chức Ngày Nhà giáo Thế giới từ năm 1994, vào ngày kỷ niệm việc thông qua Khuyến nghị ILO/UNESCO năm 1966 về vị thế giáo viên.',
      significance: 'Ngày này tạo dịp nhìn lại vai trò của giáo viên, quyền lợi nghề nghiệp và điều kiện để họ hỗ trợ việc học của học sinh.',
    },
    sources: [{ publisher: 'UNESCO', title: 'World Teachers’ Day', url: 'https://www.unesco.org/en/days/teachers' }],
  },
  {
    id: 'vietnamese-womens-day', title: 'Ngày Phụ nữ Việt Nam', category: 'commemoration',
    rule: { type: 'solar_fixed', month: 10, day: 20, startYear: 1930 },
    description: 'Ngày Phụ nữ Việt Nam gắn với sự ra đời của Hội Liên hiệp Phụ nữ Việt Nam năm 1930. Đây là dịp ghi nhận đóng góp của phụ nữ trong gia đình và xã hội.', sortOrder: 220,
    details: {
      origin: 'Ngày 20/10/1930, tổ chức Hội Phụ nữ phản đế Việt Nam, tiền thân của Hội Liên hiệp Phụ nữ Việt Nam, được thành lập. Ngày này về sau trở thành dịp kỷ niệm phụ nữ Việt Nam.',
      significance: 'Dịp kỷ niệm tôn vinh đóng góp của phụ nữ và nhắc lại lịch sử hoạt động vì quyền lợi, vị thế của phụ nữ Việt Nam.',
      customs: 'Cơ quan, trường học, tổ chức và gia đình thường tổ chức gặp mặt hoặc gửi lời chúc; cách hưởng ứng mang tính xã hội, không phải nghi thức cố định.',
    },
    sources: [{ publisher: 'Hội Liên hiệp Phụ nữ Việt Nam', title: 'Hồ sơ về Hội Liên hiệp Phụ nữ Việt Nam', url: 'https://www.hoilhpn.org.vn/documents/253622/10806301/ST%2Bvan%2Bhoa%2Bto%2Bchuc%2BHoi%2BLHPNVN%2B-%2BB5.pdf/8d1f9aed-a9d1-4ce8-a5fc-643770a98307' }],
  },
  {
    id: 'world-childrens-day', title: 'Ngày Trẻ em Thế giới', category: 'international',
    rule: { type: 'solar_fixed', month: 11, day: 20, startYear: 1954 },
    description: 'Ngày Trẻ em Thế giới thúc đẩy quyền, phúc lợi và tiếng nói của trẻ em. Ngày 20/11 gắn với việc Liên Hợp Quốc thông qua Tuyên ngôn Quyền Trẻ em năm 1959 và Công ước Quyền Trẻ em năm 1989.', sortOrder: 230,
    details: {
      origin: 'Liên Hợp Quốc chọn ngày 20/11 làm Ngày Trẻ em Thế giới. Ngày này kỷ niệm hai dấu mốc về quyền trẻ em: Tuyên ngôn năm 1959 và Công ước năm 1989.',
      significance: 'Dịp này khuyến khích các quốc gia thúc đẩy quyền trẻ em và lắng nghe quan điểm của các em về những vấn đề ảnh hưởng đến mình.',
    },
    sources: [{ publisher: 'Liên Hợp Quốc', title: 'World Children’s Day: Background', url: 'https://www.un.org/en/observances/world-childrens-day/background' }],
  },
  {
    id: 'vietnam-national-unity-day', title: 'Ngày hội Đại đoàn kết toàn dân tộc', category: 'commemoration',
    rule: { type: 'solar_fixed', month: 11, day: 18, startYear: 2003 },
    description: 'Ngày hội Đại đoàn kết toàn dân tộc gắn với ngày thành lập Mặt trận Dân tộc Thống nhất Việt Nam năm 1930. Các khu dân cư thường gặp gỡ, nhìn lại hoạt động chung và biểu dương đóng góp của người dân.', sortOrder: 54,
    details: {
      origin: 'Ngày hội được tổ chức vào dịp kỷ niệm ngày thành lập Mặt trận Dân tộc Thống nhất Việt Nam, tiền thân của Mặt trận Tổ quốc Việt Nam, ngày 18/11/1930.',
      customs: 'Ở khu dân cư thường có họp mặt, sinh hoạt văn nghệ, đánh giá phong trào và biểu dương các gia đình, cá nhân. Nội dung cụ thể do cộng đồng địa phương tổ chức.',
    },
    sources: [{ publisher: 'Ủy ban Trung ương Mặt trận Tổ quốc Việt Nam', title: 'Nghị quyết 04/NQ/ĐCT-MTTW về tổ chức Ngày hội Đại đoàn kết toàn dân tộc', url: 'https://mattran.org.vn/hoat-dong/mot-so-van-de-ly-luan-ve-to-chuc-ngay-hoi-dai-doan-ket-toan-dan-toc-trong-giai-doan-moi-51227.html' }],
  },
  {
    id: 'vietnamese-teachers-day', title: 'Ngày Nhà giáo Việt Nam', category: 'commemoration',
    rule: { type: 'solar_fixed', month: 11, day: 20, startYear: 1982 },
    description: 'Ngày Nhà giáo Việt Nam là dịp học sinh, phụ huynh và xã hội tri ân những người làm công tác giáo dục. Ngày 20/11 được chọn làm ngày kỷ niệm trên cả nước từ năm 1982.', sortOrder: 240,
    details: {
      origin: 'Ngày 20/11 được chọn sau khi Việt Nam tham gia tổ chức quốc tế các nhà giáo năm 1953. Năm 1982, ngày này lần đầu được tổ chức trên cả nước với tên Ngày Nhà giáo Việt Nam.',
      significance: 'Dịp kỷ niệm đề cao vai trò của nhà giáo trong dạy học và giáo dục, đồng thời là cơ hội để học sinh bày tỏ lòng biết ơn.',
      customs: 'Trường học thường tổ chức gặp mặt, văn nghệ hoặc hoạt động tri ân; hình thức cụ thể tùy từng trường và địa phương.',
    },
    sources: [{ publisher: 'Cổng Thông tin điện tử Chính phủ', title: 'Toàn văn Quyết định số 167-HĐBT về Ngày Nhà giáo Việt Nam', url: 'https://xaydungchinhsach.chinhphu.vn/toan-van-quyet-dinh-so-167-hdbt-ve-ngay-nha-giao-viet-nam-119231120070916265.htm' }],
  },
  {
    id: 'vietnam-culture-day', title: 'Ngày Văn hóa Việt Nam', category: 'official_holiday',
    rule: { type: 'solar_fixed', month: 11, day: 24, startYear: 2026 },
    description: 'Ngày Văn hóa Việt Nam là dịp tôn vinh các giá trị văn hóa và khuyến khích người dân tham gia hoạt động văn hóa. Từ năm 2026, ngày 24/11 là ngày nghỉ lễ hưởng nguyên lương tại Việt Nam.', sortOrder: 250,
    sources: [{ publisher: 'Chính phủ Việt Nam', title: 'Nghị quyết 28/2026/QH16', url: 'https://vanban.chinhphu.vn/?docid=218008&pageid=27160' }],
  },
  {
    id: 'world-aids-day', title: 'Ngày Thế giới Phòng chống AIDS', category: 'international',
    rule: { type: 'solar_fixed', month: 12, day: 1 },
    description: 'Ngày Thế giới Phòng chống AIDS tập trung vào phòng ngừa HIV, tiếp cận điều trị và xóa bỏ kỳ thị. Đây cũng là dịp tưởng nhớ những người đã mất vì AIDS và thể hiện sự đoàn kết với người sống chung với HIV.', sortOrder: 260,
    details: {
      origin: 'Ngày này được khởi xướng năm 1988, trở thành một trong những chiến dịch y tế toàn cầu thường niên đầu tiên.',
      significance: 'Các hoạt động nhấn mạnh dự phòng, xét nghiệm và điều trị HIV, đồng thời phản đối sự kỳ thị và phân biệt đối xử.',
    },
    sources: [{ publisher: 'Tổ chức Y tế Thế giới', title: 'World AIDS Day', url: 'https://www.who.int/campaigns/world-aids-day/' }],
  },
  {
    id: 'human-rights-day', title: 'Ngày Nhân quyền Thế giới', category: 'international',
    rule: { type: 'solar_fixed', month: 12, day: 10 },
    description: 'Ngày Nhân quyền Thế giới kỷ niệm việc Liên Hợp Quốc thông qua Tuyên ngôn Quốc tế Nhân quyền năm 1948. Tuyên ngôn nêu những quyền và tự do cơ bản mà mọi người được hưởng.', sortOrder: 270,
    details: {
      origin: 'Ngày 10/12/1948, Đại hội đồng Liên Hợp Quốc thông qua Tuyên ngôn Quốc tế Nhân quyền tại Paris.',
      significance: 'Tuyên ngôn đặt nền tảng chung cho việc bảo vệ các quyền và tự do cơ bản, không phân biệt quốc tịch, giới tính, ngôn ngữ hay tín ngưỡng.',
    },
    sources: [{ publisher: 'Liên Hợp Quốc', title: 'Human Rights Day', url: 'https://www.un.org/en/node/118467' }],
  },
  {
    id: 'vietnam-peoples-army-day', title: 'Ngày thành lập Quân đội nhân dân Việt Nam', category: 'commemoration',
    rule: { type: 'solar_fixed', month: 12, day: 22, startYear: 1944 },
    description: 'Ngày 22/12/1944, Đội Việt Nam Tuyên truyền Giải phóng quân — tiền thân của Quân đội nhân dân Việt Nam — được thành lập tại Cao Bằng.', sortOrder: 280,
    sources: [{ publisher: 'Bộ Quốc phòng Việt Nam', title: 'Lịch sử hình thành và phát triển Quân đội nhân dân Việt Nam', url: 'https://www.mod.gov.vn/home/detail?current=true&urile=wcm%3Apath%3A%2Fmod%2Fsa-mod-site%2Fsa-qdndvn%2Fsa-qdndvn-child%2Fsa-qdndvn-gt%2Flich-su-hinh-thanh-va-phat-trien' }],
  },
  {
    id: 'national-resistance-day', title: 'Ngày Toàn quốc kháng chiến', category: 'commemoration',
    rule: { type: 'solar_fixed', month: 12, day: 19, startYear: 1946 },
    description: 'Ngày 19/12/1946, Chủ tịch Hồ Chí Minh ra Lời kêu gọi Toàn quốc kháng chiến, mở đầu cuộc kháng chiến toàn quốc chống thực dân Pháp.', sortOrder: 40,
    sources: [{ publisher: 'Cổng Thông tin điện tử Chính phủ', title: 'Chủ tịch Hồ Chí Minh với ngày Toàn quốc kháng chiến', url: 'https://baochinhphu.vn/chu-tich-ho-chi-minh-voi-ngay-toan-quoc-khang-chien-102213564.htm' }],
  },
  {
    id: 'christmas-day', title: 'Lễ Giáng sinh', category: 'international',
    rule: { type: 'solar_fixed', month: 12, day: 25 },
    description: 'Giáng sinh là lễ trọng của Kitô giáo, kỷ niệm Chúa Giê-su giáng sinh. Ở Việt Nam, dịp này còn gắn với trang trí cây thông, thánh ca, gặp gỡ gia đình và các hoạt động cộng đồng.', sortOrder: 290,
    details: {
      aliases: ['Lễ Noel'],
      significance: 'Đối với Kitô hữu, Giáng sinh mừng sự ra đời của Chúa Giê-su và mang ý nghĩa tôn giáo sâu sắc. Ngoài cộng đồng Kitô giáo, nhiều người cũng tham gia các hoạt động văn hóa, gặp gỡ trong dịp này.',
      customs: 'Các nhà thờ cử hành thánh lễ; nhiều gia đình trang trí hang đá hoặc cây thông, hát thánh ca và trao quà. Cách đón lễ khác nhau giữa các cộng đồng.',
    },
    sources: [
      { publisher: 'Hội đồng Giám mục Việt Nam', title: 'Ngày 25 tháng 12 - Đại lễ Giáng sinh', url: 'https://hdgmvietnam.com/chi-tiet/ngay-25-thang-12---dai-le-giang-sinh' },
      { publisher: 'Chính phủ Việt Nam', title: 'Bộ luật Lao động 45/2019/QH14, Điều 112', url: 'https://vanban.chinhphu.vn/?docid=198540&pageid=27160' },
    ],
  },
]
