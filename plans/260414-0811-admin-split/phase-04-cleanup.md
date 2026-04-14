# Phase 04: Cleanup & Verify
Status: ✅ Complete
Dependencies: Phase 02, Phase 03

## Objective
Dọn dẹp code cũ và xác nhận toàn bộ hoạt động đúng.

## Implementation Steps

### 1. Xóa folder cũ `app/admin/users/`
- Đã được move sang `app/admin/members/[id]/`
- Xóa folder `app/admin/users/` hoàn toàn

### 2. Kiểm tra links nội bộ
- Quét toàn bộ codebase tìm hard-coded links `/admin/users/` → sửa thành `/admin/members/`
- Kiểm tra middleware.ts (không cần sửa — đã protect toàn bộ `/api/admin/*`)

### 3. Build & Smoke Test
- `npm run build` phải pass, không có broken imports
- Truy cập `/admin` → Hub hiển thị
- Truy cập `/admin/members` → Users + Referral tabs
- Truy cập `/admin/bots` → 6 Bot tabs
- Click 1 user → Chi tiết tại `/admin/members/[id]`

## Files to Delete
- `app/app/admin/users/[id]/page.tsx` — [DELETE] (đã move)

## Test Criteria
- [ ] `npm run build` thành công
- [ ] Không còn import/link nào trỏ đến `/admin/users/`
- [ ] 3 routes hoạt động: `/admin`, `/admin/members`, `/admin/bots`
- [ ] User detail page hoạt động tại `/admin/members/[id]`

---
✅ Feature Complete!
