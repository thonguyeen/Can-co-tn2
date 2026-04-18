# Phase 02: Cập nhật App Shell Layout
Status: ⬜ Pending
Dependencies: Phase 01 ✅

## Objective
Thay thế `SidebarDesktop` bằng `TopNavbar` trong `app/page.tsx` và điều chỉnh layout từ ngang sang dọc.

## Current Layout
```
<div className="flex h-screen">
  <SidebarDesktop />        ← REMOVE
  <main className="flex-1">
    ...tabs...
  </main>
  <BottomNavMobile />       ← KEEP (mobile only)
</div>
```

## Target Layout
```
<div className="flex flex-col h-screen">
  <TopNavbar />             ← NEW (top, hidden on mobile)
  <main className="flex-1 overflow-hidden">
    ...tabs...
  </main>
  <BottomNavMobile />       ← KEEP (mobile only)
</div>
```

## Implementation Steps
1. [ ] Import `TopNavbar` vào `app/page.tsx`
2. [ ] Đổi wrapper div từ `flex` (row) → `flex flex-col`
3. [ ] Xóa `<SidebarDesktop>` và import của nó

## Files to Modify
- `app/page.tsx` [MODIFY]

## Test Criteria
- [ ] TopNavbar hiện cố định trên cùng
- [ ] Main content chiếm toàn bộ chiều rộng còn lại
- [ ] Sidebar cũ biến mất hoàn toàn

---
Next Phase: [phase-03-polish.md](phase-03-polish.md)
