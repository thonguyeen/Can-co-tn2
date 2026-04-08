# Phase 03: Backend — Admin API
Status: ⬜ Pending
Dependencies: Phase 01 (Database), Phase 02 (Referral Service)

## Objective
Xây dựng toàn bộ API cho Admin: quản lý user, xem/chỉnh điểm, duyệt đổi quà, xem dashboard referral tổng quan.

---

## Middleware cần kiểm tra
Tất cả endpoints `/api/admin/*` phải có guard:
```typescript
// Kiểm tra session.user.role === 'admin' hoặc dùng email whitelist
// Nếu không phải admin → trả 403 Forbidden
```

---

## API Endpoints

### `/api/admin/users` — GET
Bảng danh sách toàn bộ User với filter.
```typescript
// Query params:
//   search?: string   (tìm theo tên/email)
//   tier?: number     (lọc theo hạng 1-5)
//   banned?: boolean  (lọc user bị khóa)
//   page?: number
//   limit?: number (default 20)

// Response:
{
  users: [{
    id, name, email, avatarUrl,
    tier, totalReferrals,
    points, isBanned, createdAt
  }],
  total, page, limit,
  tierStats: { 1: 120, 2: 45, 3: 20, 4: 5, 5: 1 }  // số user mỗi hạng
}
```

### `/api/admin/users/[id]` — GET
Chi tiết đầy đủ một User.
```typescript
// Response:
{
  profile: { id, name, email, tier, totalReferrals, referralCode, referredBy },
  stats: { points, totalPointsEarned, totalPointsSpent, referralPoints },
  recentTransactions: PointTransaction[10],  // 10 gần nhất
  referralTree: {
    referredBy: { name, avatarUrl } | null,
    referrals: [{ name, avatarUrl, createdAt }]  // những người user này đã giới thiệu
  },
  achievements: UserAchievement[]
}
```

### `/api/admin/users/[id]/points` — POST
Admin cộng/trừ điểm thủ công.
```typescript
// Body: { amount: number, reason: string }
// amount > 0: cộng điểm | amount < 0: trừ điểm
// Logic:
// 1. Tạo PointTransaction(type: "manual", reason, amount)
// 2. Cập nhật UserStat.points
// 3. Nếu amount > 0: cập nhật totalPointsEarned
// 4. Nếu amount < 0: cập nhật totalPointsSpent (validate không âm)
```

### `/api/admin/users/[id]/ban` — POST
Khóa hoặc mở khóa tài khoản.
```typescript
// Body: { ban: boolean, reason?: string }
// Logic: Cập nhật Profile.isBanned + Profile.banReason + Profile.bannedAt
```

### `/api/admin/referrals` — GET
Dashboard tổng quan hệ thống referral.
```typescript
// Response:
{
  summary: {
    totalReferralsToday: number,
    totalReferralsThisMonth: number,
    totalReferralsAllTime: number
  },
  tierDistribution: [
    { tier: 1, tierName: "Đồng", count: 120 },
    { tier: 2, tierName: "Bạc", count: 45 },
    ...
  ],
  topReferrers: [{ name, avatarUrl, totalReferrals, tier }],  // Top 10
  dailyStats: [{ date, count }]  // 30 ngày gần nhất (cho biểu đồ)
}
```

### `/api/admin/redemptions` — GET
Danh sách đơn đổi quà chờ duyệt.
```typescript
// Query params: status?, page?, limit?
// Response: RewardRedemption[] với user info
```

### `/api/admin/redemptions/[id]` — PATCH
Duyệt hoặc từ chối đơn đổi quà.
```typescript
// Body: { status: 'approved' | 'rejected' | 'fulfilled', adminNote?: string }
// Logic:
// Nếu rejected → Hoàn lại điểm cho user (PointTransaction hoàn tiền)
```

### `/api/admin/reward-items` — GET + POST + PATCH + DELETE
CRUD catalog quà tặng.

---

## Implementation Steps

- [ ] 1. Tạo `app/lib/admin/guard.ts` — helper check admin role
- [ ] 2. Tạo `app/api/admin/users/route.ts` (GET)
- [ ] 3. Tạo `app/api/admin/users/[id]/route.ts` (GET)
- [ ] 4. Tạo `app/api/admin/users/[id]/points/route.ts` (POST)
- [ ] 5. Tạo `app/api/admin/users/[id]/ban/route.ts` (POST)
- [ ] 6. Tạo `app/api/admin/referrals/route.ts` (GET)
- [ ] 7. Tạo `app/api/admin/redemptions/route.ts` (GET)
- [ ] 8. Tạo `app/api/admin/redemptions/[id]/route.ts` (PATCH)
- [ ] 9. Tạo `app/api/admin/reward-items/route.ts` (GET + POST)
- [ ] 10. Tạo `app/api/admin/reward-items/[id]/route.ts` (PATCH + DELETE)

## Files to Create/Modify
- `app/lib/admin/guard.ts` — NEW
- `app/api/admin/users/route.ts` — NEW
- `app/api/admin/users/[id]/route.ts` — NEW
- `app/api/admin/users/[id]/points/route.ts` — NEW
- `app/api/admin/users/[id]/ban/route.ts` — NEW
- `app/api/admin/referrals/route.ts` — NEW
- `app/api/admin/redemptions/route.ts` — NEW
- `app/api/admin/redemptions/[id]/route.ts` — NEW
- `app/api/admin/reward-items/route.ts` — NEW
- `app/api/admin/reward-items/[id]/route.ts` — NEW

## Test Criteria
- [ ] GET `/api/admin/users` không có auth → 403
- [ ] GET `/api/admin/users` có admin auth → danh sách user
- [ ] POST `/api/admin/users/[id]/points` amount=50 → points tăng 50
- [ ] PATCH `/api/admin/redemptions/[id]` status=rejected → điểm hoàn lại

---
Next Phase: [phase-04-frontend-user.md](./phase-04-frontend-user.md)
