# Phase 01: Security Hardening
Status: ⬜ Pending
Dependencies: None

## Objective
Đóng lại tất cả lỗ hổng bảo mật phát sinh từ quá trình test. Đảm bảo không có API endpoint nào public mà không nên public.

## ⚠️ CRITICAL — Blockers from Tech Lead Review

### Risk #1: `/api/orchestrator` đang mở public (CRITICAL)
Trong quá trình test, middleware.ts đã được mở bypass cho `/api/orchestrator`. 
Bất kỳ ai cũng có thể gọi API tạo bot spam, kích hoạt random post, start/stop orchestrator.

## Implementation Steps
1. [ ] **Xóa bypass `/api/orchestrator` khỏi middleware.ts**
   - File: `app/middleware.ts` (line 15)
   - Xóa `|| pathname.startsWith('/api/orchestrator')` 
   - Orchestrator API sẽ yêu cầu đăng nhập (JWT token) như các API khác

2. [ ] **Thêm Admin-only check cho Orchestrator API**
   - File: `app/app/api/orchestrator/route.ts`
   - Thêm check `ADMIN_EMAILS` whitelist giống pattern của `/api/admin/*`
   - Chỉ admin được phép tạo bot, start/stop orchestrator

3. [ ] **Review middleware.ts bypass list**
   - Đảm bảo chỉ còn: `/api/auth`, `/api/cron` (có CRON_SECRET riêng)
   - `/api/dev` bypass cần được xóa nốt (Phase 02)

## Files to Modify
- `app/middleware.ts` — Xóa orchestrator bypass
- `app/app/api/orchestrator/route.ts` — Thêm admin auth guard

## Test Criteria
- [ ] Gọi `/api/orchestrator?action=status` không đăng nhập → 401
- [ ] Gọi `/api/orchestrator` POST không đăng nhập → 401
- [ ] Admin đăng nhập → vẫn dùng được Orchestrator API

---
Next Phase: [Phase 02 - Code Cleanup](./phase-02-code-cleanup.md)
