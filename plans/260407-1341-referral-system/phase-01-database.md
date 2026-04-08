# Phase 01: Database Schema
Status: ⬜ Pending
Dependencies: None

## Objective
Mở rộng Prisma schema để hỗ trợ hệ thống Referral, Boost, và Rewards. Chạy db push vào local Docker để sync schema.

---

## A. Sửa Models Hiện Có

### 1. Model `Profile` — thêm referral fields
```prisma
model Profile {
  // === EXISTING FIELDS (giữ nguyên) ===
  // ...

  // === REFERRAL (MỚI) ===
  referralCode      String?   @unique @map("referral_code")
  referredBy        String?   @map("referred_by")        // profileId của người giới thiệu
  tier              Int?      @default(1)                 // 1=Đồng 2=Bạc 3=Vàng 4=BạchKim 5=KimCương
  totalReferrals    Int?      @default(0) @map("total_referrals")

  // === RELATIONS (MỚI) ===
  referralsMade     ReferralLog[]     @relation("Referrer")
  referralsReceived ReferralLog[]     @relation("Referee")
  intentBoosts      IntentBoost[]
  rewardRedemptions RewardRedemption[]
}
```

### 2. Model `UserStat` — thêm spending tracking
```prisma
model UserStat {
  // === EXISTING FIELDS (giữ nguyên) ===
  // ...

  // === SPENDING TRACKING (MỚI) ===
  totalPointsEarned Int? @default(0) @map("total_points_earned")
  totalPointsSpent  Int? @default(0) @map("total_points_spent")
  referralPoints    Int? @default(0) @map("referral_points")
}
```

### 3. Model `PointTransaction` — thêm type & referenceId
```prisma
model PointTransaction {
  // === EXISTING FIELDS (giữ nguyên) ===
  id        String    @id @default(uuid())
  userId    String    @map("user_id")
  amount    Int
  reason    String
  createdAt DateTime? @default(now()) @map("created_at") @db.Timestamptz

  // === THÊM MỚI ===
  type         String?  @default("other")    // referral | boost | redeem | bot_chat | manual
  referenceId  String?  @map("reference_id") // ID của ReferralLog / IntentBoost / RewardRedemption

  user Profile @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@map("point_transactions")
}
```

### 4. Model `Intent` — thêm boost relation
```prisma
model Intent {
  // === EXISTING FIELDS (giữ nguyên) ===
  // ...

  // === THÊM RELATION ===
  boosts IntentBoost[]
}
```

---

## B. Thêm 4 Models Mới

### ReferralLog — log mỗi lần giới thiệu thành công
```prisma
model ReferralLog {
  id            String    @id @default(uuid())
  referrerId    String    @map("referrer_id")
  refereeId     String    @map("referee_id")
  pointsAwarded Int       @map("points_awarded")
  createdAt     DateTime? @default(now()) @map("created_at") @db.Timestamptz

  referrer Profile @relation("Referrer", fields: [referrerId], references: [id], onDelete: Cascade)
  referee  Profile @relation("Referee",  fields: [refereeId],  references: [id], onDelete: Cascade)

  @@unique([referrerId, refereeId])
  @@map("referral_logs")
}
```

### IntentBoost — bài viết được đẩy lên TOP
```prisma
model IntentBoost {
  id          String    @id @default(uuid())
  intentId    String    @map("intent_id")
  userId      String    @map("user_id")
  pointsSpent Int       @map("points_spent")
  startAt     DateTime  @map("start_at") @db.Timestamptz
  endAt       DateTime  @map("end_at")   @db.Timestamptz
  createdAt   DateTime? @default(now())  @map("created_at") @db.Timestamptz

  intent Intent  @relation(fields: [intentId], references: [id], onDelete: Cascade)
  user   Profile @relation(fields: [userId],   references: [id], onDelete: Cascade)

  @@map("intent_boosts")
}
```

### RewardRedemption — yêu cầu đổi quà
```prisma
model RewardRedemption {
  id          String    @id @default(uuid())
  userId      String    @map("user_id")
  rewardItemId String?  @map("reward_item_id")
  rewardLabel String    @map("reward_label")
  pointsCost  Int       @map("points_cost")
  status      String    @default("pending")  // pending | approved | rejected | fulfilled
  adminNote   String?   @map("admin_note")
  createdAt   DateTime? @default(now()) @map("created_at") @db.Timestamptz
  updatedAt   DateTime? @default(now()) @map("updated_at") @db.Timestamptz

  user       Profile     @relation(fields: [userId], references: [id], onDelete: Cascade)
  rewardItem RewardItem? @relation(fields: [rewardItemId], references: [id])

  @@map("reward_redemptions")
}
```

### RewardItem — catalog quà tặng (Admin quản lý)
```prisma
model RewardItem {
  id          String    @id @default(uuid())
  label       String
  description String?
  pointsCost  Int       @map("points_cost")
  stock       Int?      @default(-1)         // -1 = unlimited
  isActive    Boolean?  @default(true)       @map("is_active")
  imageUrl    String?   @map("image_url")
  createdAt   DateTime? @default(now())      @map("created_at") @db.Timestamptz

  redemptions RewardRedemption[]

  @@map("reward_items")
}
```

---

## Implementation Steps

- [ ] 1. Mở `app/prisma/schema.prisma`
- [ ] 2. Thêm fields mới vào `Profile` model
- [ ] 3. Thêm fields mới vào `UserStat` model
- [ ] 4. Thêm `type` + `referenceId` vào `PointTransaction` model
- [ ] 5. Thêm relation `boosts` vào `Intent` model
- [ ] 6. Thêm 4 models mới: `ReferralLog`, `IntentBoost`, `RewardRedemption`, `RewardItem`
- [ ] 7. Chạy `npx prisma db push` (local Docker)
- [ ] 8. Chạy `npx prisma generate`
- [ ] 9. Verify: Kiểm tra các bảng đã tồn tại trong DB

## Files to Create/Modify
- `app/prisma/schema.prisma` — MODIFY

## Test Criteria
- [ ] `npx prisma db push` không báo lỗi
- [ ] Bảng `referral_logs`, `intent_boosts`, `reward_redemptions`, `reward_items` tồn tại
- [ ] Cột `referral_code`, `tier`, `total_referrals` tồn tại trong `profiles`
- [ ] Không có breaking change ảnh hưởng code cũ

---
Next Phase: [phase-02-backend-referral.md](./phase-02-backend-referral.md)
