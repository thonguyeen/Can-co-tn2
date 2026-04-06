# Phase 02: NextAuth Migration (Đăng nhập)
Status: ⬜ Pending
Dependencies: Phase 01

## Objective
Thay thế hệ thống Supabase Auth bằng NextAuth.js. Xử lý middleware và sessions.

## Requirements
### Functional
- [ ] Cài NextAuth.
- [ ] Bổ sung các bảng chuẩn của NextAuth vào `schema.prisma` (Users, Accounts, Sessions).
- [ ] Thiết lập Credentials Provider (So sánh mật khẩu bãnh bcrypt) hoặc OAuth.
- [ ] Viết lại `middleware.ts` để chặn đường dẫn bằng token NextAuth, dọn dẹp Supabase Client.

## Implementation Steps
1. [ ] Sửa `schema.prisma` thêm NextAuth models.
2. [ ] Tạo `app/api/auth/[...nextauth]/route.ts`.
3. [ ] Replace code đăng nhập/đăng ký trong `app/(auth)/login/page.tsx` sang dùng `signIn()`.
4. [ ] Cập nhật `middleware.ts`.

## Files to Create/Modify
- `d:/SW/Can-co-tn/app/api/auth/[...nextauth]/route.ts`
- `d:/SW/Can-co-tn/app/middleware.ts`
- `d:/SW/Can-co-tn/app/app/(auth)/login/page.tsx`

---
Next Phase: `phase-03-api-rewrite.md`
