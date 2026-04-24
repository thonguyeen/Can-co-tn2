# Phase 01: Webhook API + Middleware
Status: ⬜ Pending
Dependencies: None

## Objective
Tạo endpoint `POST /api/webhook/n8n-intents` nhận bài đăng **đã được n8n AI parse sẵn**, insert vào DB, trigger matching engine. Webhook KHÔNG gọi AI — chỉ validate + insert + match.

## Architecture

```
n8n (đã parse sẵn bằng AI):
  POST /api/webhook/n8n-intents
  Header: x-api-key: <N8N_WEBHOOK_SECRET>
  Body: [{
    fb_post_id, message, author, image, created_time,
    type, price, district, subcategory, title   ← đã parse bởi AI node n8n
  }, ...]

middleware.ts → bypass auth cho /api/webhook/*

route.ts → validate API key → dedup → insert Intent → trigger matching
```

## n8n gửi data format (sau khi AI parse)

```json
{
  "fb_post_id": "623356021198504_3392965570904188",
  "message": "VỚI 240 TRIỆU SỞ HỮU NGAY NHÀ SÀI GÒN...",
  "author": "Mỹ Ngọc",
  "image": "https://scontent-nrt6-1.xx.fbcdn.net/...",
  "created_time": "2026-04-24T03:17:10+0000",

  "type": "CO",
  "title": "Căn hộ Destino Centro Bình Chánh - chỉ 240 triệu",
  "price": 2400000000,
  "district": "Bình Chánh",
  "subcategory": "apartment",
  "city": "Hồ Chí Minh"
}
```

## Implementation Steps

### 1. Middleware bypass (middleware.ts)
- [ ] Thêm rule cho `/api/webhook` — cho request qua không cần JWT

```diff
+ // ═══ WEBHOOK — check API key bên trong route ═══
+ if (pathname.startsWith('/api/webhook')) {
+   return NextResponse.next()
+ }
```

### 2. Tạo webhook route (app/api/webhook/n8n-intents/route.ts)
- [ ] Validate `x-api-key` header vs `process.env.N8N_WEBHOOK_SECRET`
- [ ] Accept JSON body: array of parsed posts
- [ ] Skip bài không có `message`
- [ ] Dedup: check `sourceUrl` = `fb://group_post/{fb_post_id}` → skip nếu đã tồn tại
- [ ] Map fields → Intent + IntentImage:

| n8n field (parsed) | → Intent field | Ghi chú |
|---|---|---|
| `message` | `rawText` | Nội dung gốc |
| `title` | `title` | Đã parsed bởi AI trên n8n |
| `type` | `type` | `'CAN'` hoặc `'CO'`, default `'CO'` |
| `price` | `price` (BigInt) | Số VNĐ, đã parse bởi AI |
| `district` | `district` | Đã parse bởi AI |
| `subcategory` | `subcategory` | `apartment`, `house`, `land`... |
| `city` | `city` | Default `'Hồ Chí Minh'` |
| `author` | `parsedData.author` | Tên tác giả FB gốc |
| `image` | → `IntentImage` record | 1 ảnh per bài |
| `created_time` | `createdAt` | ISO timestamp |
| `fb_post_id` | `sourceUrl` = `fb://…` | Chống trùng |
| — | `isBot` = `true` | Tin crawl |
| — | `botHandle` = `'n8n_crawler'` | Phân biệt nguồn |
| — | `userId` | `getOrCreateCrawlUser()` |
| — | `status` = `'active'` | Hiện feed ngay |
| — | `category` = `'real_estate'` | Default |

- [ ] Sau insert: fire-and-forget `triggerMatching(intentId)` (reuse)
- [ ] Response: `{ inserted: N, skipped: M, errors: [...] }`

### 3. Thêm env variable
- [ ] Thêm `N8N_WEBHOOK_SECRET` vào `.env.example`

## Files to Create/Modify

| Action | File | Purpose |
|--------|------|---------|
| MODIFY | `app/middleware.ts` | Bypass auth cho `/api/webhook/*` |
| NEW | `app/app/api/webhook/n8n-intents/route.ts` | Webhook endpoint chính |
| MODIFY | `.env.example` | Thêm `N8N_WEBHOOK_SECRET` |

## Test Criteria
- [ ] POST không có API key → 401
- [ ] POST sai API key → 401
- [ ] POST đúng key + body hợp lệ → 201 + intents created
- [ ] POST lại cùng data → skipped (dedup)
- [ ] Bài không có message → skipped
- [ ] Images lưu vào IntentImage table
- [ ] Parsed fields (type, price, district) lưu đúng

---
Next Phase: Phase 02 — Verification & n8n Config
