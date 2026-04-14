# Phase 01: Database Layer
Status: ✅ Complete

## Objective
Thêm trường dữ liệu phân quyền vào bảng User để lưu trữ vai trò người dùng (ADMIN, MODERATOR, USER).

## Implementation Steps
1. [x] Mở file `app/prisma/schema.prisma` và thêm trường `role String @default("USER")` vào model `User`.
2. [x] Chạy lệnh migrate `npx prisma db push` để apply thay đổi xuống Database.
3. [x] Tạo script `scripts/set-admin-role.ts` để gán role `ADMIN` cho tài khoản chủ hệ thống.

## Files to Modify
- `app/prisma/schema.prisma`

---
Next Phase: Phase 02 - Auth & Middleware
