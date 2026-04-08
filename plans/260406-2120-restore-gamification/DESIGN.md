# 🎨 DESIGN: Restore Gamification & Push Notification Logic

Ngày tạo: 2026-04-06
Dựa trên: `plans/260406-2120-restore-gamification/plan.md`
Audit report: `docs/reports/audit_2026-04-06.md`

---

## 1. Bối Cảnh

Khi di cư từ Supabase sang Prisma, 10 đoạn code truy vấn database đã được
comment (vô hiệu hóa) bằng cách thêm `// TODO: Restore` vì lúc đó 4 bảng
Gamification chưa tồn tại trong Prisma schema.

Bây giờ, 4 bảng đã được tạo xong ở `schema.prisma` và đã push lên production DB,
nên cần phục hồi (uncomment) các đoạn code này.

---

## 2. Sơ Đồ Dữ Liệu (Database - ĐÃ CÓ SẴN)

```
┌──────────────────────────────────────────────────────┐
│  👤 PROFILE (profiles)                                │
│  ├── id (PK, uuid)                                   │
│  ├── displayName, avatarUrl, trustScore...           │
└───────────┬──────────────────────┬───────────────────┘
            │                      │
   1 profile có                   1 profile có
   nhiều giao dịch điểm           nhiều huy hiệu
            │                      │
            ▼                      ▼
┌───────────────────────┐  ┌───────────────────────────┐
│ 💎 POINT_TRANSACTIONS │  │ 🏆 USER_ACHIEVEMENTS      │
│ ├── id (PK, uuid)     │  │ ├── id (PK, uuid)         │
│ ├── userId (FK)       │  │ ├── userId (FK)           │
│ ├── amount (Int)      │  │ ├── achievementType (Str) │
│ ├── reason (Str)      │  │ ├── metadata (JSON)       │
│ └── createdAt         │  │ └── unlockedAt            │
└───────────────────────┘  └───────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  👤 USER (users - NextAuth)                           │
│  ├── id (PK, uuid)                                   │
└───────────┬──────────────────────┬───────────────────┘
            │                      │
   1 user có                      1 user có
   nhiều kênh push                nhiều push logs
            │                      │
            ▼                      ▼
┌───────────────────────┐  ┌───────────────────────────┐
│ 📱 USER_CHANNELS      │  │ 📨 PUSH_LOGS              │
│ ├── id (PK, uuid)     │  │ ├── id (PK, uuid)         │
│ ├── userId (FK)       │  │ ├── userId (FK)           │
│ ├── provider ("fcm")  │  │ ├── title (Str)           │
│ ├── token (Str)       │  │ ├── body (Str?)           │
│ ├── isActive (Bool)   │  │ ├── status ("sent")       │
│ └── createdAt         │  │ └── sentAt                │
└───────────────────────┘  └───────────────────────────┘
```

---

## 3. Bản Đồ Code Cần Sửa (Chi Tiết Từng Vị Trí)

### ⚠️ CHÚ Ý QUAN TRỌNG: Type Mismatch đã phát hiện

Prisma schema dùng tên trường `amount` + `reason` cho PointTransaction,
nhưng code cũ (bị comment) dùng `action` + `points` + `metadata`.
→ **PHẢI SỬA** khi uncomment, KHÔNG chỉ bỏ dấu `//`.

---

### 3.1. bot-conversation.ts (Dòng 268-278)

**Trạng thái:** Code comment dùng field KHÁC schema Prisma.

```diff
# Code cũ (bị comment):
- await prisma.pointTransaction.create({
-   data: {
-     userId: userId,
-     action: 'bot_chat',        ❌ Field không tồn tại
-     points: 2,                 ❌ Field không tồn tại, Prisma dùng "amount"
-     metadata: {...}            ❌ Field không tồn tại
-   }
- });

# Code mới (phù hợp schema):
+ await prisma.pointTransaction.create({
+   data: {
+     userId: userId,
+     amount: 2,                 ✅ Khớp schema
+     reason: 'bot_chat',        ✅ Khớp schema
+   }
+ });
```

---

### 3.2. gamification-commands.ts (Dòng 97-99)

**Trạng thái:** Dùng `$queryRaw` trong khi đã có Prisma model. Nên dùng Prisma Client.

```diff
# Code cũ (bị comment):
- const achievements = await prisma.$queryRaw<any[]>`
-   SELECT id FROM user_achievements WHERE user_id = ${context.userId}
- `;

# Code mới:
+ const achievements = await prisma.userAchievement.findMany({
+   where: { userId: context.userId as string },
+   select: { id: true },
+ });
```

**Kết quả:** `achievementCount` đổi thành `achievements.length`.

---

### 3.3. gamification-commands.ts (Dòng 189-191)

**Trạng thái:** Tương tự 3.2, dùng `$queryRaw`.

```diff
# Code cũ:
- const userAchievements = await prisma.$queryRaw<any[]>`
-   SELECT achievement_id, unlocked_at FROM user_achievements
-   WHERE user_id = ${context.userId}
- `;

# Code mới:
+ const userAchievements = await prisma.userAchievement.findMany({
+   where: { userId: context.userId as string },
+   select: { achievementType: true, unlockedAt: true },
+ });
```

**⚠️ LƯU Ý:** Cần đổi `a.achievement_id` → `a.achievementType` ở dòng 193.

---

### 3.4. achievements.ts (Dòng 163-168) - checkAchievement()

**Trạng thái:** Đang return false cứng. Cần thay bằng query thật.

```diff
# Code cũ:
- return false

# Code mới:
+ const existing = await prisma.userAchievement.findFirst({
+   where: { userId, achievementType: achievementId },
+ });
+ if (existing) return false;  // Đã có rồi
+
+ // Chưa có → Tạo mới
+ await prisma.userAchievement.create({
+   data: { userId, achievementType: achievementId },
+ });
+ return true;  // Vừa unlock
```

---

### 3.5. achievements.ts (Dòng 230-236) - getUserAchievements()

**Trạng thái:** Prisma query đã comment sẵn, field khá khớp.

```diff
# Code cũ:
- // const userAchievements = await prisma.userAchievement.findMany({
- //   where: { userId },
- //   select: { achievementId: true },
- // })
- // const unlockedIds = new Set(userAchievements.map(a => a.achievementId))
- const unlockedIds = new Set<string>()

# Code mới:
+ const userAchievements = await prisma.userAchievement.findMany({
+   where: { userId },
+   select: { achievementType: true },
+ });
+ const unlockedIds = new Set(userAchievements.map(a => a.achievementType));
```

**⚠️ LƯU Ý:** Schema dùng `achievementType` (không phải `achievementId`).

---

### 3.6. leaderboard.ts (Dòng 52-54) - weekly leaderboard

**Trạng thái:** Cần query PointTransaction cho tuần hiện tại.

```diff
# Code cũ:
- // TODO: Implement when PointTransaction features are re-enabled
- break;

# Code mới:
+ const weekAgo = new Date();
+ weekAgo.setDate(weekAgo.getDate() - 7);
+ const weeklyPoints = await prisma.pointTransaction.groupBy({
+   by: ['userId'],
+   _sum: { amount: true },
+   where: { createdAt: { gte: weekAgo } },
+   orderBy: { _sum: { amount: 'desc' } },
+   take: limit,
+ });
+ data = weeklyPoints.map(w => ({
+   user_id: w.userId,
+   total_points: w._sum.amount || 0,
+   current_level: 1,
+   current_streak: 0,
+ }));
+ break;
```

---

### 3.7. digest-scheduler.ts (Dòng 27-28) - Lấy UserChannel

**Trạng thái:** Cần query UserChannel thật thay vì mảng rỗng.

```diff
# Code mới:
+ const users = await prisma.userChannel.findMany({
+   where: { isActive: true },
+ });
```

**⚠️ LƯU Ý:** Model `UserChannel` không có field `preferences`, `subscriptions`,
hay `digestTime`. Luồng filter trong code cũ sẽ trả về rỗng (vô hại). 
Đây là logic cần thiết kế mở rộng schema sau, bước này chỉ mở khóa query.

---

### 3.8. digest-scheduler.ts (Dòng 79-91) - PushLog

**Trạng thái:** Code comment dùng fields KHÁC schema.

```diff
# Code cũ (bị comment) dùng field không tồn tại:
- type, referenceId, recipientsCount, sentCount, failedCount, errors

# Code mới (phù hợp schema PushLog):
+ await prisma.pushLog.create({
+   data: {
+     userId: '11111111-1111-1111-1111-111111111111',  // System user
+     title: `Daily Digest ${timeSlot}`,
+     body: `Sent: ${sent}, Failed: ${failed}`,
+     status: failed > 0 ? 'partial' : 'sent',
+   }
+ });
```

---

### 3.9. digest-scheduler.ts (Dòng 222-223) - sendDigestToUser

**Trạng thái:** Cần query UserChannel cho user cụ thể.

```diff
# Code mới:
+ const userChannel = await prisma.userChannel.findFirst({
+   where: { userId, isActive: true },
+ });
```

---

### 3.10. breaking-push.ts (Dòng 67-79) - PushLog

**Trạng thái:** Tương tự 3.8, cần sử dụng fields đúng schema.

```diff
# Code mới:
+ await prisma.pushLog.create({
+   data: {
+     userId: '11111111-1111-1111-1111-111111111111',  // System user
+     title: `Breaking: ${breaking.headline}`,
+     body: `Sent: ${result.sent}/${subscribers.length}`,
+     status: result.failed > 0 ? 'partial' : 'sent',
+   }
+ });
```

---

## 4. Checklist Kiểm Tra (Acceptance Criteria)

### Tính năng: Khôi phục Gamification
- [ ] `prisma.pointTransaction.create()` gọi được, không TypeError
- [ ] `prisma.userAchievement.findMany()` trả về mảng (dù rỗng)
- [ ] `prisma.userAchievement.create()` tạo record thành công
- [ ] Weekly leaderboard trả data (dù rỗng nếu chưa có pointTransaction)
- [ ] Achievement count hiển thị đúng thay vì cứng `0`

### Tính năng: Khôi phục Push Notification
- [ ] `prisma.userChannel.findMany()` không crash
- [ ] `prisma.pushLog.create()` ghi log thành công
- [ ] Digest scheduler chạy qua logic không throw

### Typescript Compiler
- [ ] `npx tsc --noEmit` pass 100% (không thêm lỗi mới)

---

## 5. Tóm Tắt Rủi Ro Đã Phát Hiện

| # | Rủi ro | Mức độ | Giải pháp |
|---|--------|--------|-----------|
| 1 | Code cũ dùng `action`+`points` nhưng schema dùng `amount`+`reason` | 🔴 High | Viết lại params, không đơn thuần uncomment |
| 2 | Code cũ dùng `$queryRaw` SQL thuần, bây giờ có Prisma Model | 🟡 Medium | Chuyển sang Prisma Client queries |
| 3 | `PushLog` schema thiếu fields `type`, `referenceId`, `recipientsCount` | 🔴 High | Adapte code ghi log vào cấu trúc `title`+`body`+`status` hiện có |
| 4 | `UserChannel` không có `preferences`, `digestTime | 🟡 Medium | Mở query nhưng logic filter sẽ trả empty (vô hại) |

---

*Tạo bởi AWF 2.1 - Design Phase*
