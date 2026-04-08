# Phase 01: Schema Updates
Status: ✅ Complete
Dependencies: Bắt buộc đọc design từ session `/tech-lead` trước đó.

## Objective
Bổ sung 4 models còn thiếu cho Gamification & Push Notifications vào file Prisma schema.

## Requirements
### Functional
- [ ] Bổ sung `UserAchievement` liên kết `Profile` (`id`).
- [ ] Bổ sung `PointTransaction` liên kết `Profile` (`id`).
- [ ] Bổ sung `UserChannel` liên kết `User` (`id`).
- [ ] Bổ sung `PushLog` liên kết `User` (`id`).

### Non-Functional
- [ ] Naming convention chuẩn (snake_case DB maps).

## Implementation Steps
1. [ ] Mở file `app/prisma/schema.prisma`.
2. [ ] Thêm các models định nghĩa đúng Map/Relation.
3. [ ] Đảm bảo Schema không có TS errors (sẽ thử `npx prisma generate`).

## Files to Modify
- `app/prisma/schema.prisma`

---
Next Phase: `phase-02-migration.md`
