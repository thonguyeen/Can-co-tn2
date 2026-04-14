# Phase 01: Admin Layout & Hub Page
Status: ✅ Complete
Dependencies: None

## Objective
Tạo shared layout cho admin area và biến trang `/admin` gốc thành Hub điều hướng.

## Implementation Steps

### 1. Tạo `app/admin/layout.tsx` — Admin Shared Layout
- Sidebar navigation nhỏ gọn (icon + label) hoặc top breadcrumb
- Links: Hub (`/admin`) | Members (`/admin/members`) | Bots (`/admin/bots`)
- Highlight active route dựa trên `usePathname()`
- Giữ dark theme hiện tại (`bg-slate-900`, teal accent)

### 2. Cải tạo `app/admin/page.tsx` — Navigation Hub
**Xóa toàn bộ 8 tabs cũ.** Thay bằng 2 overview cards lớn:

**Card 1: 👥 Quản Lý Thành Viên**
- Summary mini: Tổng users (gọi `/api/admin/stats`)
- CTA button → `/admin/members`

**Card 2: 🤖 Quản Lý Bot**
- Summary mini: Tổng bots, KPI hôm nay
- CTA button → `/admin/bots`

### 3. Cập nhật breadcrumb/back links
- `admin/users/[id]/page.tsx` hiện trỏ back về `/admin` → đổi thành `/admin/members`

## Files to Create/Modify
- `app/app/admin/layout.tsx` — [NEW] Shared layout
- `app/app/admin/page.tsx` — [MODIFY] Hub page thay tabs

## Test Criteria
- [ ] `/admin` hiển thị Hub với 2 cards
- [ ] Click cards dẫn đến `/admin/members` và `/admin/bots`
- [ ] Layout sidebar/nav hiện trên tất cả sub-pages

---
Next Phase: Phase 02 - Members Page
