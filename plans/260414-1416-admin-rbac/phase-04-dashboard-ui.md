# Phase 04: Frontend RBAC UI
Status: ⬜ Pending
Dependencies: Phase 02

## Objective
Thay đổi giao diện người dùng dựa theo role, tránh hiển thị link chết hoặc thông tin nhạy cảm.

## Implementation Steps
1. [ ] Cập nhật `app/admin/layout.tsx`: Lấy `useSession` hoặc server session. Nếu role là `MODERATOR`, ẩn tab menu `Quản Lý Bot`.
2. [ ] Cập nhật `app/admin/page.tsx`: Ẩn Overview Card `Bots` đối với những người có role `MODERATOR`.
3. [ ] Test hiển thị, nếu ADMIN thì cho thấy đầy đủ, nếu MODERATOR thì chỉ thấy Thành Viên.

## Files to Modify
- `app/admin/layout.tsx`
- `app/admin/page.tsx`
