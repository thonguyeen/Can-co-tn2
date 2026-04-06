# Phase 01: Setup Environment & Prisma ORM
Status: ⬜ Pending
Dependencies: None

## Objective
Thiết lập ORM thay thế cho Supabase Client. Copy cấu trúc cơ sở dữ liệu hiện tại làm chuẩn mực.

## Requirements
### Functional
- [ ] Cài đặt Prisma (`npm install prisma @prisma/client`).
- [ ] Khởi tạo Prisma `schema.prisma`.
- [ ] Kéo toàn bộ cấu trúc bảng từ Supabase hiện tại về (Introspection).
- [ ] Thiết lập kết nối chéo: `DATABASE_URL` trỏ về Postgres mới.

## Implementation Steps
1. [ ] Chạy `npx prisma init`.
2. [ ] Sửa `.env` thêm `DATABASE_URL`.
3. [ ] Chạy `npx prisma db pull` (Tạm trỏ vào Supabase DB lấy schema).
4. [ ] Tạo file `lib/db.ts` khởi tạo `PrismaClient` singleton.

## Files to Create/Modify
- `prisma/schema.prisma`
- `d:/SW/Can-co-tn/app/lib/db.ts`
- `d:/SW/Can-co-tn/app/.env`

---
Next Phase: `phase-02-auth-migration.md`
