# Phase 01: DB Migration + Location Data
Status: 🟡 In Progress
Dependencies: Không (Phase đầu tiên)

## Objective
Chuẩn bị nền móng Database và dữ liệu địa chính để các Phase sau có thể xây dựng lên trên:
1. Mở rộng bảng `bots` (thêm khu vực phụ trách, quota)
2. Mở rộng bảng `intents` (cho phép Bot đăng bài)
3. Tạo bảng `crawl_sources` (quản lý nguồn cào)
4. Convert Excel carCRM → TypeScript (bộ dropdown 3 cấp)

## Requirements
### Functional
- [ ] Bảng `bots` có cột: assigned_province, assigned_district, assigned_ward, +codes, assigned_categories, daily_quota (5-100), posts_today, is_envoy
- [ ] Bảng `intents` có cột: is_bot, bot_handle, source_url. Cho phép user_id NULL khi is_bot=true
- [ ] Bảng `crawl_sources` tạo mới hoàn chỉnh
- [ ] RLS policies cập nhật cho phép Bot insert và Feed hiện bài Bot
- [ ] File `vietnam-locations.ts` chứa đầy đủ 63 tỉnh/thành với quận + phường từ carCRM Excel

### Non-Functional
- [ ] Migration SQL phải idempotent (chạy lại không lỗi — dùng IF NOT EXISTS)
- [ ] File location data < 500KB (tối ưu cho client-side dropdown)

## Implementation Steps

### Bước 1: Viết script convert Excel → TypeScript
1. [x] Tạo `scripts/convert-locations.js`
2. [x] Cài package `xlsx` (devDependency)
3. [x] Đọc file `ref/carCRM_Danh-muc-Phuong-xa_2025.xlsx`
4. [x] Parse cột D (tỉnh), F+G (mã+tên quận), I+J (mã+tên phường)
5. [x] Group nested: Province → District[] → Ward[]
6. [x] Export ra `app/lib/data/vietnam-locations.ts` — 35 tỉnh, 692 quận, 3322 phường
7. [x] Chạy script, verify output ✅

### Bước 2: Viết SQL Migration
8. [x] Tạo `app/supabase/migrations/200_bot_envoy.sql`
9. [x] ALTER TABLE bots — thêm các cột envoy
10. [x] ALTER TABLE intents — thêm cột is_bot, bot_handle, source_url
11. [x] ALTER TABLE intents — DROP NOT NULL cho user_id
12. [x] Thêm CHECK constraints (quota 5-100, bot_handle khi is_bot)
13. [x] CREATE TABLE crawl_sources
14. [x] Cập nhật RLS policies
15. [x] Thêm indexes

### Bước 3: Chạy Migration trên Supabase
16. [ ] Chạy SQL trên Supabase SQL Editor (hoặc migration CLI)
17. [ ] Verify: Kiểm tra bảng đã có cột mới
18. [ ] Verify: Thử INSERT intent với is_bot=true bằng service role

## Files to Create/Modify
- `scripts/convert-locations.js` — [NEW] Script parse Excel carCRM
- `app/lib/data/vietnam-locations.ts` — [NEW] Data tĩnh dropdown 3 cấp
- `app/supabase/migrations/200_bot_envoy.sql` — [NEW] SQL migration

## Test Criteria
- [ ] File `vietnam-locations.ts` load được, có ≥ 60 tỉnh
- [ ] Chọn "Thành phố Hà Nội" → Trả về ≥ 20 quận/huyện
- [ ] Chọn "Quận Hoàn Kiếm" → Trả về ≥ 5 phường
- [ ] SQL migration chạy thành công trên Supabase
- [ ] INSERT intent với `is_bot=true, bot_handle='test'` → Thành công
- [ ] INSERT intent với `is_bot=true, bot_handle=NULL` → Bị chặn (constraint)
- [ ] INSERT intent với `is_bot=false, user_id=NULL` → Bị chặn (constraint)

## Notes
- Dùng package `xlsx` chỉ trong script build-time, KHÔNG bundle vào client
- File Excel nguồn: `ref/carCRM_Danh-muc-Phuong-xa_2025.xlsx`
- Cấu trúc Excel: Row 2 = header, Row 3+ = data
  - Cột C: Mã tỉnh BNV | Cột D: Tên tỉnh
  - Cột F: Mã quận TMS | Cột G: Tên quận
  - Cột I: Mã phường    | Cột J: Tên phường

---
Next Phase: [phase-02-backend-refactor.md](./phase-02-backend-refactor.md)
