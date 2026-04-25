# Phase 03: Schema Alignment Fix (N8N Real Output)
Status: 🟡 In Progress
Dependencies: Phase 01, Phase 02
Created: 2026-04-25T07:50:00+07:00

## Objective
Điều chỉnh webhook route để nhận đúng format output thực tế từ n8n crawler (wrapped records, multi-image, numeric type, v.v.).

## Implementation Steps

### 1. Sửa route.ts — 6 thay đổi
- [ ] Wrapper format parse: `[{ records: [...] }]`
- [ ] Interface N8nPost: field names mới (post_id, message_raw/clean, images[], v.v.)
- [ ] Type mapping: numeric `0→CO, 1→CO, 2→CAN` + backward compat string
- [ ] Multi-image: insert tất cả images[] thay vì chỉ 1
- [ ] City fallback: `null` thay vì "Hồ Chí Minh"
- [ ] rawText dùng message_clean, parsedData mở rộng (acreage, phones, utilities, confidence)

### 2. Cập nhật n8n config
- [ ] Update `n8n-http-node-config.json` contract mới

### 3. Cập nhật session.json
- [ ] Ghi nhận phase-03 đang làm

## Files to Modify
- `app/app/api/webhook/n8n-intents/route.ts` — Main fix
- `plans/240424-1022-n8n-webhook-intents/n8n-http-node-config.json` — Contract update

## Test Criteria
- [ ] Curl test PASS với n8n output JSON (5 bài)
- [ ] Bài Hải Dương → city = "Hải Dương" (không bị default HCM)
- [ ] Bài 10 ảnh → 10 IntentImage records
- [ ] type 1 → CO, type 2 → CAN
- [ ] Dedup: gọi lại → skipped: 5
- [ ] parsedData chứa acreage, phones, confidence

---
Previous Phase: [phase-02-verify-n8n.md](./phase-02-verify-n8n.md)
