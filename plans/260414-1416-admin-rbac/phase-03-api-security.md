# Phase 03: Backend API Security
Status: ⬜ Pending
Dependencies: Phase 02

## Objective
Bảo mật chặt chẽ các Endpoints thực tế, đảm bảo không ai có thể dùng Tool chọc mù dữ liệu dù có bypass được Middleware Frontend.

## Implementation Steps
1. [ ] Cập nhật `/api/admin/*` routes (như `users/route.ts`, `referrals/route.ts`, ...) yêu cầu role từ `MODERATOR` trở lên.
2. [ ] Cập nhật `/api/bots/*` routes và `/api/orchestrator/route.ts` bắt buộc role phải là `ADMIN` mới cho phép thao tác (GET/POST/PUT).
3. [ ] Kiểm tra lỗi 403 Forbidden nếu không đủ quyền hạn.

## Files to Modify
- `app/api/admin/users/route.ts`...
- `app/api/bots/route.ts`...
- `app/api/orchestrator/route.ts`

---
Next Phase: Phase 04 - Dashboard UI
