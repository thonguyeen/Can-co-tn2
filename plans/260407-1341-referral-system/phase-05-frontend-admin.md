# Phase 05: Frontend — Admin Control Panel
Status: ⬜ Pending
Dependencies: Phase 03 (Backend Admin API), Phase 04 (khuyên nên xong trước để tái dụng components)

## Objective
Xây dựng 3 trang Admin cho việc quản lý toàn bộ user, giám sát referral, và duyệt đổi quà.

---

## A. Trang `/admin/users` — Bảng Quản Lý User

### Layout tổng quan:
```
┌─────────────────────────────────────────────────────────────────┐
│  👥 QUẢN LÝ THÀNH VIÊN                   [+ Them diem thu cong] │
├─────────────────────────────────────────────────────────────────┤
│  [🔍 Tìm tên/email...] [Hạng ▼] [Trạng thái ▼] [Xuất CSV]     │
├───┬──────────────────┬───────┬───────┬────────┬─────────────────┤
│ # │ Người dùng       │ Hạng  │ Điểm  │ Lượt   │ Ngày tham gia  │
├───┼──────────────────┼───────┼───────┼────────┼─────────────────┤
│ 1 │ [Av] Lê Văn A    │ 💎 KCương│ 2,450│  87│ 01/01/2025     │
│ 2 │ [Av] Trần Thị B  │ 🥈 Bạch│   980│  32│ 15/02/2025     │
│...│ ...              │ ...   │ ...   │ ...    │ ...            │
└───┴──────────────────┴───────┴───────┴────────┴─────────────────┘
│ 1-20 / 340 users          [< Trước]  Trang 1  [Tiếp >]        │
└─────────────────────────────────────────────────────────────────┘
```

### Components:
- `UserTable` — sortable data table với pagination
- `TierBadge` — badge hiển thị hạng (tái dụng từ Phase 04)
- `UserSearchBar` — search + filter bar
- `BanStatusChip` — chip "Hoạt động" / "Bị khóa" (màu xanh/đỏ)

### Files:
- `app/app/(admin)/admin/users/page.tsx` — NEW

---

## B. Trang `/admin/users/[id]` — Chi Tiết User

### Layout tổng quan:
```
┌─────────────────────────────────────────────────────────────────┐
│  ← Quay lại                                                     │
│  [Avatar] Lê Văn A          [💎 Kim Cương]     [🔴 Khóa tài khoản]│
│  leva@mail.com  •  Tham gia: 01/01/2025  •  87 lượt giới thiệu │
├─────────────────────────────────────────────────────────────────┤
│  [Tab: Thông tin] [Tab: Lịch sử điểm] [Tab: Cây GT] [Tab: Vi phạm]│
├─────────────────────────────────────────────────────────────────┤
│  TAB: THÔNG TIN                                                 │
│  Điểm hiện tại: 2,450    Đã kiếm: 3,200    Đã tiêu: 750       │
│  ┌─────────────────────────────────────────┐                    │
│  │ ⚡ ĐIỀU CHỈNH ĐIỂM THỦ CÔNG            │                    │
│  │ Số điểm: [+100 ▼]  Lý do: [_______]   │                    │
│  │                         [Áp dụng]       │                    │
│  └─────────────────────────────────────────┘                    │
├─────────────────────────────────────────────────────────────────┤
│  TAB: LỊCH SỬ ĐIỂM                                             │
│  [+20] referral  •  Giới thiệu Trần B  •  2 ngày trước        │
│  [-50] boost     •  Đẩy bài "Cho thuê Q1" •  5 ngày trước     │
│  [+20] referral  •  Giới thiệu Nguyễn C •  1 tuần trước       │
├─────────────────────────────────────────────────────────────────┤
│  TAB: CÂY GIỚI THIỆU                                           │
│  Được giới thiệu bởi: [Av] Phạm D                              │
│  Đã giới thiệu: (87 người)                                      │
│  [Av] Trần Thị B  [Av] Nguyễn C  [Av] ...  [+ 84 người khác] │
└─────────────────────────────────────────────────────────────────┘
```

### Components:
- `UserDetailHeader` — header với avatar, tier badge, nút ban
- `PointAdjustForm` — form cộng/trừ điểm thủ công
- `PointTransactionLog` — bảng lịch sử điểm có type color coding
- `ReferralTreeView` — hiển thị referredBy + danh sách referrals đã giới thiệu
- `BanConfirmModal` — modal xác nhận trước khi khóa tài khoản

### Files:
- `app/app/(admin)/admin/users/[id]/page.tsx` — NEW
- `app/components/admin/PointAdjustForm.tsx` — NEW
- `app/components/admin/BanConfirmModal.tsx` — NEW

---

## C. Trang `/admin/referrals` — Dashboard Referral Tổng Quan

### Layout tổng quan:
```
┌─────────────────────────────────────────────────────────────────┐
│  📊 TỔNG QUAN REFERRAL                                          │
├────────────┬────────────┬────────────┬──────────────────────────┤
│ Hôm nay    │ Tháng này  │ Tổng cộng  │ User VIP (Kim Cương)    │
│   12 lượt  │ 234 lượt  │ 1,892 lượt │       3 người            │
├─────────────────────────────────────────┬───────────────────────┤
│  📈 TĂNG TRƯỞNG 30 NGÀY GẦN ĐÂY        │  💎 PHÂN BỐ HẠNG     │
│  [Line Chart - referrals per day]        │  [Pie Chart]          │
│                                          │  Kim Cương: 3 (0.9%) │
│                                          │  Bạch Kim: 12 (3.5%) │
│                                          │  Vàng: 45 (13.2%)    │
│                                          │  Bạc: 87 (25.6%)     │
│                                          │  Đồng: 193 (56.8%)  │
├─────────────────────────────────────────┴───────────────────────┤
│  🎁 ĐƠN ĐỔI QUÀ CHỜ DUYỆT (5 đơn)                            │
│  [Av] Lê A  •  Thẻ cào 50k  •  100 điểm  •  [✅ Duyệt] [❌ Từ chối]│
│  [Av] Trần B •  Voucher Grab  •  200 điểm •  [✅ Duyệt] [❌ Từ chối]│
└─────────────────────────────────────────────────────────────────┘
```

### Charts:
- **Line Chart:** Số lượt referral theo ngày (30 ngày) — dùng thư viện chart hiện có của app
- **Pie Chart:** Phân bố user theo tier

### Components:
- `ReferralSummaryCards` — 4 thống kê quan trọng
- `ReferralGrowthChart` — line chart 30 ngày
- `TierDistributionChart` — pie chart
- `PendingRedemptionList` — danh sách đơn chờ duyệt với nút approve/reject nhanh
- `RedemptionActionModal` — modal nhập admin note khi duyệt/từ chối

### Files:
- `app/app/(admin)/admin/referrals/page.tsx` — NEW
- `app/components/admin/ReferralGrowthChart.tsx` — NEW
- `app/components/admin/TierDistributionChart.tsx` — NEW
- `app/components/admin/PendingRedemptionList.tsx` — NEW

---

## Implementation Steps

- [ ] 1. Tạo trang `admin/users/page.tsx` với bảng user + filter
- [ ] 2. Tạo trang `admin/users/[id]/page.tsx` với 4 tabs
- [ ] 3. Tạo component `PointAdjustForm` với validation
- [ ] 4. Tạo component `BanConfirmModal`
- [ ] 5. Tạo trang `admin/referrals/page.tsx`
- [ ] 6. Tạo `ReferralGrowthChart` (line chart)
- [ ] 7. Tạo `TierDistributionChart` (pie chart)
- [ ] 8. Tạo `PendingRedemptionList` với approve/reject actions
- [ ] 9. Kiểm tra routes admin đã có trong middleware chưa

## Files to Create/Modify
- `app/app/(admin)/admin/users/page.tsx` — NEW
- `app/app/(admin)/admin/users/[id]/page.tsx` — NEW
- `app/app/(admin)/admin/referrals/page.tsx` — NEW
- `app/components/admin/PointAdjustForm.tsx` — NEW
- `app/components/admin/BanConfirmModal.tsx` — NEW
- `app/components/admin/ReferralGrowthChart.tsx` — NEW
- `app/components/admin/TierDistributionChart.tsx` — NEW
- `app/components/admin/PendingRedemptionList.tsx` — NEW
- `app/middleware.ts` — MODIFY (thêm `/admin/*` guard nếu chưa có)

## Test Criteria
- [ ] `/admin/users` hiển thị danh sách, filter theo tier hoạt động
- [ ] `/admin/users/[id]` tab "Lịch sử điểm" hiển thị đúng màu (xanh cộng, đỏ trừ)
- [ ] Form cộng điểm: nhập 50, lý do "Thưởng sự kiện" → thành công
- [ ] Pie chart hiển thị đúng % phân bố tier
- [ ] Duyệt đơn đổi quà → status chuyển sang "approved"
- [ ] Từ chối đơn → điểm hoàn lại user

---
Next Phase: [phase-06-integration-testing.md](./phase-06-integration-testing.md)
