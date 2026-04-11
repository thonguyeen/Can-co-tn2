# Phase 02: Code Cleanup
Status: ⬜ Pending
Dependencies: Phase 01

## Objective
Xóa các file/endpoint rác được tạo trong quá trình phát triển và test. Đảm bảo codebase sạch trước khi commit.

## Implementation Steps
1. [ ] **Xóa toàn bộ thư mục `/api/dev/`**
   - `app/app/api/dev/test-logic/` — Endpoint test referral logic
   - `app/app/api/dev/test-admin-phase3/` — Endpoint test admin phase 3
   - `app/app/api/dev/trigger-ai/` — Endpoint trigger AI thủ công
   - Đảm bảo không có import nào reference đến các file này

2. [ ] **Xóa middleware bypass cho `/api/dev`**
   - File: `app/middleware.ts` (line 15)
   - Xóa `|| pathname.startsWith('/api/dev')` 
   - Chỉ giữ lại: `/api/auth` và `/api/cron`

3. [ ] **Xóa file test script thừa** (tùy chọn)
   - `app/scripts/quick-test-admin-bot.js` — Script test local (nên giữ, thêm vào .gitignore)
   - `app/scripts/quick-test-prisma-apis.ts` — Tương tự

4. [ ] **Kiểm tra import references**
   - Grep toàn bộ codebase xem có file nào đang import từ `/api/dev/` không
   - Xóa hoặc update references

## Files to Delete
- `app/app/api/dev/test-logic/route.ts`
- `app/app/api/dev/test-admin-phase3/route.ts`
- `app/app/api/dev/trigger-ai/route.ts`

## Files to Modify
- `app/middleware.ts` — Xóa `/api/dev` bypass
- `.gitignore` — Thêm `scripts/quick-test-*`

## Test Criteria
- [ ] Gọi `/api/dev/*` → 404 (endpoint không tồn tại)
- [ ] Không có lỗi build sau khi xóa
- [ ] `npm run build` vẫn pass

---
Next Phase: [Phase 03 - AI Config Stabilization](./phase-03-ai-config.md)
