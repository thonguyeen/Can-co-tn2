# Phase 06: Integration & Testing
Status: ⬜ Pending
Dependencies: Phase 01–05 (Tất cả)

## Objective
Kết nối toàn bộ luồng end-to-end, chạy test tổng hợp, đảm bảo không có regression cho các tính năng cũ. Seed thêm dữ liệu referral vào local DB để demo.

---

## A. End-to-End Flow Tests

### Flow 1: Luồng Giới Thiệu Thành Viên
```
1. User A đăng nhập → Vào /profile/referral → Copy link
2. Mở tab ẩn danh → Truy cập link (URL có ?ref=CODE)
3. Đăng ký tài khoản mới (User B)
4. Verify:
   ✅ Profile B có referredBy = A's profileId
   ✅ ReferralLog được tạo (referrerId=A, refereeId=B, points=20)
   ✅ PointTransaction của A: amount=+20, type="referral"
   ✅ UserStat A: points tăng 20, totalReferrals tăng 1
   ✅ Trang /profile/referral của A: số lượt tăng lên
```

### Flow 2: Tiêu Điểm Đẩy Bài
```
1. User A có ≥50 điểm → Vào /rewards
2. Bấm "Đẩy bài" → Chọn Intent của mình → Confirm
3. Verify:
   ✅ IntentBoost tạo thành công (endAt = now + 24h)
   ✅ PointTransaction: amount=-50, type="boost"
   ✅ UserStat: points giảm 50, totalPointsSpent tăng 50
   ✅ Intent xuất hiện đầu feed (GET /api/intents sorted by boost)
   ✅ Sau 24h: boost hết hiệu lực (intent không còn đầu feed)
```

### Flow 3: Đổi Quà
```
1. User A có ≥100 điểm → Bấm "Đổi Thẻ cào 50k"
2. Confirm → Gửi đơn RewardRedemption (status: pending)
3. Admin vào /admin/referrals → Thấy đơn trong bảng chờ duyệt
4. Admin bấm "Duyệt" + ghi note "Đã gửi mã qua email"
5. Verify:
   ✅ Status đơn = "approved"
   ✅ Điểm A không bị trừ lại (đã trừ lúc tạo đơn)
6. Admin bấm "Từ chối" một đơn khác
7. Verify:
   ✅ Status = "rejected"
   ✅ PointTransaction hoàn tiền: amount=+100, type="refund", reason="Đơn đổi quà bị từ chối"
```

### Flow 4: Nâng Tier Tự Động
```
1. User A có totalReferrals = 9 (Hạng Bạc)
2. Giới thiệu thêm 1 người → totalReferrals = 10
3. Verify:
   ✅ Profile.tier tự động cập nhật từ 2 → 3 (Vàng)
   ✅ Bảng xếp hạng /leaderboard cập nhật badge
   ✅ Trang /profile/referral hiển thị "Hạng Vàng" mới
```

---

## B. Regression Tests

Đảm bảo không ảnh hưởng tính năng cũ:
- [ ] Feed CẦN/CÓ vẫn load bình thường
- [ ] Chat vẫn hoạt động
- [ ] Đăng/sửa tin vẫn OK
- [ ] Gamification bot chat vẫn cộng điểm (PointTransaction type="bot_chat")
- [ ] `npm run build` không có lỗi TypeScript

---

## C. Seed Data cho Demo

Thêm vào `app/prisma/seed.ts`:
```typescript
// Tạo referral codes cho các users hiện có
// Tạo ReferralLogs mẫu (User 2, 3, 4 được giới thiệu bởi User 1)
// Tạo RewardItems mẫu
// Tạo IntentBoost đang active cho 1 intent
// Tạo 2-3 RewardRedemption với status khác nhau
```

---

## D. Feed Sorting — Tích hợp Boost vào API

Sửa `/api/intents` (hoặc `/api/feed`) để ưu tiên bài đang boost:
```typescript
// Logic sort:
// 1. Lấy list intentId đang active boost (endAt > now)
// 2. Khi query intents: ORDER BY (intentId IN boostedIds) DESC, createdAt DESC
// Hoặc dùng CASE WHEN trong raw query
```

---

## Implementation Steps

- [ ] 1. Thêm seed data referral vào `app/prisma/seed.ts`
- [ ] 2. Chạy `npm run db:local` để reset + seed lại
- [ ] 3. Kiểm tra Flow 1 bằng tay (đăng ký qua link)
- [ ] 4. Kiểm tra Flow 2 bằng tay (đẩy bài)
- [ ] 5. Kiểm tra Flow 3 bằng tay (đổi quà + duyệt/từ chối)
- [ ] 6. Kiểm tra Flow 4 bằng tay (nâng tier)
- [ ] 7. Sửa `/api/intents` để sort bài đang boost lên đầu
- [ ] 8. Kiểm tra regression: feed, chat, gamification
- [ ] 9. Chạy `npm run build` → không có lỗi
- [ ] 10. Commit code với message: "feat: referral system MVP"

## Files to Create/Modify
- `app/prisma/seed.ts` — MODIFY (thêm referral seed data)
- `app/api/intents/route.ts` — MODIFY (boost sorting)

## Final Checklist
- [ ] ✅ Tất cả 4 flows hoạt động end-to-end
- [ ] ✅ Admin có thể thấy và quản lý toàn bộ referral data
- [ ] ✅ Không có regression
- [ ] ✅ `npm run build` pass
- [ ] ✅ Code committed

---
🎉 **KẾT THÚC — Referral System MVP hoàn chỉnh!**

## Phase tiếp theo (Tương lai)
- Multi-level referral (hoa hồng cấp 2)
- Push notification khi thăng hạng
- Tự động hóa kho quà (mã voucher số)
- Referral Analytics nâng cao
