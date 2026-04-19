# Plan: Homepage Desktop Layout — Sidebar + Grid 2 Cột (Ý tưởng 4 Mix)
Created: 2026-04-19T11:15
Status: 🟡 In Progress

## Overview
Tận dụng 2 cột trống bên trái/phải trang chủ Desktop bằng cách:
- **Trái:** Thêm Sidebar Lọc (sticky) — lọc theo loại, khu vực, khoảng giá
- **Giữa:** Mở rộng feed, chuyển Regular List sang **grid 2 cột** trên Desktop
- **Phải:** Đã có FeedObserverPanel (giữ nguyên)

## Scope
- **Chỉ thay đổi layout Desktop (lg+)**. Mobile/Tablet giữ nguyên 1 cột.
- **Không thêm API mới**. Filter chạy client-side trên dữ liệu đã fetch.
- **Không đụng IntentCard component** — chỉ thay đổi wrapper grid.

## Files cần sửa/tạo

| Action | File | Mô tả |
|--------|------|-------|
| NEW    | `components/feed/FeedFilterSidebar.tsx` | Sidebar lọc bên trái |
| MODIFY | `components/tabs/FeedTab.tsx` | Thêm sidebar + grid 2 col |
| MODIFY | `hooks/useFeedData.ts` | Thêm district + price filter state |

## Phases

| Phase | Name | Status | Tasks |
|-------|------|--------|-------|
| 01 | Filter Sidebar Component | ⬜ Pending | 4 |
| 02 | Feed Layout Restructure | ⬜ Pending | 4 |
| 03 | Verify & Responsive | ⬜ Pending | 3 |

## Quick Commands
- Start: `/code`
- Verify: `/run` → http://localhost:4000
