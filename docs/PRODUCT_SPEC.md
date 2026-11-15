# LỊCH VIỆT V1.0 — PRODUCT SPECIFICATION

**Trạng thái:** Baseline V1.0. Mọi thay đổi sản phẩm phải được xác nhận trước khi code.  
**Nền tảng:** Website responsive, có thể thêm vào màn hình chính iPhone/Android.  
**Mục tiêu:** Xem lịch dương/âm Việt Nam và tìm hiểu sự kiện hôm nay, ngày mai; nhanh, dễ đọc, tối giản, không cần tài khoản.

## 1. Phạm vi

### Bắt buộc
- Chính xác **hai tab**: `Lịch` (Home) và `Sự kiện`.
- Toàn bộ trải nghiệm trong **một trang web**, không có router hay màn hình điều hướng thứ ba.
- Header cố định, content cuộn dọc duy nhất theo tab, footer cố định với đúng hai lựa chọn.
- Lịch theo tháng, ngày dương chủ đạo + ngày âm nhỏ, chọn ngày, thay tháng/năm, chi tiết ngày chọn.
- Sự kiện hôm nay và ngày mai, hỗ trợ nhiều sự kiện cùng một ngày, mô tả ngắn có kiểm chứng.
- Mobile-first, hoạt động trên Safari iOS, Chrome Android, trình duyệt desktop.

### Ngoài phạm vi V1
- Backend, API ngày lễ, tài khoản, đồng bộ cloud, lịch hẹn cá nhân, nhắc việc, push notification, quảng cáo, định vị, thời tiết.
- Native APK/IPA, App Store, Google Play; offline không bắt buộc.
- Phong thủy/dự đoán mê tín, chức năng cần nguồn chưa được kiểm chứng.

## 2. Bố cục và điều hướng

- Ứng dụng lấp đầy vùng viewport khả dụng. Header và footer nằm ngoài `content` cuộn.
- Header hiển thị tên và icon của tab đang chọn: **Lịch** hoặc **Sự kiện**; không có nút Back.
- Footer luôn nhìn thấy, gồm hai mục kèm icon + nhãn; có trạng thái active dễ nhận biết.
- Chỉ nhấn footer mới đổi tab. Không tự đổi tab sau chọn ngày, chọn sự kiện, chuyển tháng hoặc thao tác vuốt.
- Mỗi tab ghi nhớ trạng thái và vị trí cuộn riêng. Khi quay lại tab không tự reset.
- Nội dung không chảy ra ngoài viền màn hình; không tạo thanh cuộn dọc của toàn trang hoặc cuộn dọc lồng nhau.
- Tôn trọng iOS safe-area/notch/home indicator, `100dvh` với fallback phù hợp, text scaling và bàn phím ảo.

## 3. Tab Lịch

### Hiển thị
- Phần đầu nội dung: thông tin ngày hiện tại được trình bày ngắn gọn, không chiếm hết màn hình.
- Bộ chọn tháng/năm và điều khiển tháng trước/sau nằm **trong content**, không đặt nút Back ở header.
- Lưới 7 cột, thứ bắt đầu từ **Thứ Hai** đến Chủ nhật; nhãn ngắn dễ đọc.
- Ô ngày: số dương lịch nổi bật; số âm lịch nhỏ hơn, đúng theo thuật toán Việt Nam.
- Phân biệt trạng thái **hôm nay** và **đang được chọn**; nếu cùng ngày phải có trạng thái kết hợp rõ ràng.
- Ngày ngoài tháng có thể hiển thị mờ để đủ hàng; chọn ngày ngoài tháng sẽ chuyển tới tháng tương ứng và chọn ngày ấy.
- Đổi tháng bằng nút trước/sau; hỗ trợ vuốt ngang **chỉ trong vùng lịch** nếu không xung đột thao tác dọc.
- Chạm tiêu đề tháng/năm mở bộ chọn có nút X ở góc trên phải. Dữ liệu hợp lệ, không để chọn ngày 31 của tháng chỉ 30 ngày.
- Có thao tác trở về hôm nay ở **vùng nội dung lịch**, không thêm nút Back hoặc tab mới.

### Chi tiết ngày chọn
- Tối thiểu: thứ, ngày/tháng/năm dương lịch, ngày/tháng/năm âm lịch và thông tin tháng nhuận nếu có.
- Can chi (ngày/tháng/năm) và giờ hoàng đạo: chỉ hiển thị khi module tính toán đã được xác minh bằng tham chiếu độc lập; không dùng dữ liệu đoán.
- Nếu có sự kiện đúng ngày chọn có thể hiển thị chỉ báo hoặc tóm tắt **ngay trong tab Lịch**, không tự chuyển sang tab Sự kiện.

## 4. Tab Sự kiện

- Luôn có đúng hai nhóm theo thứ tự: **Hôm nay** và **Ngày mai**.
- “Hôm nay/Ngày mai” được xác định theo ngày dân sự hiện tại tại **múi giờ thiết bị của người dùng**; không lấy từ ngày đang chọn trong tab Lịch.
- Khi ứng dụng quay lại foreground, chuyển ngày hoặc tải lại, dữ liệu tự phản ánh ngày mới.
- Mỗi nhóm có ngày tháng rõ ràng; có nhiều sự kiện thì hiển thị nhiều thẻ có thể cuộn.
- Mỗi thẻ: tên, loại sự kiện (ngày lễ chính thức/ngày kỷ niệm/truyền thống/quốc tế...), ngày, mô tả ngắn chính xác. Nguồn nội dung được lưu trong dữ liệu (liên kết nếu phù hợp).
- Mô tả khoảng 1–3 câu, súc tích, dễ đọc; tránh lặp câu, không sáng tác nguồn gốc.
- Nếu không có sự kiện trong danh mục đã biên soạn, hiển thị “Chưa ghi nhận sự kiện đặc biệt trong dữ liệu hiện có”, không khẳng định ngày đó hoàn toàn không có sự kiện.
- Không dùng dữ liệu sự kiện giả hoặc placeholder Valentine/ngày khác trong production.

## 5. Quy tắc dữ liệu lịch và sự kiện

- Thuật toán lịch âm Việt Nam dùng quy ước UTC+7. Ngày “hôm nay” theo đồng hồ thiết bị là khái niệm riêng; không trộn hai quy tắc.
- Kiểm thử ngày chuyển tháng âm, tháng nhuận, giao thừa, năm nhuận dương, các ngày sát nửa đêm và lịch sử nằm trong phạm vi hỗ trợ đã xác minh.
- Phạm vi năm hiển thị phải tương ứng với phạm vi thuật toán đã test; không hứa vô hạn.
- Sự kiện có các loại quy luật: `solar_fixed`, `lunar_fixed`, `weekday_rule`, `year_specific` (chỉ triển khai loại có dữ liệu thực).
- Một ngày có thể nhiều sự kiện; phải xử lý trùng lặp theo ID và thứ tự hiển thị ổn định.
- Sự kiện âm lịch cần xử lý năm/tháng nhuận có chủ ý; không mặc định tháng nhuận giống tháng thường.
- Phân biệt ngày kỷ niệm và ngày nghỉ lễ theo pháp luật; ngày nghỉ cụ thể theo năm có thể thay đổi và cần dữ liệu được cập nhật.

### Trạng thái Calendar Core sau Phase 2.1

- Core TypeScript dùng JDN, thời điểm Sóc và kinh độ Mặt Trời để tính lịch âm Việt Nam theo UTC+7; không dùng bảng ngày cố định.
- Core giới hạn ngày dương trong 2000–2099. Đã đối chiếu 20 mốc ngày dương–âm từ lịch Việt Nam và nguồn thiên văn, trải từ 2000 đến 2099; có các mốc Tết, tháng nhuận 2023/2025, ranh giới 2033–2034 và sóc gần nửa đêm 2057/2089/2097.
- Kiểm thử liên tục và chuyển đổi ngược trên 36.525 ngày là kiểm thử tính chất nội bộ, không thay thế ephemeris độc lập cho từng ngày/năm. Chưa công bố 2000–2099 là phạm vi lịch đã xác minh đầy đủ; UI không được trình bày đây là độ chính xác được bảo đảm toàn khoảng. Giới hạn mô hình thiên văn, nguồn và cách chạy test được ghi trong `docs/ARCHITECTURE.md`.

## 6. Hướng thiết kế

- Phong cách: **Modern Minimalist**, giao diện tiếng Việt, nền sáng ngà (`#F8F9F5`), xanh lá dịu (`#4F8A62`), chữ đậm vừa (`#26352C`), điểm nhấn ấm tiết chế.
- Hệ thống spacing, radius và typography dùng design tokens; không viết kích thước ngẫu hứng cho từng ô.
- Ngày dương nổi bật, ngày âm phụ trợ; không nhồi nhiều biểu tượng, màu sắc và bóng đổ.
- Cỡ chữ nội dung ưu tiên 14–16 CSS px, tiêu đề khoảng 20–24 CSS px, nhưng hỗ trợ text zoom; không ép chữ bé để nhét một màn hình.
- Vùng bấm thuận tiện trên cảm ứng (mục tiêu khoảng >=44 × 44 CSS px cho hành động chính).
- Hiệu ứng chuyển tab, chọn ngày, mở popup nhẹ; tôn trọng `prefers-reduced-motion`.
- Không yêu cầu mọi nội dung nằm trong một viewport: **vùng giữa được phép cuộn dọc**.

## 7. Accessibility và trình duyệt

- Hành động dùng `button` có nhãn dễ hiểu, state active, keyboard focus; không biến `div` thành nút không thể truy cập.
- Lịch có aria label mô tả ngày, trạng thái chọn và hôm nay; tương phản đủ đọc.
- Popup có tiêu đề, nút X rõ ràng, quản lý focus, Escape đóng (desktop), không cuộn page phía sau.
- Thử trên 320/360/375/390/430 CSS px và desktop; iOS Safari có thanh trình duyệt co giãn và safe-area.
- Không bắt buộc dark mode ở V1; nếu có phải là tính năng được phê duyệt riêng.

## 8. Quy tắc chất lượng và nghiệm thu

- Không sử dụng trang mẫu Vite, ảnh `hero`, logo Vite, counter hoặc mã demo trong sản phẩm.
- Sau mỗi feature: TypeScript build sạch, không lỗi console nghiêm trọng, kiểm thử logic liên quan đạt.
- Core lịch phải có kiểm thử độc lập với thuật toán được test (không tự dùng cùng hàm để tạo expected result).
- Dữ liệu sự kiện có tính nhất quán schema, không sai ngày cố định, có nguồn kiểm chứng ở cấp dữ liệu.
- Chuyển tab không mất tháng/ngày đang chọn; footer/header luôn cố định trong khi content cuộn.
- Khi xuất bản, mở đúng đường dẫn `https://phamquangtrung4504.github.io/lich-viet/`, không lỗi asset/404 do base path.
- Có thể thêm web lên màn hình chính. Không hứa offline hoặc cài IPA native.

## 9. Các quyết định chưa được phép tự suy đoán

- Bộ thuật toán âm lịch chính thức, giấy phép sử dụng và tập dữ liệu đối chiếu.
- Danh mục sự kiện ban đầu và danh sách nguồn thông tin được chấp nhận.
- Việc hiển thị can chi/giờ hoàng đạo nếu chưa xác minh, phạm vi năm đã kiểm thử.
- Logo/icon nhận diện, quyền sử dụng font và hình ảnh bên ngoài.

Khi triển khai đến các điểm trên: đề xuất phương án cụ thể, tác động và cách kiểm thử; không tự gắn dữ liệu giả để coi như hoàn thành.
