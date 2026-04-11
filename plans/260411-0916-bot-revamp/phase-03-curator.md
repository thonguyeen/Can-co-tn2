# Phase 03: Curator Bot (LLM Parse Pipeline)
Status: ⬜ Pending
Dependencies: Phase 01 (schema), Phase 02 (crawler output)

## Objective
Tách logic parse ra khỏi Orchestrator thành module riêng. Curator Bot đọc RawNews chưa process → dùng LLM parse thành Intent CẦN/CÓ có cấu trúc. Parse schema lấy từ `systemPrompt` của bot trong DB (category-agnostic).

## Requirements

### Functional
- [ ] Tạo `CuratorBot` class: đọc `RawNews(isProcessed=false)` → parse → tạo Intent
- [ ] Parse schema từ `Bot.systemPrompt` (Admin cấu hình) thay vì hardcode
- [ ] `source_url` bắt buộc trên mọi Intent tạo ra (Nguyên tắc vàng)
- [ ] Tách khỏi `createIntentFromCrawledData()` trong Orchestrator
- [ ] Hỗ trợ nhiều category: real_estate, recruitment, marketplace... bằng cách đổi system prompt
- [ ] Inject `Bot.knowledgeText` vào prompt nếu có

### Non-Functional
- [ ] Dùng model rẻ (gpt-4o-mini) cho parse — không cần model mạnh
- [ ] Batch processing: xử lý tối đa 10 items/lần, delay giữa mỗi item
- [ ] Idempotent: nếu chạy lại, không tạo duplicate

## Implementation Steps

1. [ ] **Tạo `lib/openclaw/curator-bot.ts`**:
   - Class `CuratorBot` với constructor nhận `botHandle`
   - Method `processUnprocessedNews(limit=10)`:
     - Query `RawNews WHERE isProcessed=false`
     - Với mỗi item: đọc systemPrompt từ DB → inject knowledgeText → gọi LLM parse → tạo Intent
     - Mark `isProcessed=true` sau khi xử lý xong
   - Method `parseRawToIntent(rawNews, systemPrompt, knowledgeText)`:
     - Gọi `chatWithJSON()` với prompt chỉ dạy parse, KHÔNG sáng tạo
     - Return: `{ title, type: CAN|CO, price?, area?, district?, category, parsedData }`

2. [ ] **Tạo default System Prompt cho Curator BĐS**:
   - Prompt template insert vào DB khi seed
   - Nội dung: "Bạn là parser. Chỉ extract thông tin từ text. KHÔNG bịa. Output JSON."
   - Parse schema BĐS: `{ title, type, price, area, district, ward, city, propertyType, direction }`

3. [ ] **Kết nối RawNews → Intent pipeline**:
   - Mỗi RawNews được process → tạo 1 Intent record với `isBot=true`, `sourceUrl=rawNews.originalUrl`
   - Fallback nếu LLM fail: lưu RawNews với basic data, đánh dấu `isProcessed=true` nhưng không tạo Intent
   - Ghi `CrawlLog` kết quả

4. [ ] **Cập nhật Orchestrator**: xóa/deprecate `createIntentFromCrawledData()` — thay bằng `curatorBot.processUnprocessedNews()`

5. [ ] **Seed Curator Bot vào DB**:
   - handle: `curator_bds`
   - botType: `curator`
   - systemPrompt: default parse prompt cho BĐS
   - category: `real_estate`

## Files to Create/Modify

### Create:
- `app/lib/openclaw/curator-bot.ts` — Curator Bot module

### Modify:
- `app/lib/openclaw/orchestrator.ts` — Remove/deprecate direct parse logic
- `app/lib/openclaw/persistence.ts` — Thêm helper `markRawNewsProcessed()`

## Test Criteria
- [ ] Có 5 RawNews chưa process → chạy CuratorBot → tạo 5 Intents mới
- [ ] Mỗi Intent có `sourceUrl` hợp lệ
- [ ] Mỗi Intent có `parsedData` JSON hợp lệ
- [ ] RawNews đã process không bị process lại
- [ ] Đổi systemPrompt của curator bot → kết quả parse thay đổi theo

## Notes
- RawNews hiện tại có field `isProcessed` → dùng làm flag
- `chatWithJSON()` từ `lib/ai/client.ts` đã có retry logic → tận dụng
- CuratorBot không cào data — chỉ nhận data đã cào từ Crawler (Phase 02)

---
Next Phase: [Phase 04 - Orchestrator Refactor](./phase-04-orchestrator.md)
