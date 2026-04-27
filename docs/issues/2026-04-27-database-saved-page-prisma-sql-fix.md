# Issue: Trang /saved Crash 500 - Prisma SQL Type Mismatch

## Thời gian

- Phát hiện: 2026-04-27
- Hoàn thành: 2026-04-27

## Tóm tắt

Trang `/saved` crash với lỗi 500 khi cố hiển thị danh sách bài viết đã lưu. Có 2 lỗi SQL liên tiếp trong cùng raw query.

## Hiện tượng

- Vào trang `/saved` → trang trắng với thông báo "Application Error"
- Server console: lỗi Prisma raw query

## Bằng chứng thu thập được

- Lỗi 1: `operator does not exist: text = uuid` (Prisma error code 42883)
- Lỗi 2: `column "s.created_at" must appear in the GROUP BY clause or be used in an aggregate function` (error code 42803)
- File: `app/(main)/saved/page.tsx` line 20-30

## Nguyên nhân gốc

**Lỗi 1:** Trong Prisma `$queryRaw` template literal, các tham số (`${userId}`) được truyền dưới dạng `text`. Câu query dùng `WHERE s.user_id = ${userId}::uuid` — nhưng `::uuid` cast nằm ở phía tham số, không phải cột. PostgreSQL không thể so sánh `uuid = text`.

**Lỗi 2:** `ORDER BY s.created_at DESC` — cột `s.created_at` không thuộc `GROUP BY i.id` và không được aggregate.

## Cách xử lý

**Lỗi 1:** Cast cột thay vì tham số: `s.user_id::text = ${userId}`

**Lỗi 2:** Dùng `MIN(s.created_at) AS save_created_at` trong SELECT và `ORDER BY save_created_at DESC`

## File/code đã thay đổi

- `app/(main)/saved/page.tsx` — sửa raw SQL query

## Cách kiểm tra lại

1. Vào `/saved` → trang load thành công
2. ✅ Hiện danh sách bài đã lưu hoặc empty state "Chưa có bài viết đã lưu"

## Phòng ngừa

- Khi dùng Prisma `$queryRaw` template literal, **không** thêm `::type` cast vào sau `${param}` — Prisma không xử lý cast nằm ngoài placeholder
- Thay vào đó, cast phía **cột**: `column::text = ${param}` hoặc dùng `Prisma.sql` helper
- Khi `GROUP BY`, tất cả cột trong `ORDER BY` phải nằm trong `GROUP BY` hoặc được aggregate

## Tags

`debug`, `database`, `prisma`, `sql`, `saved-page`
