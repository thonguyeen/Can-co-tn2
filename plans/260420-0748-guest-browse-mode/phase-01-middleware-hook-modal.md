# Phase 01: Middleware + useAuthGate Hook + AuthGateModal
Status: ⬜ Pending
Dependencies: None

## Objective
Mở middleware cho guest xem pages, tạo hook + modal xài chung cho tất cả action buttons.

## Implementation Steps

### Middleware Changes
1. [ ] Sửa `middleware.ts` — mở TẤT CẢ page routes cho guest
   - Giữ nguyên: API mutations cần auth (POST/PUT/DELETE /api/*)
   - Giữ nguyên: /admin cần auth + RBAC
   - Mở: `/`, `/map`, `/intent/*`, `/can-co/*` (feed, detail pages)
   - Mở: GET `/api/intents`, `/api/map/*` (đã public sẵn)

### Auth Gate Hook
2. [ ] Tạo `hooks/useAuthGate.ts`
   - `useAuthGate()` → `{ requireAuth(action: () => void): void, session, isGuest }`
   - Nếu có session → thực hiện action
   - Nếu không → mở AuthGateModal
   - Dùng React Context để không cần prop drilling

### Auth Gate Modal
3. [ ] Tạo `components/auth/AuthGateModal.tsx`
   - Được dark overlay + blur backdrop
   - Logo + "Đăng nhập để tiếp tục"
   - Nút "Đăng nhập" → redirect /login?redirect=currentPath
   - Nút "Đăng ký" → redirect /register?redirect=currentPath
   - Nút X đóng modal
   - Design: dark navy + violet theme (match app)

### Auth Gate Provider
4. [ ] Tạo `components/auth/AuthGateProvider.tsx`
   - React Context bọc toàn app
   - Quản lý state mở/đóng modal
   - Inject vào layout.tsx root

## Files to Create/Modify
- `middleware.ts` — [MODIFY] Mở page routes cho guest
- `hooks/useAuthGate.ts` — [NEW] Auth gate hook
- `components/auth/AuthGateModal.tsx` — [NEW] Login prompt modal
- `components/auth/AuthGateProvider.tsx` — [NEW] Context provider
- `app/layout.tsx` — [MODIFY] Wrap AuthGateProvider

## Test Criteria
- [ ] Guest vào `/` thấy feed (không bị redirect login)
- [ ] Guest vào `/map` thấy bản đồ
- [ ] Guest vào `/intent/[id]` thấy chi tiết listing
- [ ] Guest click Thích → AuthGateModal hiện
- [ ] Đóng modal → quay lại trang, không redirect
- [ ] Click "Đăng nhập" trong modal → đi /login?redirect=...
