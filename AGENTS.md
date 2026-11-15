# LỊCH VIỆT — CODEX WORKING CONTRACT (V1.0)

## 0. Đọc trước khi làm việc
- Đây là sản phẩm thực tế, **không phải demo**. Giao diện tiếng Việt, mobile-first.
- Nguồn yêu cầu: `docs/PRODUCT_SPEC.md`. Nguồn kiến trúc: `docs/ARCHITECTURE.md`.
- Khi tài liệu, yêu cầu hiện tại và code mâu thuẫn: ưu tiên yêu cầu mới nhất của người dùng; nêu rõ xung đột trước khi sửa. Không tự suy đoán chi tiết quan trọng.
- Đọc file này và **chỉ** những file liên quan trực tiếp đến nhiệm vụ; không đọc/quét toàn repo lặp đi lặp lại vô ích.

## 1. Stack và phạm vi đã chốt
- Web thuần: **Vite + Vanilla TypeScript + HTML5 + CSS3**. Không Flutter/React/Vue/Next.js.
- Hosting: GitHub Pages tại `/<repo>/`, repository `lich-viet`.
- Không backend, REST/GraphQL API, Firebase, xác thực, cơ sở dữ liệu server, quảng cáo, analytics hoặc đồng bộ cloud.
- **Không bắt buộc offline**. Có thể hỗ trợ thêm vào màn hình chính (web app), nhưng không tuyên bố đây là iOS native.
- Chỉ có hai tab: **Lịch** và **Sự kiện**. Không thêm tính năng ngoài V1.0.
- Thuật toán lịch viết TypeScript thuần; dữ liệu sự kiện kiểm chứng và đóng gói cùng ứng dụng.

## 2. Quy trình mỗi nhiệm vụ
1. Chạy/kiểm tra `git status --short`. Không xóa hoặc ghi đè thay đổi chưa commit của người dùng.
2. Xác định mục tiêu, tiêu chí nghiệm thu, file hiện có cần đọc và phạm vi dự định sửa.
3. Đọc `package.json`, cấu hình liên quan và module gần nhất trước khi thêm dependency/file.
4. Sửa tối thiểu theo đúng trách nhiệm module, không refactor ngoài phạm vi.
5. Kiểm tra diff, import/unused, ảnh hưởng UI, dữ liệu và hồi quy.
6. Chạy kiểm tra phù hợp và báo cáo **kết quả thực tế**, không nói “đã test” nếu chưa chạy.
7. Kết thúc bằng: đã làm, danh sách file thêm/sửa/xóa, lệnh và kết quả, hạn chế còn lại.

## 3. Chính sách KHÔNG RÁC
- CẤM demo, counter, mock/placeholder trong luồng sản phẩm, dữ liệu ngày lễ tự bịa, TODO-only, màn hình/route không dùng.
- CẤM file bản sao `*_new`, `*_final`, `*_backup`, file báo cáo tự phát, script một lần, thư mục rỗng, export dư, code chết và module song song cùng trách nhiệm.
- CẤM tạo hàng loạt file/thư mục “để dành cho tương lai”. Chỉ tạo khi có tính năng đang triển khai và đã rõ chủ sở hữu.
- CẤM thêm dependency, framework UI, state manager, router, icon package, thư viện ngày tháng, CSS framework hay test framework khi chưa chứng minh cần thiết; nêu lý do và ảnh hưởng trước khi thêm.
- CẤM thay đổi cấu hình Node/Vite/TS/GitHub Actions, nâng phiên bản hàng loạt hoặc cài gói toàn cục chỉ để sửa triệu chứng.
- File test và fixtures **được phép** khi chứng minh logic thực, không đưa fixtures vào production bundle.
- Được phép giữ các file build nền tảng cần thiết; `node_modules/` và `dist/` phải nằm ngoài Git.

## 4. Quy tắc code
- TypeScript strict, rõ kiểu dữ liệu; không dùng `any`, `@ts-ignore`, non-null assertion tràn lan để che lỗi.
- Phân tách UI rendering, state, tính ngày và event data. Hàm tính ngày phải thuần (pure), deterministic, dễ unit test.
- Ưu tiên module ES nhỏ, tên dễ hiểu; không overengineering (DI container, repository trừu tượng, event bus tổng quát nếu chưa cần).
- Nội dung do dữ liệu cung cấp phải hiển thị an toàn, ưu tiên `textContent`/DOM API, không gán thẳng vào `innerHTML`.
- Không phụ thuộc network ở runtime ngoài việc tải tĩnh website. Không tải CDN font/icon/SDK khi chưa duyệt.
- Không hardcode chiều cao màn hình, tránh page-level overflow và nested vertical scroll.
- Mã nguồn/tên biến bằng tiếng Anh; giao diện, thông báo và báo cáo bằng tiếng Việt.

## 5. Bất biến UI/UX
- Một app shell: header cố định trên, footer điều hướng cố định dưới, **chỉ vùng content giữa cuộn dọc**.
- Header chỉ phản ánh tab đang mở; **không nút Back**.
- Footer chỉ hai mục Lịch và Sự kiện; **chỉ thao tác footer mới đổi tab**.
- Chọn ngày hoặc vuốt để đổi tháng **không đổi tab**. Không vuốt ngang để đổi tab.
- Popup/modal có **nút X góc phải phía trên**, không bị che bởi notch/safe-area; đóng bằng Escape nếu phù hợp.
- Giữ ngày/tháng đã chọn và vị trí cuộn của từng tab khi chuyển qua lại.
- Tương thích Safari iPhone, Chrome Android, viewport nhỏ, text scaling, safe-area và bàn phím.

## 6. Tính đúng lịch và dữ liệu sự kiện
- Tách **ngày dân sự theo múi giờ thiết bị** với **thuật toán lịch âm Việt Nam theo UTC+7**.
- Không parse ngày dạng mơ hồ `YYYY-MM-DD` để suy ra ngày địa phương; tránh lệch ngày theo UTC/DST.
- Chỉ công bố khoảng năm hỗ trợ khi có bộ test đối chiếu độc lập, nhất là tháng nhuận, ranh giới tháng/năm.
- Sự kiện hỗ trợ dương lịch, âm lịch, quy luật thứ-ngày và ngoại lệ theo năm nếu đã có dữ liệu chuẩn.
- Không gắn nhãn ngày nghỉ chính thức cho mọi ngày kỷ niệm; một ngày có thể nhiều sự kiện.
- Mô tả, nguồn gốc và ngày tháng phải có căn cứ; nếu chưa xác minh, bỏ mục đó thay vì sáng tác.

## 7. Kiểm thử và hoàn thành
- Bắt buộc `npm run build` sau khi sửa TypeScript/CSS/config có ảnh hưởng build.
- Khi có suite test: chạy test liên quan và full test trước khi báo hoàn thành phase.
- Không giả định `npm run test` tồn tại: kiểm tra scripts trong `package.json` trước khi chạy.
- Kiểm tra UI responsive thực tế khi thay đổi UI; nếu không có khả năng mở browser thì báo rõ “chưa kiểm thử trực quan”.
- Xem `git diff --check` và `git status --short` trước khi báo cáo.
- Không commit/push, force-push, clean -fdx, xóa lịch sử hoặc sửa file ngoài phạm vi nếu không được yêu cầu.
- Hoàn thành = đúng spec + không file dư + build/test phù hợp chạy được + không ghi đè thay đổi của người dùng + báo cáo trung thực.
