# Phase 01: Scaffolding (Khung 5 Tabs)
Status: ⬜ Pending
Dependencies: None

## Objective
Xây dựng lớp vỏ bọc ứng dụng (App Shell) tĩnh bao gồm Menu Desktop bên trái, Thanh Điều Hướng Mobile bên dưới, và bộ router nội bộ quản lý 5 Tab theo thiết kế `homepage1.tmp`.

## Requirements
### Functional
- [ ] Phá bỏ layout cuộn cũ, chuyển sang UI chiếm full chiều cao (`h-screen overflow-hidden`).
- [ ] Responsive UI NavBar.
- [ ] Tách UI tĩnh cho các Tab chưa code (Map, Tiện Ích, Chat) ra file riêng.

## Implementation Steps
1. [ ] Cài đặt `framer-motion` (nếu chưa có).
2. [ ] Cấu trúc lại `app/app/hybrid/page.tsx` thành App Container đón Tab Context.
3. [ ] Tạo `components/layout/SuperLayout.tsx`.
4. [ ] Khởi tạo 3 Tab rỗng: `MapRadarTab.tsx`, `ChatOATab.tsx`, `MiniAppsTab.tsx`.

## Files to Create/Modify
- `app/app/hybrid/page.tsx`
- `app/components/layout/SidebarDesktop.tsx`
- `app/components/layout/BottomNavMobile.tsx`
