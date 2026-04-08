# Phase 04: Frontend — User Dashboard
Status: ⬜ Pending
Dependencies: Phase 02 (Backend Referral & Boost API)

## Objective
Xây dựng 3 trang giao diện cho User: Dashboard Referral cá nhân, Bảng Xếp Hạng, và Cửa Hàng Đổi Quà. Phong cách visual nhất quán với giao diện Cần & Có hiện có (dark sidebar, card-based).

---

## A. Trang `/profile/referral` — Dashboard Referral Cá Nhân

### Layout tổng quan:
```
┌─────────────────────────────────────────────────┐
│  🏅 HẠN MỨC CỦA BẠN                            │
│  [Badge Bạc] Hạng Bạc              5/10 lượt    │
│  ████████░░░░  "Còn 5 lượt nữa → Hạng Vàng"   │
├─────────────────────────────────────────────────┤
│  📊 THỐNG KÊ                                    │
│  [5 lượt] [120 điểm] [80 đã tiêu]             │
├─────────────────────────────────────────────────┤
│  🔗 MÃ GIỚI THIỆU CỦA BẠN                      │
│  ┌──────────────┐  [📋 Copy]  [📤 Chia sẻ]     │
│  │  ABC12345    │                               │
│  └──────────────┘                               │
│  Link: cancotn.com/dang-ky?ref=ABC12345         │
├─────────────────────────────────────────────────┤
│  👥 NGƯỜI BẠN ĐÃ GIỚI THIỆU                    │
│  [Avatar] Nguyễn Văn A  •  +20 điểm  •  3 ngày trước │
│  [Avatar] Trần Thị B    •  +20 điểm  •  1 tuần trước  │
│  ...                                            │
├─────────────────────────────────────────────────┤
│  [🚀 Đẩy bài — 50 điểm]  [🎁 Đổi quà]        │
└─────────────────────────────────────────────────┘
```

### Components cần tạo:
- `TierCard` — hiển thị badge + progress bar + tên hạng + multiplier
- `ReferralCodeBox` — copy button, share button, QR code nhỏ
- `StatsRow` — 3 số: lượt giới thiệu | điểm hiện có | điểm đã tiêu
- `ReferralLogTable` — danh sách người đã giới thiệu (paginated)
- `TierInfoModal` — popup giải thích 5 cấp bậc và đặc quyền

### Files:
- `app/app/(main)/profile/referral/page.tsx` — NEW
- `app/components/referral/TierCard.tsx` — NEW
- `app/components/referral/ReferralCodeBox.tsx` — NEW
- `app/components/referral/StatsRow.tsx` — NEW
- `app/components/referral/ReferralLogTable.tsx` — NEW
- `app/styles/referral.module.css` — NEW

---

## B. Trang `/leaderboard` — Bảng Xếp Hạng

### Layout tổng quan:
```
┌─────────────────────────────────────────────────┐
│  🏆 BẢNG XẾP HẠNG — REFERRAL                   │
│  [Tab: Tháng này] [Tab: Tất cả thời gian]       │
├─────────────────────────────────────────────────┤
│        🥈              🥇              🥉        │
│    [Avatar]        [Avatar]        [Avatar]      │
│    Trần B          Lê A            Phạm C        │
│    32 lượt         87 lượt         28 lượt       │
│    [Bạch Kim]    [Kim Cương]      [Bạch Kim]     │
├─────────────────────────────────────────────────┤
│  Hạng │ Người dùng        │ Lượt │ Điểm │ Hạng │
│  ─────┼────────────────── ┼──────┼──────┼───── │
│   4.  │ [Av] Bùi Xuân D   │  20  │ 500  │ Vàng  │
│   5.  │ [Av] Hồ Thị E     │  15  │ 380  │ Vàng  │
│  ...                                            │
│  ★ 28. (BẠN) Bạn đứng hạng 28                  │
└─────────────────────────────────────────────────┘
```

### Components:
- `LeaderboardPodium` — Top 3 với podium visual (1st cao nhất)
- `LeaderboardTable` — Bảng top 50, highlight hàng user đang đăng nhập
- Tab switch (Tháng này / Tất cả)

### Files:
- `app/app/(main)/leaderboard/page.tsx` — NEW
- `app/components/referral/LeaderboardPodium.tsx` — NEW
- `app/components/referral/LeaderboardTable.tsx` — NEW

---

## C. Trang `/rewards` — Cửa Hàng Đổi Quà

### Layout tổng quan:
```
┌─────────────────────────────────────────────────┐
│  🎁 CỬA HÀNG ĐỔI QUÀ              120 điểm ⭐  │
├─────────────────────────────────────────────────┤
│  ⚡ TÍNH NĂNG BÀI ĐĂNG                          │
│  ┌────────────────────────────────────┐          │
│  │ 🚀 Đẩy bài lên TOP 24h            │          │
│  │ Bài của bạn xuất hiện đầu feed    │          │
│  │ [Chọn bài] ─── [💎 50 điểm]       │          │
│  └────────────────────────────────────┘          │
├─────────────────────────────────────────────────┤
│  🎁 QUÀ TẶNG                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Thẻ cào  │  │ Voucher  │  │ Ưu đãi   │       │
│  │   50k    │  │  Grab    │  │ Premium  │       │
│  │ 100 điểm │  │ 200 điểm │  │ 500 điểm │       │
│  │ [Đổi]   │  │ [Đổi]   │  │ [Đổi]   │       │
│  └──────────┘  └──────────┘  └──────────┘       │
├─────────────────────────────────────────────────┤
│  📋 LỊCH SỬ ĐỔI QUÀ                            │
│  Thẻ cào 50k  •  Đang xử lý...  •  2 ngày trước│
└─────────────────────────────────────────────────┘
```

### Components:
- `RewardCard` — card quà với điểm yêu cầu + nút đổi
- `BoostIntentModal` — chọn bài đăng nào muốn boost
- `ConfirmSpendModal` — confirm tiêu điểm trước khi thực hiện
- `RedemptionHistory` — lịch sử đổi quà của user

### Files:
- `app/app/(main)/rewards/page.tsx` — NEW
- `app/components/referral/RewardCard.tsx` — NEW
- `app/components/referral/BoostIntentModal.tsx` — NEW
- `app/components/referral/ConfirmSpendModal.tsx` — NEW

---

## D. Tích hợp vào Sidebar/Navigation

Thêm menu items vào sidebar hiện có:
- **"Bạch Kim"** (badge tier của user) bên cạnh avatar/tên
- Menu: "Giới Thiệu Bạn Bè" → `/profile/referral`
- Menu: "Bảng Xếp Hạng" → `/leaderboard`
- Menu: "Đổi Quà" → `/rewards`

---

## Implementation Steps

- [ ] 1. Tạo `app/styles/referral.module.css` với design tokens
- [ ] 2. Tạo component `TierCard`
- [ ] 3. Tạo component `ReferralCodeBox` (với clipboard copy)
- [ ] 4. Tạo component `StatsRow`
- [ ] 5. Tạo component `ReferralLogTable`
- [ ] 6. Tạo trang `/profile/referral/page.tsx`
- [ ] 7. Tạo component `LeaderboardPodium`
- [ ] 8. Tạo component `LeaderboardTable`
- [ ] 9. Tạo trang `/leaderboard/page.tsx`
- [ ] 10. Tạo component `RewardCard`
- [ ] 11. Tạo component `BoostIntentModal`
- [ ] 12. Tạo component `ConfirmSpendModal`
- [ ] 13. Tạo trang `/rewards/page.tsx`
- [ ] 14. Cập nhật Sidebar: thêm tier badge + 3 menu items mới
- [ ] 15. Cập nhật trang đăng ký: đọc `?ref=CODE` từ URL và gửi kèm

## Files to Create/Modify
- `app/app/(main)/profile/referral/page.tsx` — NEW
- `app/app/(main)/leaderboard/page.tsx` — NEW
- `app/app/(main)/rewards/page.tsx` — NEW
- `app/components/referral/` — NEW folder với 7 components
- `app/styles/referral.module.css` — NEW
- `app/components/layout/Sidebar.tsx` (hoặc tương đương) — MODIFY

## Test Criteria
- [ ] `/profile/referral` load được, hiển thị mã referral đúng
- [ ] Bấm "Copy" → clipboard nhận được link đúng
- [ ] Tier badge hiển thị đúng tier của user đang đăng nhập
- [ ] Progress bar tính đúng % tiến độ đến tier tiếp theo
- [ ] `/leaderboard` hiển thị podium top 3, highlight hàng của bản thân
- [ ] `/rewards` list quà từ API, nút "Đổi" disabled khi thiếu điểm

---
Next Phase: [phase-05-frontend-admin.md](./phase-05-frontend-admin.md)
