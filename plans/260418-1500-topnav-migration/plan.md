# Plan: Chuyển Menu Dọc → Thanh NavBar Ngang
Created: 2026-04-18T15:06
Status: 🟡 In Progress

## Overview
Chuyển toàn bộ `SidebarDesktop` (menu dọc bên trái) sang `TopNavbar` (thanh ngang ở trên).
Mockup đã được duyệt. Giữ `BottomNavMobile` trên mobile không thay đổi.

## Ảnh hưởng
- `app/page.tsx` → Đổi layout từ `flex-row` sang `flex-col`
- `components/layout/SidebarDesktop.tsx` → Thay bằng `TopNavbar.tsx`
- `components/layout/BottomNavMobile.tsx` → Giữ nguyên

## Tech Stack
- Next.js + TailwindCSS (không cần package mới)
- Lucide React icons (đã có sẵn)

## Phases

| Phase | Name | Status | Tasks |
|-------|------|--------|-------|
| 01 | Tạo TopNavbar Component | ⬜ Pending | 5 |
| 02 | Cập nhật layout App Shell | ⬜ Pending | 3 |
| 03 | Polish & Responsive Test | ⬜ Pending | 3 |

**Tổng:** 11 tasks | Ước tính: ~1 session

## Quick Commands
- Start: `/code phase-01`
- Check progress: `/next`
