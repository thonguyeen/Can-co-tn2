# 💡 BRIEF: Hệ thống Giới Thiệu Thành Viên & Quản Lý User

**Ngày tạo:** 2026-04-07
**Thuộc dự án:** Cần & Có Platform

---

## 1. VẤN ĐỀ CẦN GIẢI QUYẾT

Nền tảng Cần & Có cần một cơ chế tăng trưởng người dùng tự nhiên (organic growth) thông qua việc khuyến khích user hiện tại giới thiệu bạn bè. Đồng thời cần một trang quản trị user tập trung để Admin kiểm soát toàn bộ hệ thống người dùng và phát hiện hành vi gian lận (fake accounts, gaming the referral system).

## 2. GIẢI PHÁP ĐỀ XUẤT

Xây dựng **Hệ thống Referral 5 Cấp Bậc** tích hợp với gamification hiện có:
- Mỗi User được cấp một **mã/link giới thiệu** độc quyền
- Khi người khác đăng ký qua link đó → Người giới thiệu nhận **điểm thưởng**
- Điểm tích lũy nâng cấp **Hạng thành viên (Tier)** với đặc quyền ngày càng cao
- Điểm có thể **tiêu dùng** để đẩy bài, đổi quà
- Admin có **Control Panel** đầy đủ để theo dõi và kiểm soát

## 3. ĐỐI TƯỢNG SỬ DỤNG

- **Primary User:** Thành viên Cần & Có muốn kiếm điểm và thăng hạng
- **Secondary User:** Admin/Super Admin quản lý và kiểm soát hệ thống referral

---

## 4. TÍNH NĂNG

### 🚀 MVP — Bắt buộc có:

**PHẦN A: Giao diện User (Dashboard Referral)**
- [ ] Trang `/profile/referral` — khu referral cá nhân
  - Hiển thị mã giới thiệu + nút Copy + link share
  - Thống kê: "Bạn đã mời X người | Điểm hiện tại: Y"
  - Danh sách người đã giới thiệu (tên, ngày tham gia, điểm nhận được)
- [ ] Cấp bậc 5 tầng (Tier) + thanh progress bar
  - **Hạng 1 — Đồng:** 0 lượt giới thiệu
  - **Hạng 2 — Bạc:** 3+ lượt → nhận 1.2x điểm/giao dịch
  - **Hạng 3 — Vàng:** 10+ lượt → nhận 1.5x điểm + badge vàng
  - **Hạng 4 — Bạch Kim:** 30+ lượt → đẩy bài miễn phí 1 lần/tuần
  - **Hạng 5 — Kim Cương:** 100+ lượt → VIP, ưu tiên hỗ trợ, huy hiệu đặc biệt
- [ ] Bảng Xếp Hạng (Leaderboard) — Top 10/50 user giới thiệu nhiều nhất tháng

**PHẦN B: Tiêu Điểm (Spending)**
- [ ] "Dùng 50 điểm → Đẩy bài CẦN/CÓ lên TOP 24h"
- [ ] "Yêu cầu đổi quà" — Admin duyệt thủ công (MVP)

**PHẦN C: Admin Control Panel**
- [ ] Trang `/admin/users` — Bảng quản lý toàn bộ User
  - Filter/Search theo hạng, trạng thái, điểm
  - Cột: Avatar, Tên, Email, Hạng, Điểm, Số lượt giới thiệu, Ngày tham gia
- [ ] Trang `/admin/users/[id]` — Chi tiết một User
  - Xem lịch sử điểm (PointTransaction log)
  - Cộng/Trừ điểm thủ công (có lý do)
  - Xem cây giới thiệu (ai giới thiệu ai)
  - Khóa/Mở khóa tài khoản
- [ ] Trang `/admin/referrals` — Tổng quan Referral
  - Biểu đồ: Số lượt giới thiệu theo ngày/tuần/tháng
  - Bảng User theo Tier (bao nhiêu người/cấp)
  - Danh sách đơn đổi quà chờ duyệt

### 🎁 Phase 2 — Làm sau:
- [ ] Tự động hóa kho quà (voucher số, mã cào)
- [ ] Multi-level referral (hoa hồng cấp 2 — người bạn giới thiệu lại giới thiệu người khác)
- [ ] Email/Push notification khi được thăng hạng
- [ ] Referral Analytics nâng cao (conversion rate, churn rate)

---

## 5. DATABASE — Models cần thêm/sửa

### Thêm mới:
```
ReferralCode        — mã giới thiệu của từng user (code, userId, usageCount)
ReferralLog         — log mỗi lần giới thiệu thành công (referrerId, refereeId, pointsAwarded, createdAt)
RewardRedemption    — đơn đổi quà (userId, rewardType, pointsCost, status, adminNote)
IntentBoost         — bài viết được đẩy lên top (intentId, userId, startAt, endAt, pointsSpent)
```

### Sửa model có sẵn:
```
Profile             — thêm: referralCode (unique), referredBy (userId), tier (1-5), totalReferrals
UserStat            — thêm: referralPoints (điểm từ referral), totalPointsEarned, totalPointsSpent
PointTransaction    — thêm: type (referral | boost | redeem | manual), referenceId
```

---

## 6. ƯỚC TÍNH SƠ BỘ

- **Độ phức tạp:** Trung bình
- **Rủi ro:** Người dùng tạo tài khoản ảo để tự referral → Cần kiểm soát bằng IP log hoặc số điện thoại xác minh
- **Phụ thuộc:**  Hệ thống Gamification/PointTransaction đã có sẵn → Mở rộng trực tiếp

---

## 7. BƯỚC TIẾP THEO
→ Chạy `/plan` để thiết kế DB Schema, API routes, và UI chi tiết
