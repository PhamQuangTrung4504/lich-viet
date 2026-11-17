# LỊCH VIỆT V1.0 — TECHNICAL ARCHITECTURE

**Nguyên tắc:** Minimal Vanilla TypeScript. Không backend, không API runtime, không DB, không framework UI. Kiến trúc thêm dần khi chức năng được nghiệm thu.

## 1. Baseline đang có (đã xác nhận từ terminal)
- Repo: `PhamQuangTrung4504/lich-viet`.
- Vite `8.3.8`, Node `v22.15.0`, npm `10.9.2`; TypeScript được Vite template cài từ `package.json` (không giả định phiên bản nếu chưa đọc).
- `npm run build` đã chạy thành công với template, không phải bằng chứng tính năng Lịch Việt đã hoàn thành.
- `node_modules/`, `dist/` không xuất hiện trong `git status --short`; không commit hai thư mục này.
- Template Vite vẫn chứa nội dung mẫu; phải dọn đúng phạm vi khi bắt đầu giao diện thật.

## 2. Sơ đồ phụ thuộc

```text
Browser / index.html
    -> src/main.ts (bootstrap)
    -> app shell (header / content / footer, 2 tabs)
       -> Calendar view -> pure calendar/date core
       -> Events view   -> event matching + pure calendar/date core
                          -> static verified event data
Styles -> design tokens + layouts
```

- UI không chứa công thức tính lịch; các module tính ngày không import DOM hoặc CSS.
- Định nghĩa sự kiện và bộ match không import DOM. Renderer nhận dữ liệu đã chuẩn hóa.
- State tối thiểu quản lý trực tiếp, không thêm global store/router/event bus khi hai tab chưa cần.

## 3. Cấu trúc đích theo nhu cầu, KHÔNG tạo trước tất cả

```text
AGENTS.md
index.html
package.json
package-lock.json
tsconfig.json
vite.config.ts                 # chỉ cần khi cấu hình base/deploy
public/                       # icon/manifest thật khi làm web app
src/
  main.ts                     # bootstrap
  app/                        # shell và state tối thiểu
  calendar/                   # UI lịch + pure solar/lunar date core
  events/                     # UI sự kiện + mapping dữ liệu
  data/                       # dữ liệu sự kiện được kiểm chứng
  styles/                     # tokens + CSS responsive
  # các file con được quyết định theo trách nhiệm THỰC TẾ
tests/                        # tạo khi có module test, không tạo rỗng
docs/
  PRODUCT_SPEC.md
  ARCHITECTURE.md
```

Giữ cấu trúc nông, module rõ trách nhiệm; có thể điều chỉnh vị trí khi code thực tế chứng minh cần thiết. Không thêm folders `services`, `repositories`, `shared`, `utils` chung chung nếu chưa có nhu cầu thật.

## 4. Domain: ngày dân sự, ngày âm Việt Nam

- Dùng kiểu dữ liệu domain tách biệt như `{year, month, day}` để tránh UTC conversion ngầm khi thao tác lịch ngày.
- Hàm validate ngày dương (tháng 1–12, số ngày thực, năm nhuận); năm hỗ trợ phải rõ ràng.
- Bộ lịch tháng: thứ bắt đầu Thứ Hai, số tuần cần thiết, ngày ngoài tháng có trạng thái rõ; đảm bảo thuật toán không lệch vào ngày đầu/cuối tháng.
- Lịch âm: module pure, thuật toán được lựa chọn + dẫn nguồn + quyền sử dụng; quy ước UTC+7, hỗ trợ tháng nhuận theo thực tế.
- Phase 2 chọn phép tính thiên văn Meeus độc lập triển khai: JDN Gregorian, thời điểm Sóc, kinh độ hoàng đạo Mặt Trời và quy tắc tháng 11/trung khí. Mã là triển khai mới, không sao chép mã nguồn lịch âm bên ngoài. Phạm vi ngày dương mà API nhận là 2000–2099.
- Core trả về dữ liệu thuần (không markup). Khi chưa có kiểm thử đối chiếu, không cho UI giả định kết quả là chính xác.
- Không dùng `Date.parse('2026-11-15')` rồi đọc local day (dễ lệch múi giờ); lấy ngày hiện tại thiết bị theo `new Date()` và `getFullYear/getMonth/getDate` hoặc hàm domain chuẩn hóa.
- “Hôm nay/Ngày mai”: tính đúng ngày dân sự theo múi giờ thiết bị, kể cả ngày cuối tháng/cuối năm; khi foreground/focus/visibility và ở ranh giới ngày phải refresh dữ liệu, không reload cả trang.

## 5. Domain: sự kiện

- Dữ liệu đi cùng bundle trong `src/events/data.ts`, TypeScript kiểm tra kiểu tĩnh; model ở `model.ts` có `id`, `title`, `category`, discriminated `rule`, `description`, `sources` và `sortOrder`.
- `engine.ts` nhận `CivilDate` đã kiểm tra, giới hạn solar year 2000–2099, sắp xếp theo ưu tiên category (nghỉ lễ chính thức, truyền thống, kỷ niệm Việt Nam, quốc tế), tiếp theo `sortOrder` rồi ID; loại ID trùng, giữ mục đầu theo thứ tự này. Không match thì trả mảng rỗng.
- Quy tắc hỗ trợ: `solar_fixed` (có thể giới hạn bằng `startYear` và `endYear`), `lunar_fixed` (`regular_only`, `leap_only`, `both`), `lunar_month_end` (ngày cuối của tháng âm được chỉ định, dùng cho Giao thừa), `weekday_rule` (0=Chủ nhật đến 6=Thứ bảy, thứ N hoặc `'last'`) và `year_specific` (ngày dương đầy đủ). Mỗi quy tắc được kiểm thử; production dataset chỉ chứa quy tắc có căn cứ, hiện chưa có mục `weekday_rule`.
- Chỉ gọi Calendar Core cho các quy tắc âm lịch; phép đổi dùng `solarToVietnameseLunar` hiện có (UTC+7), không tự viết lại chuyển đổi. Các ngày âm trong dữ liệu hiện có chính sách `regular_only`.
- `getTodayAndTomorrow(now)` lấy ngày thiết bị bằng local date fields, tính ngày mai qua JDN liền kề thay vì cộng 86.400.000 ms, rồi match hai ngày; không DOM/network/timer. Việc đọc ngày local theo timezone thiết bị phụ thuộc môi trường chạy; phần match trên `CivilDate` là pure. Ngày mai vượt biên 2099 bị từ chối do giới hạn Calendar Core/Event Engine.
- Dataset hiện có 55 bản ghi cho 53 dịp thực tế sau khi gộp hai cặp tên gọi theo thời kỳ. Phase 6C bổ sung bảy bản ghi gồm Ngày vía Thần Tài, Ngày Thầy thuốc Việt Nam, hai tên gọi có khoảng hiệu lực riêng của Ngày Sách, Ngày Khoa học và Công nghệ Việt Nam, Tết Trung Nguyên và Ngày hội Đại đoàn kết toàn dân tộc. Phase 6C.1 tách dịp 18/5 thành hai bản ghi tên gọi: tên cũ dùng đến kỳ kỷ niệm tháng 5/2025, tên mới từ năm 2026; việc tách không làm tăng số dịp. Các dịp truyền thống được phân biệt với ngày nghỉ theo luật và mô tả có nêu khác biệt vùng miền/tập tục khi nguồn yêu cầu.
- Ngày Sách Việt Nam dùng `endYear: 2021`; tên Ngày Sách và Văn hóa đọc Việt Nam bắt đầu từ 2022 theo Quyết định 1862/QĐ-TTg. `tests/event-coverage.test.ts` giữ contract regression riêng và một danh mục ứng viên có nguồn độc lập (5 P0, 5 P1 hiện đã duyệt); đây là một lát cắt có kiểm chứng, không phải khẳng định bao phủ toàn bộ lễ hội hoặc phong tục địa phương.
- Hybrid data có ba phần: quy tắc thuần trong Event Engine tính các dịp lặp; `VERIFIED_EVENTS` là tập mục production đã biên soạn kèm nguồn và phân loại; quyết định lịch nghỉ bù/ngày nghỉ cụ thể từng năm không nằm trong bộ quy tắc và chưa được suy đoán. Test `tests/event-coverage.test.ts` tách contract baseline (ID/tên/phân loại/quy tắc), danh mục nguồn độc lập có trạng thái duyệt và đối chiếu ngày cụ thể ở `tests/event-engine.test.ts`. Danh mục tham chiếu hiện gồm 5 ứng viên P0 và 5 P1 đã duyệt; đây là một lát cắt nguồn có kiểm chứng, không phải bằng chứng bao phủ mọi ngày lễ.
- Không tính ngày nghỉ bù, ngày liền kề Quốc khánh hay toàn bộ số ngày nghỉ Tết theo thông báo hàng năm. Dataset không phải danh mục đầy đủ mọi sự kiện; URL và thông tin cần được rà soát khi cập nhật.
- Nội dung hiển thị bằng `textContent`/DOM API; không chèn HTML không tin cậy.
- JSON schema phải được runtime validate tối thiểu nếu import từ dữ liệu ngoài TS type system; tránh coi cast TypeScript là bằng chứng hợp lệ.
- Không tự sinh nguồn gốc hoặc lịch nghỉ lễ bằng generative AI ở runtime.

## 6. App shell và tương tác

- Dùng một điểm bootstrap và một `AppState` nhỏ: `activeTab`, `visibleMonth`, `selectedDate`, scroll position/tab (nếu DOM tab được remount).
- Startup splash tĩnh trong `index.html` hiển thị trước khi module ứng dụng hoàn tất tải; main chỉ phát trạng thái sẵn sàng sau lần render đầu, splash mờ đi rồi được gỡ. Lỗi khởi tạo hoặc lỗi tải module/CSS/icon hiển thị thông báo và nút tải lại; không có thời gian chờ giả.
- Các thao tác người dùng được gom theo chức năng, không thêm state library.
- Header/footer là anh em của content scroll, không nằm bên trong scroller.
- CSS nguyên tắc: app container `height: 100vh; height: 100dvh; display: flex; flex-direction: column;` (hoặc grid), header/footer `flex: none`, content `flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior-y: contain;`.
- Sử dụng `env(safe-area-inset-*)`, viewport `viewport-fit=cover` nếu phù hợp, không nhân đôi safe-area padding.
- Lưới 7 cột co giãn trong width; không set chiều rộng từng ô cố định gây tràn màn 320px.
- Tab chuyển bằng footer; không dùng gesture chuyển tab. Calendar swipe được scope trong vùng lịch, không cản cuộn dọc.
- Modal có X, focus và đóng hợp lý; không thêm route chỉ vì xem chi tiết.
- Phase 4 triển khai shell hai tab trong `src/main.ts`; lưới tháng Monday-first là pure function trong `src/calendar/month-grid.ts`. Ngày âm và sự kiện hiển thị được lấy trực tiếp từ Calendar Core/Event Engine. Một scroller chính lưu scrollTop riêng theo tab; timer duy nhất lên lịch lần làm mới vào nửa đêm địa phương, được dọn khi pagehide và khởi động lại khi pageshow. Làm mới chỉ render UI khi ngày hoặc snapshot sự kiện thay đổi; render giữ focus theo khóa ổn định nếu điều khiển vẫn còn. Bộ chọn tháng/năm giữ draft cho tới khi xác nhận; chọn ngày chủ động cuộn chính scroller tới chi tiết. Thẻ sự kiện ở cả hai tab là button ngữ nghĩa, không hiển thị nguồn; kích hoạt thẻ mở `event-detail-dialog` với ngày của lần xuất hiện đang hiển thị. Modal dùng Calendar Core để tính ngày âm và render các trường tùy chọn `aliases`, `origin`, `significance`, `customs` trong `CalendarEvent.details`, không có mục “Lưu ý” riêng; URL Wikipedia chỉ được render nếu thuộc HTTPS `vi.wikipedia.org`. Nguồn trích dẫn tiếp tục được lưu trong dataset nhưng không tải hay hiển thị trên card.

## 7. CSS và tài nguyên

- CSS custom properties cho bảng màu, spacing, radius, typography. Ưu tiên system font stack tiếng Việt; font ngoài cần có lý do, license và cân nhắc tải.
- Không dùng Tailwind, Bootstrap, component library hoặc bộ icon nặng theo mặc định. Icon ưu tiên SVG có kiểm soát/inline có mục đích.
- Không dùng ảnh mạng, CDN hoặc quá nhiều animation. Tôn trọng prefers-reduced-motion.
- Có focus visible, target touch đủ lớn, độ tương phản và mô tả truy cập cho icon-only controls.

## 8. GitHub Pages & web-app packaging

- Website dự kiến: `https://phamquangtrung4504.github.io/lich-viet/`.
- Vite dùng base `'/lich-viet/'` cho build/preview production và `'/'` cho dev server trong `vite.config.ts`; URL asset production được phát hành dưới prefix project Pages.
- Không dùng SPA router phụ thuộc server rewrite; chỉ một trang với hai tab local.
- Workflow `.github/workflows/deploy.yml` chạy khi push `main` hoặc dispatch thủ công trên `main`: `npm ci`, `npm test`, `npm run build`, upload riêng `dist/`, sau đó deploy bằng GitHub Pages Actions vào environment `github-pages`. Quyền Pages/OIDC chỉ cấp cho job deploy; **không commit** `dist/`.
- Workflow chạy tối thiểu và permissions least-privilege. Không có API token trong client bundle; biến bắt đầu bằng `VITE_` là public, không đặt secret vào đó.
- PWA/add-to-home-screen: `public/manifest.webmanifest` khai báo ứng dụng và icon PNG 192/512 (có bản maskable); `public/apple-touch-icon.png` là PNG vuông, opaque 180×180, `public/favicon.png` là PNG 48×48. Các icon được tạo từ `src/assets/app-icon-source.png`; Apple icon được làm đầy nền vuông, còn bản maskable đặt ảnh trong vùng an toàn. `index.html` liên kết manifest/icon và khai báo metadata Safari. Đây là web app có thể thêm vào màn hình chính, không cam kết offline; không cấu hình service worker.
- Assets dùng đường dẫn tương thích base (import assets / `import.meta.env.BASE_URL` nếu cần), không tự hardcode đường dẫn root `/assets/...`.

## 9. Kiểm thử và phase gates

- Baseline: `npm run build` (template hiện dùng `tsc && vite build`), `git diff --check`, `git status --short`.
- Calendar Core: chạy `npm run test:calendar`; Event Engine: `npm run test:events`; toàn bộ: `npm test`. Dùng `node:test`/`node:assert/strict`, Node 22.15 với `--experimental-strip-types`. `tsconfig.json` strict type-check cả `src/` và `tests/`; `@types/node` là devDependency để cung cấp kiểu Node cho test.
- Core thiên văn áp dụng công thức rút gọn của Jean Meeus, *Astronomical Algorithms*, 2nd ed. (1998), chương 7 (JDN Gregorian), chương 25 (kinh độ Mặt Trời) và chương 49 (pha Sóc), cùng hiệu chỉnh ΔT gần đúng. JDN và ngày sóc được quy đổi theo UTC+7; tháng 11 chứa Đông chí và tháng nhuận là tháng đầu tiên trong năm nhuận không có trung khí, theo quy tắc lịch Việt Nam. Kinh độ Mặt Trời được phân loại theo ngày địa phương tại UTC+7. Đây là triển khai công thức mới, không sao chép mã nguồn thư viện.
- Nguồn phương pháp: [USNO, Explanatory Supplement §15.8](https://aa.usno.navy.mil/downloads/c15_usb_online.pdf), [USNO, bảng pha Mặt Trăng (UTC)](https://aa.usno.navy.mil/data/MoonPhases), [quy tắc lịch Việt Nam và kinh tuyến 105°Đ](https://www.xemamlich.uhm.vn/calrules_en.html), [Qelunai, phương pháp UTC+7](https://qelunai.com/en/phuong-phap/), và cuộc phỏng vấn chuyên gia lịch Việt Nam Trần Tiến Bình đăng trên [Bản tin Khoa học Công nghệ, Viện Hàn lâm KH&CN Việt Nam](https://isdi.vast.vn/media/cumnb14r/bantinkhcn202401.pdf). USNO §15.8 mô tả trường hợp lịch 2033; pha sóc 2033-12-21 18:46 UTC tương ứng ngày 22/12 theo UTC+7. Phỏng vấn của VAST nêu rõ lịch Việt Nam dùng UTC+7, và các sóc gần nửa đêm 2057/2089/2097; bảng pha [Astrodienst/SWISS Ephemeris 2000–2100](https://www.astro.com/swisseph/ae/lphase_2000.pdf) độc lập ghi thời điểm UTC của các sóc này.
- Bộ test có 20 mốc chuyển đổi dương–âm lấy từ các trang lịch Việt Nam, gồm 2000-01-01 và 2099-12-31; Tết các năm 2000, 2007, 2010, 2014, 2017, 2019, 2020, 2023, 2024, 2025, 2026, 2030, 2033, 2040, 2053; và ba ngày sóc gần nửa đêm 2057-09-28, 2089-09-04, 2097-08-07. URL cụ thể được lưu cùng từng mốc trong `tests/calendar-core.test.ts`. Các mốc tháng nhuận: tháng 2 nhuận 2023 bắt đầu 22/03 và kết thúc 19/04 (đối chiếu [VTV](https://vtv.vn/doi-song/nhung-ngay-tot-cua-thang-2-nhuan-am-lich-2023-20230322142610109.htm) và [FPT Shop](https://fptshop.com.vn/tin-tuc/danh-gia/lich-am-2023-xem-ngay-am-lich-nam-quy-mao-2023-179191)); tháng 6 nhuận 2025 bắt đầu 25/07 và kết thúc 22/08 (đối chiếu [Báo Nghệ An](https://baonghean.vn/en/am-duong-lich-nam-2025.html)); tháng 11 nhuận 2033 bắt đầu 22/12. Với 2033, USNO ghi sóc 21/12 18:46 UTC, nên ngày mùng 1 theo UTC+7 là 22/12; tháng 11 nhuận khớp quy tắc VAST/USNO. Riêng năm 2033 không suy luận từ bảng lịch Trung Quốc đơn thuần.
- Kết quả test phân biệt hai lớp: 20 mốc nêu trên là đối chiếu ngày cụ thể với nguồn ngoài. Các trang lịch công khai không phải tất cả đều mô tả phương pháp tính và có thể dùng chung công thức/thư viện; do đó đây không phải 20 ephemerides độc lập. Kiểm tra Gregorian/JDN, điều kiện đầu vào, tính liên tục và round-trip đủ 36.525 ngày là property tests nội bộ. Hai kiểu kiểm tra không tương đương nhau.
- Giới hạn: công thức Meeus trong core là mô hình rút gọn, ΔT tương lai là gần đúng và không cung cấp sai số/độ bất định. Kinh độ Mặt Trời dùng công thức ngắn gọn, phân loại theo ngày nên không thay thế ephemeris độ chính xác cao khi một sóc/trung khí nằm rất sát ranh giới. Ba mốc 2057/2089/2097 khớp các ngày UTC+7 theo tài liệu VAST và lịch Việt Nam đã đối chiếu, nhưng việc khớp mốc không bảo đảm toàn bộ thời điểm thiên văn hoặc từng ngày trong 2000–2099. Khoảng 2000–2099 vẫn chỉ là giới hạn đầu vào của API, chưa phải cam kết đã xác minh đầy đủ; không mở rộng hoặc quảng bá độ chính xác toàn khoảng nếu chưa bổ sung kiểm chứng ephemeris/lịch độc lập bao phủ năm và các ranh giới.
- Phase 3 có kiểm thử Event Engine cho metadata/URL, nhiều và không sự kiện, Gregorian/lunar fixed, đủ ba chính sách tháng nhuận, ngày cuối tháng âm, nth/last Sunday bằng fixture, year-specific, dedup/thứ tự category, biên tháng/năm, 29/2, vùng 2000–2099 và DST bằng process riêng `America/New_York`. Fixture chỉ ở `tests/event-engine.test.ts`, không vào bundle. Bộ kiểm thử còn đối chiếu các ngày Hạ Nguyên 2025–2027, Trùng Thập 2026, Ngày Pháp luật, hai sự kiện 20/11 và các mục liên quan 23/11.
- Phase 4 thêm `tests/month-grid.test.ts` cho thứ Hai đầu tuần, tính liên tục của lưới, tháng nhuận Gregorian và ô đệm tại biên 2000/2099. Phase 4.1 có `tests/weekday.test.ts` với bốn ngày Gregorian tham chiếu; Phase 4.2 có `tests/month-selection.test.ts` cho xác thực năm/tháng. Các suite chạy cùng `npm test`. Kiểm thử tự động không thay thế việc kiểm tra trực quan Safari iPhone/Chrome Android.
- Khi xây UI: kiểm tra Safari iPhone thực, Chrome Android, desktop; width 320/360/375/390/430 CSS px, notch, footer, modal, tăng cỡ chữ, scroll, đổi tab giữ state.
- Khi deploy: kiểm tra Pages URL trực tiếp, asset 200 không 404, chức năng trên điện thoại và cài lên Home Screen.
- Không báo “đạt” nếu chưa chạy; nếu thiếu thiết bị thật ghi trạng thái **chưa xác minh**.

## 10. Các giai đoạn triển khai đề xuất

1. **Governance & audit:** thêm tài liệu đã thống nhất, xác minh package/build/Git và xác định chính xác file mẫu Vite; chưa thay bằng màn hình placeholder.
2. **Calendar core:** thuật toán xác minh, unit tests độc lập; giữ tạm template Vite cho đến khi có UI thật thay thế.
3. **Event data/core:** dữ liệu xác minh, match và unit tests.
4. **Mobile-first UI:** xây hai tab hoàn chỉnh kết nối core/dữ liệu thật; **xóa toàn bộ sample assets/code của Vite trong cùng thay đổi**, không tạo placeholder.
5. **Polish/PWA:** accessibility, icon, responsive thực tế, performance.
6. **Deploy:** Vite base + GitHub Pages Actions, kiểm tra URL thực tế.

Mỗi phase chỉ được bắt đầu khi phase trước đã có bằng chứng nghiệm thu tương ứng; không dùng nội dung mô phỏng để vượt qua gate.
