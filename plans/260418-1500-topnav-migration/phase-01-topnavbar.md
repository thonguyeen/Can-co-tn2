# Phase 01: Tạo TopNavbar Component
Status: ⬜ Pending

## Objective
Tạo component `TopNavbar.tsx` thay thế `SidebarDesktop.tsx`, hiển thị menu ngang ở trên cùng.

## Layout đề xuất
```
┌─────────────────────────────────────────────────────────────────┐
│  [Cần&Có Logo]   [Trang chủ] [Bản đồ] [Khớp Nhanh] [Tin nhắn]   [🔔] [Avatar] │
└─────────────────────────────────────────────────────────────────┘
```
- Logo (text "Cần&Có") ở bên trái
- Các nav items ở chính giữa (flex)
- Notification bell + User avatar ở bên phải

## Implementation Steps
1. [ ] Tạo `components/layout/TopNavbar.tsx`
2. [ ] Di chuyển 5 NavItem (Home, Map, Swipe, Chat, Apps) vào TopNavbar theo chiều ngang
3. [ ] Thêm logo text bên trái
4. [ ] Thêm icon Notification Bell (tạm thời không có logic) bên phải
5. [ ] Thêm User Avatar placeholder (circle with "U") bên phải

## Files to Create/Modify
- `components/layout/TopNavbar.tsx` [NEW]

## Design Spec
- Background: `bg-white`
- Border: `border-b border-slate-100 shadow-sm`
- Height: `h-16` (64px)
- Logo: text-xl font-black text-[#0068FF]
- Active nav item: text-indigo-600 + indigo underline `border-b-2 border-indigo-600`
- Inactive: text-slate-500 hover:text-slate-900
- Chat badge: red dot `-top-1 -right-1`

## Test Criteria
- [ ] Thanh nav hiển thị đúng trên desktop (≥768px)
- [ ] Logo hiện bên trái
- [ ] Badge "3" hiện ở icon Tin nhắn

---
Next Phase: [phase-02-layout.md](phase-02-layout.md)
