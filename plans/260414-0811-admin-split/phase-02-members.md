# Phase 02: Members Page
Status: ✅ Complete
Dependencies: Phase 01

## Objective
Tạo trang `/admin/members` chứa 2 tabs: Danh sách Thành Viên + Thống Kê Referral.

## Implementation Steps

### 1. Tạo `app/admin/members/page.tsx`
- Tab bar 2 mục: `👥 Thành Viên` | `📊 Referral`
- Import và render `AdminUsersTab` + `AdminReferralTab` (tái sử dụng 100%)
- Fetch bots data KHÔNG cần ở đây (khác với page gốc)

### 2. Di chuyển User Detail page
- Move `app/admin/users/[id]/page.tsx` → `app/admin/members/[id]/page.tsx`
- Cập nhật link back: `router.push('/admin/members')` thay vì `/admin`
- Cập nhật link trong `AdminUsersTab.tsx`: `router.push('/admin/members/${user.id}')` thay vì `/admin/users/${user.id}`

### 3. Giữ nguyên API routes
- `/api/admin/users/*` — Không thay đổi
- `/api/admin/referrals` — Không thay đổi
- `/api/admin/redemptions/*` — Không thay đổi

## Files to Create/Modify
- `app/app/admin/members/page.tsx` — [NEW] Members page with 2 tabs
- `app/app/admin/members/[id]/page.tsx` — [NEW] Copy from users/[id]
- `app/app/admin/components/AdminUsersTab.tsx` — [MODIFY] Update router link
- `app/app/admin/users/[id]/page.tsx` — [DELETE] (moved)

## Test Criteria
- [ ] `/admin/members` hiển thị tab Thành Viên + Referral
- [ ] Click vào 1 user → dẫn đến `/admin/members/[id]`
- [ ] Trang chi tiết user hoạt động bình thường
- [ ] Back button dẫn về `/admin/members`

---
Next Phase: Phase 03 - Bots Page
