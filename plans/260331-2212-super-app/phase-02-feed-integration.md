# Phase 02: Feed Integration (Chuyển Nhà)
Status: ✅ Complete
Dependencies: Phase 01

## Objective
Nâng cấp `FeedTab` từ mockup tĩnh thành component có kết nối thật với dữ liệu API `intents` Realtime Supabase đã làm.

## Requirements
### Functional
- [x] Tái tạo cơ chế cuộn và Live Sync cho List Bất động sản.
- [x] Tích hợp `ObserverSidebar` nhỏ gọn làm Module AI bên phải (Desktop).
- [ ] Kết hợp UI Story Bar. (Deferred)

## Implementation Steps
1. [x] Bê code API fetch từ `page.tsx` cũ đem vào `FeedTab.tsx` — extracted to `useFeedData.ts` hook.
2. [x] Map data thật thay vì dùng dummy `feedPosts`.
3. [x] Kiểm tra tính tương thích CSS — wrapped in `wm-light`.
