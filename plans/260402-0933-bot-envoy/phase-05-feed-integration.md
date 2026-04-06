# Phase 05: Feed Integration
Status: ✅ Complete
Dependencies: Phase 02

## Objective
Đảm bảo bài Bot xuất hiện trên trang chủ đúng cách, có badge phân biệt.

## Implementation Steps
1. [x] Sửa GET `/api/intents` — Khi is_bot=true lấy info từ bảng bots
2. [x] Gắn nhãn "[AI]" vào tên Bot khi trả về
3. [x] Sửa IntentCard.tsx — Hiện chip "🤖 Bot" cho bài Bot
4. [x] Style nhẹ khác biệt (viền/icon góc)

## Files to Create/Modify
- `app/app/api/intents/route.ts` — [MODIFY]
- `app/components/intent/IntentCard.tsx` — [MODIFY]

---
Next Phase: [phase-06-testing.md](./phase-06-testing.md)
