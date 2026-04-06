# Phase 02: Backend Refactor (Persistence + Orchestrator)
Status: ✅ Complete
Dependencies: Phase 01

## Objective
Sửa "bộ não" Bot để nó ghi bài thẳng vào bảng `intents` (Feed trang chủ) thay vì `posts`.

## Implementation Steps
1. [ ] Thêm hàm `saveIntentFromBot()` trong `persistence.ts` — Insert vào intents với is_bot=true
2. [ ] Thêm hàm `resetDailyQuota()` — Reset posts_today mỗi ngày
3. [ ] Thêm template `real_estate` vào `bot-factory.ts`
4. [ ] Cập nhật interface `GeneratedBot` với fields khu vực + quota
5. [ ] Sửa `orchestrator.ts`: `createPost()` → gọi `saveIntentFromBot()`
6. [ ] Thêm `createIntentFromCrawledData()` — raw data → AI parse → Intent
7. [ ] Strip `<think>` tags khỏi output LLM
8. [ ] Thêm check quota trước khi Bot đăng bài

## Files to Create/Modify
- `app/lib/openclaw/persistence.ts` — [MODIFY]
- `app/lib/openclaw/bot-factory.ts` — [MODIFY]
- `app/lib/openclaw/orchestrator.ts` — [MODIFY]

---
Next Phase: [phase-03-crawler.md](./phase-03-crawler.md)
