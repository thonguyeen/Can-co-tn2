# Phase 01: UI Polish (Activity Log Filter)
Status: ✅ Complete
Dependencies: None

## Objective
Thêm bộ lọc thông minh vào tab "Vận Hành" (Admin UI), giúp lọc log của hàng trăm Bot.

## Requirements
### Functional
- [x] Thêm Dropdown chọn `bot_handle` (hoặc text input filter).
- [x] Thêm Dropdown chọn Trạng thái (Tất cả / Thành công / Nghỉ ngơi / Lỗi).
- [x] (Tùy chọn) Reload / Lọc theo thời gian.

### Non-Functional
- [x] Lưu trạng thái bộ lọc vào local state.
- [x] Cập nhật gọi API để lấy data có tham số bộ lọc.

## Implementation Steps
1. [x] Cập nhật UI components `BotOperationsTab.tsx`: Thêm Toolbar phía trên `ActivityFeed`.
2. [x] Thêm State Management (React `useState`, `useDebounce`) cho các trường bộ lọc.
3. [x] Pass filter state vào hàm `fetchActivities`.
4. [x] Cập nhật Backend `/api/orchestrator/route.ts` để đọc các tham số query `bot_handle`, `status`.

## Files to Create/Modify
- `d:/SW/Can-co-tn/app/admin/components/BotOperationsTab.tsx`
- `d:/SW/Can-co-tn/app/api/orchestrator/route.ts`

## Next Phase: phase-02-ai-tuning.md
