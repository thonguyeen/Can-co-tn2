# Phase 02: Verification & n8n Configuration
Status: ✅ Complete — 2026-04-24T14:30:00+07:00
Dependencies: Phase 01

## Objective
Test endpoint bằng curl + cung cấp n8n node JSON để anh import vào workflow.

## Implementation Steps

### 1. Test bằng curl
- [x] Chạy dev server `npm run dev`
- [x] Gọi curl với sample data (đã parsed format)
- [x] Verify intent xuất hiện trên feed (GET /api/intents)

### 2. Tạo n8n HTTP Request node config
- [x] Export JSON node cho n8n — nhận output AI node → POST webhook
- [x] Hướng dẫn setup API key trong n8n credentials

### 3. Kiểm tra trên feed UI
- [x] Mở browser → localhost:4000 → verify bài hiển thị trên FeedTab
- [x] Verify image hiển thị đúng trong SocialPostCard
- [x] Verify parsed fields (type badge, price, district) đúng

## Test Criteria
- [x] Curl test PASS với sample JSON
- [x] Feed UI hiển thị bài crawl với đúng type/price/district
- [x] Dedup hoạt động khi gọi lại cùng fb_post_id
