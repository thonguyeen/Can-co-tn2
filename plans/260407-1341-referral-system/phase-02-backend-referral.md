# Phase 02: Backend — Referral & Boost API
Status: ✅ Complete
Dependencies: Phase 01 (Database Schema)

## Objective
Xây dựng toàn bộ API cho luồng User: tạo mã giới thiệu, xử lý referral khi đăng ký, tiêu điểm boost bài, đổi quà. Tạo thêm `ReferralService` tập trung logic tránh duplicate.

---

## A. Service Layer

### `app/lib/referral/referral-service.ts` (MỚI)
```typescript
export class ReferralService {
  // Tạo mã referral ngẫu nhiên 8 ký tự (chưa tồn tại)
  static generateCode(): string

  // Xử lý khi user mới đăng ký dùng referral code
  // 1. Validate code tồn tại
  // 2. Kiểm tra chưa từng được giới thiệu
  // 3. Tạo ReferralLog
  // 4. Cộng điểm cho người giới thiệu (20 điểm default)
  // 5. Tạo PointTransaction(type: "referral")
  // 6. Cập nhật totalReferrals
  // 7. Kiểm tra + nâng Tier nếu đủ điều kiện
  static async processReferral(referralCode: string, newUserId: string): Promise<void>

  // Tính tier dựa trên số lượt giới thiệu
  // 1→0, 2→3+, 3→10+, 4→30+, 5→100+
  static calculateTier(totalReferrals: number): number

  // Kiểm tra và nâng tier sau mỗi lần giới thiệu thành công
  static async checkAndUpgradeTier(profileId: string): Promise<void>
}
```

### `app/lib/referral/constants.ts` (MỚI)
```typescript
export const REFERRAL_POINTS = 20        // Điểm thưởng mỗi lượt giới thiệu
export const BOOST_POINTS_COST = 50      // Điểm để boost 1 bài 24h
export const BOOST_DURATION_HOURS = 24   // Thời gian boost
export const TIER_THRESHOLDS = [0, 3, 10, 30, 100] // Ngưỡng mỗi cấp
export const TIER_NAMES = ['Đồng', 'Bạc', 'Vàng', 'Bạch Kim', 'Kim Cương']
export const TIER_MULTIPLIERS = [1.0, 1.2, 1.5, 2.0, 3.0] // Nhân điểm theo hạng
```

---

## B. API Endpoints

### `/api/referral/code` — GET
Trả về mã giới thiệu của user hiện tại. Nếu chưa có thì tự động tạo mới.
```typescript
// Response:
{
  code: "ABC12345",
  referralUrl: "https://cancotn.com/dang-ky?ref=ABC12345",
  stats: {
    totalReferrals: 5,
    tier: 2,
    tierName: "Bạc",
    points: 120
  }
}
```

### `/api/referral/stats` — GET
Thống kê referral đầy đủ của user.
```typescript
// Response:
{
  tier: 2,
  tierName: "Bạc",
  totalReferrals: 5,
  nextTierAt: 10,        // cần bao nhiêu lượt để lên hạng tiếp
  points: 120,
  pointsEarned: 200,
  pointsSpent: 80,
  multiplier: 1.2
}
```

### `/api/referral/logs` — GET
Danh sách người đã giới thiệu (paginated).
```typescript
// Query params: page, limit
// Response:
{
  logs: [{
    id, refereeId, refereeName, refereeAvatar,
    pointsAwarded, createdAt
  }],
  total, page, limit
}
```

### `/api/referral/register` — POST (Internal — gọi từ register flow)
```typescript
// Body: { referralCode: string, newUserId: string }
// Xử lý toàn bộ referral logic qua ReferralService.processReferral()
```

### `/api/boosts` — POST
Tiêu điểm để boost 1 bài lên TOP.
```typescript
// Body: { intentId: string }
// Logic:
// 1. Kiểm tra user có đủ điểm không (>= 50)
// 2. Kiểm tra intent thuộc user (không boost bài của người khác)
// 3. Kiểm tra intent chưa đang được boost
// 4. Tạo IntentBoost (endAt = now + 24h)
// 5. Tạo PointTransaction(amount: -50, type: "boost")
// 6. Cập nhật UserStat.points - 50, totalPointsSpent + 50
```

### `/api/boosts/active` — GET
Trả về danh sách intentId đang được boost (dùng để sort feed).
```typescript
// Response: { boostedIntentIds: string[] }
```

### `/api/rewards` — GET
Catalog quà tặng còn hàng.

### `/api/rewards/redeem` — POST
```typescript
// Body: { rewardItemId: string }
// Logic:
// 1. Lấy RewardItem, check isActive + stock
// 2. Check user đủ điểm
// 3. Tạo RewardRedemption (status: pending)
// 4. Tạo PointTransaction(amount: -pointsCost, type: "redeem")
// 5. Giảm stock nếu != -1
```

### `/api/rewards/my-redemptions` — GET
Lịch sử đổi quà của user.

---

## C. Tích hợp với Register Flow

Tìm file xử lý đăng ký (POST `/api/auth/register` hoặc tương đương) và thêm:
```typescript
// Sau khi tạo user thành công:
if (body.referralCode) {
  await ReferralService.processReferral(body.referralCode, newProfile.id)
}
```
Nếu frontend đang dùng NextAuth Credentials, cập nhật form đăng ký để truyền `referralCode` từ URL query param.

---

## Implementation Steps

- [x] 1. Tạo `app/lib/referral/constants.ts`
- [x] 2. Tạo `app/lib/referral/referral-service.ts`
- [x] 3. Tạo `app/api/referral/code/route.ts` (GET)
- [x] 4. Tạo `app/api/referral/stats/route.ts` (GET)
- [x] 5. Tạo `app/api/referral/logs/route.ts` (GET)
- [x] 6. Tạo `app/api/referral/register/route.ts` (POST) (Tech Lead Change: Dropped API, integrated directly in `app/actions/auth.ts`)
- [x] 7. Tạo `app/api/boosts/route.ts` (POST)
- [x] 8. Tạo `app/api/boosts/active/route.ts` (GET)
- [x] 9. Tạo `app/api/rewards/route.ts` (GET)
- [x] 10. Tạo `app/api/rewards/redeem/route.ts` (POST)
- [x] 11. Tạo `app/api/rewards/my-redemptions/route.ts` (GET)
- [x] 12. Sửa Register flow để nhận và truyền referral code (Updated Page and Server Action)

## Files to Create/Modify
- `app/lib/referral/constants.ts` — NEW
- `app/lib/referral/referral-service.ts` — NEW
- `app/api/referral/code/route.ts` — NEW
- `app/api/referral/stats/route.ts` — NEW
- `app/api/referral/logs/route.ts` — NEW
- `app/api/referral/register/route.ts` — NEW
- `app/api/boosts/route.ts` — NEW
- `app/api/boosts/active/route.ts` — NEW
- `app/api/rewards/route.ts` — NEW
- `app/api/rewards/redeem/route.ts` — NEW
- `app/api/rewards/my-redemptions/route.ts` — NEW
- `app/app/(auth)/register/page.tsx` — MODIFY (đọc URL param `?ref=CODE`)

## Test Criteria
- [x] GET `/api/referral/code` trả về code (tự tạo nếu chưa có)
- [x] POST `/app/actions/auth.ts` với code hợp lệ → ReferralLog được tạo, điểm được cộng, Tier được nâng
- [x] POST `/app/actions/auth.ts` với tự refer → Không cộng điểm
- [x] POST `/api/boosts` với đủ điểm → IntentBoost tạo thành công, điểm bị trừ an toàn qua Atomic Decrement
- [x] POST `/api/boosts` với thiếu điểm → trả lỗi 402

---
Next Phase: [phase-03-backend-admin.md](./phase-03-backend-admin.md)
