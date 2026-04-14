# Phase 02: Auth & Middleware
Status: ✅ Complete
Dependencies: Phase 01

## Objective
Nhúng thông tin `role` vào token bảo mật và cấu hình vòng ngoài (Middleware) chặn các truy cập trái phép vào `/admin`.

## Implementation Steps
1. [ ] Mở file `app/lib/auth.ts`, update JWT Callback để nhúng `user.role` từ DB vào token.
2. [ ] Update Session Callback trong `auth.ts` để truyền `token.role` ra ngoài Object Session (Frontend).
3. [ ] Cập nhật `app/middleware.ts` để chặn truy cập:
    - Trả về `/` nếu request URL là `/admin*` nhưng session role chỉ là `USER` (hoặc undefined).
    - Trả về `/admin` nếu request URL là `/admin/bots*` nhưng session role là `MODERATOR`.

## Files to Modify
- `app/lib/auth.ts`
- `app/middleware.ts`

---
Next Phase: Phase 03 - API Security
