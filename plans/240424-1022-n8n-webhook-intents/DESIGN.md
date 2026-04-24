# 🎨 DESIGN: n8n Webhook → Intent Injection

Ngày tạo: 2026-04-24
Plan: `plans/240424-1022-n8n-webhook-intents/`

---

## 1. Cách Lưu Thông Tin (Database)

**✅ KHÔNG CẦN MIGRATION** — tất cả fields đã có sẵn:

```
┌────────────────────────────────────────────────────────────┐
│  📦 INTENTS (Bài đăng)                                     │
│  ├── rawText    ← nội dung gốc FB                         │
│  ├── title      ← AI trên n8n đã parse                    │
│  ├── type       ← "CO" hoặc "CAN" (AI parse)              │
│  ├── price      ← giá VNĐ (AI parse)                      │
│  ├── district   ← quận/huyện (AI parse)                    │
│  ├── subcategory← apartment/house/land... (AI parse)       │
│  ├── city       ← default "Hồ Chí Minh"                   │
│  ├── isBot      ← true (tin crawl)                         │
│  ├── botHandle  ← "n8n_crawler"                            │
│  ├── sourceUrl  ← "fb://group_post/{fb_post_id}" (dedup)  │
│  └── userId     ← system user "Nguồn ngoài"               │
└────────────────────┬───────────────────────────────────────┘
                     │ 1 bài có nhiều ảnh
                     ▼
┌────────────────────────────────────────────────────────────┐
│  🖼️ INTENT_IMAGES (Ảnh)                                    │
│  ├── url           ← link ảnh Facebook                     │
│  └── displayOrder  ← 0 (1 ảnh/bài)                        │
└────────────────────────────────────────────────────────────┘
```

---

## 2. API Contract

### `POST /api/webhook/n8n-intents`

**Headers:**
```
Content-Type: application/json
x-api-key: <N8N_WEBHOOK_SECRET>
```

**Request Body** (array):
```typescript
interface N8nPost {
  // === Từ Facebook crawler ===
  fb_post_id: string;       // ID bài viết FB (bắt buộc)
  message?: string;         // Nội dung bài (bắt buộc để insert)
  author?: string;          // Tên tác giả
  image?: string;           // URL ảnh
  created_time?: string;    // ISO timestamp

  // === Từ AI node n8n (đã parse) ===
  type?: "CO" | "CAN";      // Default: "CO"
  title?: string;            // Default: message.slice(0, 80)
  price?: number;            // VNĐ (null nếu không rõ)
  district?: string;         // Quận/huyện
  subcategory?: string;      // apartment | house | land | room | commercial
  city?: string;             // Default: "Hồ Chí Minh"
}
```

**Response 201:**
```json
{
  "inserted": 5,
  "skipped": 3,
  "errors": ["fb_post_id xyz: lỗi gì đó"]
}
```

**Response 401:** `{ "error": "Invalid API key" }`

---

## 3. Luồng Xử Lý

```
POST /api/webhook/n8n-intents
    │
    ├─ 1. Check x-api-key header → 401 nếu sai
    │
    ├─ 2. Parse body JSON (expect array)
    │
    ├─ 3. getOrCreateCrawlUser() → lấy userId "Nguồn ngoài"
    │
    ├─ 4. Loop qua từng post:
    │     ├─ Skip nếu không có message
    │     ├─ Check sourceUrl dedup → skip nếu đã tồn tại
    │     ├─ prisma.intent.create({...})
    │     ├─ prisma.intentImage.create({...}) nếu có image
    │     └─ triggerMatching(intentId) (fire-and-forget)
    │
    └─ 5. Return { inserted, skipped, errors }
```

---

## 4. Test Cases

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TC-01: Auth — Không có API key
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
When:  POST /api/webhook/n8n-intents (no header)
Then:  ✓ 401 { error: "Invalid API key" }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TC-02: Auth — API key sai
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
When:  POST với x-api-key: "wrong"
Then:  ✓ 401

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TC-03: Happy Path — Insert 1 bài
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
When:  POST với [{fb_post_id, message, type, price, district, image}]
Then:  ✓ 201 { inserted: 1, skipped: 0 }
       ✓ Intent có type=CO, price đúng, district đúng
       ✓ IntentImage được tạo

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TC-04: Dedup — Gọi lại cùng fb_post_id
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
When:  POST lại cùng data
Then:  ✓ 201 { inserted: 0, skipped: 1 }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TC-05: Skip — Bài không có message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
When:  POST [{fb_post_id, image}] (no message)
Then:  ✓ 201 { inserted: 0, skipped: 1 }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TC-06: Batch — 20 bài, 3 trùng, 2 thiếu message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
When:  POST 20 posts (mixed)
Then:  ✓ 201 { inserted: 15, skipped: 5 }
```

---

*Tạo bởi AWF — Design Phase*
