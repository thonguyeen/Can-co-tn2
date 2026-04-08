# Phase 02: SQL Migration Script
Status: ✅ Complete
Dependencies: phase-01

## Objective
Tạo ra một tập lệnh `.ts` chứa các câu lệnh `DROP` SQL để loại bỏ RLS Policies và Triggers của Supabase thừa thải trên DB sau khi migrated sang NextAuth + Prisma.

## Requirements
### Functional
- [ ] Drop trigger `on_auth_user_created` (liên kết với function).
- [ ] Drop function `public.handle_new_user()`.
- [ ] Xóa tất cả các RLS Policies cũ (Hoặc cho phép drop các polices liên quan `auth.uid()`).

## Implementation Steps
1. [ ] Viết file script `app/scripts/cleanup-db.ts` dùng `prisma.$executeRawUnsafe`.
2. [ ] Liệt kê chính xác các câu lệnh DROP.
3. [ ] Test kết nối CSDL và chạy lệnh `DROP`.

## Files to Modify/Create
- `app/scripts/cleanup-db.ts` (New)

---
Next Phase: `phase-03-deploy.md`
