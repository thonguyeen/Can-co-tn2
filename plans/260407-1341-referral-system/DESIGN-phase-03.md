# 🎨 DESIGN: Phase 03 - Backend Admin API

Ngày tạo: 2026-04-08
Dựa trên: `phase-03-backend-admin.md`

---

## 1. Cách App Phân Quyền (Authentication & Authorization)
**Ý tưởng:** Giống như cái "thẻ từ" của bác bảo vệ ở tầng hầm tòa nhà. Chỉ ai cầm "thẻ Admin" màu đỏ thì chiếc máy quét (middleware) mới cho mở cửa bước vào phòng điều khiển để gọi các chức năng quản lý.
- **Thực tế:** Hệ thống sẽ dùng danh sách đóng (Email Whitelist) để kiểm tra. User nào quét thẻ mà thông tin email trùng tài khoản admin (vd: `test@admin.com`) thì mới được chạy tính năng.

## 2. Cách Lưu Trữ Thông Tin (Data Schema)
Hệ thống sử dụng các "Sheet Excel" (Bảng cơ sở dữ liệu) đã chuẩn bị sẵn ở đợt sửa chữa trước (Phase 1).
- **Sheet `Profile`**: Trạm tổng hợp! Lưu thông tin người dùng, trạng thái bị khóa (Ban), cấp hạng vòng loại (Tier).
- **Sheet `PointTransaction`**: Quyến sổ sao kê ngân hàng. Mọi thao tác Admin rút/vứt điểm vào cho user thì hệ thống sẽ ghi sổ chi tiết ở đây (Kiểu giao dịch: "Tự động tay to", Lý do: "Tặng vì ngoan").
- **Sheet `RewardRedemption`**: Cặp tài liệu chờ ký duyệt. Chứa các đơn xin đổi quà của user.

## 3. Các Phím Bấm Của Bảng Điều Khiển (API Endpoints)

| Máy báo nhận thông tin (API) | Nhiệm vụ (Mục đích) |
|------------------------------|---------------------|
| `GET /api/admin/users` | Lấy ra cuốn sổ tay toàn bộ user. Có bộ lộc để rà soát danh sách bị khóa, hoặc kiếm theo tên.|
| `GET /api/admin/users/[id]` | Mở hồ sơ đầy đủ của 1 user cụ thể (Xem cả gia phả nó mời ai, lịch sử chi tiêu). |
| `POST /api/admin/users/[id]/points` | Cơ chế "Bàn Tay Ma Thuật" - Admin tự bơm hoặc trấn lột bớt điểm của user.|
| `POST /api/admin/users/[id]/ban` | Tịch thu tài sản, khóa tài khoản hoặc ân xá phục hồi nhân phẩm cho user. |
| `GET /api/admin/referrals` | Bảng tổng kế KPI, thống kê lượng user rủ nhau vào chơi mỗi ngày. |
| `GET & PATCH /api/admin/redemptions`| Bốc các lá đơn đổi quà xem xét, "Đồng ý" chuyển thành hàng thực, "Từ chối" trả lại điểm. |
| `CRUD /api/admin/reward-items` | Kho chứa các món quà lấp lánh - Nơi Admin thêm quà, trưng bày hoặc cất món cũ đi. |

## 4. Hành Trình Thông Thường (Admin Journey)

**Hành trình số 1: Trấn áp tội phạm (Rút điểm & Ban)**
1. Admin kiểm tra bảng tổng kết mỗi sáng (`users`).
2. Phát giác một ai đó gian lận để cày điểm lên hạng rồng! Gọi xem ngay hồ sơ người này (`users/[id]`).
3. Ra quyết định bấm nút trừ sạch mọi điểm mà họ tích sai trái (`users/[id]/points` với số tiền `-1000`).
4. Khóa tài khoản làm gương luôn (`users/[id]/ban`).

**Hành trình số 2: Xét duyệt quà**
1. Mở xem các đơn hàng mới hôm nay do users yêu cầu đổi (`redemptions`).
2. Duyệt phát thẻ quà tặng (approved) cho User A.
3. User B đòi cái tủ lạnh nhưng kho hết mất rồi -> "Từ chối". Đơn này bị từ chối hệ thống tự động gọi ngược tới sổ tay (PointTransaction) hoàn lại điểm vào kho của User B.

## 5. Bộ Khung Kiểm Tra Tính Đúng Đắn (Acceptance Criteria & Test Cases)

### TC-01: Phân tầng chức vụ (Bảo vệ cổng gác)
- **Tình huống (Given):** Tôi là người dùng bình thường, thử lẻn vào.
- **Hành động (When):** Tôi cố truy xuất đường ranh giới `/api/admin/users`.
- **Kết quả mong đợi (Then):**
  - Tôi bị màn hình đuổi báo rành rành: `Lỗi 403 Forbidden` (Bạn không có quyền!).

### TC-02: Quy trình tự động trả lại điểm khi hủy đơn quà (Atomic Refund)
- **Tình huống (Given):** Người dùng X vừa bị trừ đi 100 điểm để đăng ký xin gói voucher. Đơn quà lúc này trạng thái `pending`.
- **Hành động (When):** Admin không đồng ý phát gói voucher, ấn nút chọn `Từ chối (rejected)`.
- **Kết quả mong đợi (Then):**
  - Trạng thái giấy tờ chuyển thành Rejected.
  - Số điểm 100 đó tự động quay về kho tổng của X. Lịch sử sao kê (PointTransaction) có 1 dòng xanh lóng lánh: "Hoàn lại nguyên vẹn".

### TC-03: Trừ điểm thì không được biến thành Số Âm
- **Tình huống (Given):** Bé mầm non Y có đúng 25 điểm để dành.
- **Hành động (When):** Admin vô tình bấm lố, muốn trừ tới `100` điểm!
- **Kết quả mong đợi (Then):** Hệ thống gào lên cảnh báo `400 Bad Request` vì "Số điểm chuẩn bị trừ còn cao hơn tổng tài sản, không cho nợ!".
