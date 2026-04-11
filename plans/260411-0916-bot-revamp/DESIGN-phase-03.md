# DESIGN: Phase 03 — Curator Bot (LLM Parse Pipeline)
Created: 2026-04-11
Phase spec: [phase-03-curator.md](./phase-03-curator.md)
Status: Ready for /code

---

## 1. Context & Phân Tích Hiện Trạng

### 1.1. Vấn đề của `createIntentFromCrawledData()` hiện tại

Hiện tại trong `orchestrator.ts` (line 864-918), luồng cào → lưu chạy **trong 1 function đơn**:

```
RawCrawlItem → checkDuplicate → matchBotToRegion → chatWithJSON (parse) → createEnvoyPost → saveIntentFromBot
```

**Các vấn đề cụ thể:**

| Vấn đề | Ảnh hưởng |
|--------|-----------|
| Parse prompt hardcoded trong orchestrator | Không thể thay đổi parse schema qua Admin UI |
| Không lưu RawNews vào DB trước khi parse | Nếu parse fail → mất data không thể retry |
| LLM parse + save intent xảy ra **đồng bộ** trong crawl loop | Timeout crawl = miss data |
| Không có flag `isProcessed` tracking | Không biết item nào đã được process |
| `matchBotToRegion` bắt buộc — không có bot → skip | Mất data hợp lệ |

### 1.2. Cái RawNews đã có trong schema

`model RawNews` (line 174-195) đã có đầy đủ:
- `originalUrl` — dedup key
- `isProcessed` — flag để Curator query
- `sourceId` → `Source` (bảng nguồn cũ, khác `CrawlSource`)
- `contentHash` — dedup bằng nội dung (optional)

**Quyết định thiết kế:** CuratorBot sẽ dùng bảng `RawNews` làm "staging buffer" giữa Crawler và Intent.

---

## 2. Architecture Mới — Two-Stage Pipeline

```
┌──────────────────────────────────────────────────────────────┐
│  STAGE 1 — CRAWL STAGE (GenericCrawler, Phase 02)            │
│                                                              │
│  CrawlSource (DB) → crawlAll() → RawCrawlItem[]             │
│                                         ↓                    │
│                                  saveRawNews()               │
│                                  (RawNews, isProcessed=false)│
└──────────────────────────────────────────────────────────────┘
                              ↓ (decoupled — async)
┌──────────────────────────────────────────────────────────────┐
│  STAGE 2 — CURATE STAGE (CuratorBot, Phase 03)              │
│                                                              │
│  Query RawNews (isProcessed=false)                           │
│       ↓                                                      │
│  Read Bot.systemPrompt (curator bot từ DB)                   │
│       ↓                                                      │
│  chatWithJSON → ParsedIntentData                             │
│       ↓                                                      │
│  saveIntentFromBot() → Intent (sourceUrl bắt buộc!)          │
│       ↓                                                      │
│  mark isProcessed=true                                       │
└──────────────────────────────────────────────────────────────┘
```

**Lợi ích của 2-stage:**
- Crawler không bị block bởi LLM call (LLM chậm, timeout ảnh hưởng toàn bộ batch)
- Có thể retry parse riêng mà không cào lại
- Admin có thể thay system prompt → reprocess lại `isProcessed=false` items
- Audit trail đầy đủ: biết item nào từ nguồn nào, đã parse chưa

---

## 3. Schema Changes — Không cần migration mới

`RawNews` đã có `isProcessed`. Tuy nhiên cần **thêm `crawlSourceId`** vào RawNews để link về `CrawlSource` (Phase 02), vì hiện tại chỉ có `sourceId` → `Source` (bảng cũ).

### 3.1. Thêm field `crawlSourceId` vào `RawNews`

```prisma
model RawNews {
  // ... fields hiện tại ...
  
  // Phase 03: link về CrawlSource (bảng Phase 02)
  crawlSourceId  String?   @map("crawl_source_id")
  crawlSource    CrawlSource? @relation(fields: [crawlSourceId], references: [id])
  
  // Phase 03: curator tracking
  curatedAt      DateTime? @map("curated_at") @db.Timestamptz
  curateError    String?   @map("curate_error")
}
```

```prisma
model CrawlSource {
  // ... fields hiện tại ...
  rawNews  RawNews[]  // Thêm relation ngược
}
```

**Migration SQL:**
```sql
ALTER TABLE raw_news ADD COLUMN crawl_source_id UUID REFERENCES crawl_sources(id);
ALTER TABLE raw_news ADD COLUMN curated_at TIMESTAMPTZ;
ALTER TABLE raw_news ADD COLUMN curate_error TEXT;
```

### 3.2. Thêm Bot curator vào seed

```
handle: curator_bds
botType: curator
systemPrompt: [xem mục 4.2]
category: real_estate
```

---

## 4. Module: `curator-bot.ts`

### 4.1. Interface & Types

```typescript
// ─── Input/Output types ────────────────────────────────────────────
interface CurateJobResult {
  total: number;        // Total RawNews queried
  parsed: number;       // Successfully parsed → Intent created
  skipped: number;      // Duplicate sourceUrl
  failed: number;       // LLM parse error (fallback applied)
  duration: number;     // ms
}

interface ParsedIntentData {
  title: string;
  type: 'CAN' | 'CO';
  price?: number;
  priceMin?: number;
  priceMax?: number;
  district?: string;
  ward?: string;
  city?: string;
  subcategory?: string;      // apartment|house|land|commercial
  direction?: string;        // N|S|E|W|NE|...
  area?: number;             // m²
  summary: string;           // 2-3 câu mô tả sạch
}

// CuratorBot config (đọc từ DB)
interface CuratorBotConfig {
  handle: string;         // "curator_bds"
  systemPrompt: string;   // Parse instructions từ Admin
  knowledgeText?: string; // Optional domain knowledge
  category: string;       // "real_estate"
}
```

### 4.2. Default System Prompt (BĐS)

```
Bạn là PARSER BẤT ĐỘNG SẢN. Nhiệm vụ duy nhất: extract thông tin từ text.

QUY TẮC BẮT BUỘC:
1. KHÔNG bịa thêm thông tin không có trong text
2. KHÔNG viết lại hay sáng tạo nội dung
3. Trả về DUY NHẤT JSON hợp lệ, KHÔNG có text giải thích

SCHEMA PHẢI THEO ĐÚNG:
{
  "title": "Tiêu đề ngắn gọn ≤ 80 ký tự",
  "type": "CAN" nếu người đăng muốn mua/thuê, "CO" nếu muốn bán/cho thuê,
  "price": số nguyên VNĐ hoặc null,
  "priceMin": null,
  "priceMax": null,
  "district": "Quận/Huyện hoặc null",
  "ward": "Phường/Xã hoặc null",
  "city": "Thành phố, mặc định Hồ Chí Minh",
  "subcategory": "apartment|house|land|commercial",
  "area": số m² hoặc null,
  "summary": "2-3 câu mô tả súc tích, KHÔNG bịa"
}
```

### 4.3. Class Design

```typescript
export class CuratorBot {
  private botHandle: string;
  private config: CuratorBotConfig | null = null;

  constructor(botHandle = 'curator_bds') {
    this.botHandle = botHandle;
  }

  // ── ENTRY POINT ───────────────────────────────────────────────
  // Gọi từ: /api/crawler/trigger (sau crawl) hoặc cron job riêng
  async processUnprocessedNews(limit = 10): Promise<CurateJobResult>

  // ── INTERNAL ──────────────────────────────────────────────────
  // Load bot config từ DB (cache 5 phút)
  private async loadConfig(): Promise<CuratorBotConfig>

  // Parse 1 RawNews item → ParsedIntentData
  // Fallback: nếu LLM fail 2 lần → dùng rawText trực tiếp
  async parseRawToIntent(rawNews: RawNewsItem): Promise<ParsedIntentData>

  // Save Intent + mark RawNews processed
  private async saveAndMark(
    rawNews: RawNewsItem,
    parsed: ParsedIntentData,
  ): Promise<string | null>   // Returns intent ID

  // Retry policy: maxRetries=2, temperature=0.1
  // Fallback khi fail: basic data từ rawText, không dùng LLM
  private async parseWithRetry(rawText: string, systemPrompt: string): Promise<ParsedIntentData>
}
```

### 4.4. `processUnprocessedNews()` — Flow chi tiết

```
1. Load config (cache bot systemPrompt từ DB)
2. Query RawNews WHERE isProcessed=false, ORDER BY createdAt ASC, LIMIT 10
3. FOR EACH rawNews:
   a. checkDuplicate(rawNews.originalUrl) → skip nếu đã có Intent
   b. parseWithRetry(rawNews, systemPrompt)
      - Gọi chatWithJSON với maxRetries=2, temperature=0.1
      - Nếu JSON invalid → parse lại
      - Nếu fail 2 lần → fallback: { title: rawNews.title, type:'CO', summary: rawNews.content.slice(500) }
   c. matchBotToRegion(parsed.city, parsed.district) → botHandle
      - Nếu không có bot phù hợp → dùng fallback bot "curator_bds" chính
   d. saveIntentFromBot({ ...parsed, sourceUrl: rawNews.originalUrl, isBot: true })
   e. UPDATE raw_news SET isProcessed=true, curatedAt=now() WHERE id=rawNews.id
   f. delay(1000) — throttle LLM calls
4. Return CurateJobResult
```

---

## 5. Changes to Existing Files

### 5.1. `real-estate-crawler.ts` — Stage 1: Save RawNews thay vì gọi Orchestrator trực tiếp

**TRƯỚC (hiện tại):**
```
processItems() → orchestrator.createIntentFromCrawledData() → Intent
```

**SAU (Phase 03):**
```
processItems() → saveRawNews() → RawNews (isProcessed=false)
                              ↗
CuratorBot.processUnprocessedNews() chạy sau (async, separate trigger)
```

**Hàm mới cần thêm trong `persistence.ts`:**
```typescript
// Lưu item cào vào RawNews staging buffer
export async function saveRawNewsFromCrawl(params: {
  title: string;
  content?: string;
  originalUrl: string;
  imageUrl?: string;
  publishedAt?: Date;
  crawlSourceId?: string;
}): Promise<string | null>     // Returns rawNews.id

// Mark processed
export async function markRawNewsProcessed(
  rawNewsId: string,
  curateError?: string,
): Promise<void>
```

### 5.2. `/api/crawler/trigger/route.ts` — Trigger curator sau khi crawl

```typescript
// THÊM sau khi crawlAll() xong:
const crawlResult = await crawler.crawlAll();

// Trigger curator (không chờ — fire and forget)
const curator = getCuratorBot();
curator.processUnprocessedNews(20).catch(e =>
  console.warn('[Trigger] Curator async error:', e.message)
);

return NextResponse.json({ success: true, result: crawlResult });
```

### 5.3. Deprecate `createIntentFromCrawledData()` trong orchestrator

```typescript
/** @deprecated Use CuratorBot.processUnprocessedNews() instead (Phase 03) */
async createIntentFromCrawledData(rawData: {...}): Promise<Activity | null> {
  console.warn('[Orchestrator] createIntentFromCrawledData() is deprecated. Use CuratorBot.');
  // ... giữ nguyên code hiện tại — backward compat cho Phase 04 refactor
}
```

---

## 6. API Routes

### 6.1. New: `POST /api/curator/run`

```typescript
// Trigger curator thủ công từ Admin UI
POST /api/curator/run
Body: { limit?: number }  // default 10
Response: CurateJobResult

// Auth: admin only
```

### 6.2. New: `GET /api/curator/stats`

```typescript
// Dashboard stats
GET /api/curator/stats
Response: {
  pendingCount: number;    // RawNews isProcessed=false
  processedToday: number;  // Curated today
  failedCount: number;     // curateError != null
  lastRunAt: string | null;
}
```

---

## 7. Files to Create/Modify

### Create:
| File | Nội dung |
|------|----------|
| `app/lib/openclaw/curator-bot.ts` | CuratorBot class |
| `app/app/api/curator/run/route.ts` | Manual trigger endpoint |
| `app/app/api/curator/stats/route.ts` | Stats endpoint |
| `app/scripts/seed-curator-bot.ts` | Seed curator_bds bot vào DB |

### Modify:
| File | Thay đổi |
|------|----------|
| `app/prisma/schema.prisma` | Thêm `crawlSourceId`, `curatedAt`, `curateError` vào RawNews + relation |
| `app/lib/openclaw/persistence.ts` | Thêm `saveRawNewsFromCrawl()`, `markRawNewsProcessed()` |
| `app/lib/openclaw/real-estate-crawler.ts` | `processItems()` → save RawNews thay vì gọi orchestrator trực tiếp |
| `app/app/api/crawler/trigger/route.ts` | Fire-and-forget curator trigger sau crawl |
| `app/lib/openclaw/orchestrator.ts` | Thêm `@deprecated` warning cho `createIntentFromCrawledData()` |

---

## 8. Data Flow End-to-End (Phase 01+02+03)

```
Admin → Add CrawlSource (CrawlSourcesTab)
     ↓
CRON / Manual Trigger → GenericCrawler.crawlAll()
                              ↓
                         RawCrawlItem[]
                              ↓
                    saveRawNewsFromCrawl()        ← NEW Phase 03
                              ↓
                    RawNews (isProcessed=false)   ← Staging buffer
                              ↓ (fire-and-forget)
                    CuratorBot.processUnprocessedNews()  ← NEW Phase 03
                              ↓
                    chatWithJSON (parse, NOT create)
                              ↓
                    saveIntentFromBot()
                              ↓
                    Intent (isBot=true, sourceUrl required!)
                              ↓
                    markRawNewsProcessed(rawNewsId)
```

---

## 9. Test Cases

### TC-01: Happy Path — RawNews → Intent
```
Given: 5 RawNews records với isProcessed=false, chứa tin BĐS hợp lệ
When:  CuratorBot.processUnprocessedNews(5) chạy
Then:
  ✅ 5 Intent records được tạo
  ✅ Mỗi Intent có sourceUrl = originalUrl của RawNews
  ✅ Mỗi Intent có parsedData JSON hợp lệ
  ✅ 5 RawNews có isProcessed=true
```

### TC-02: Dedup — Không tạo Intent trùng
```
Given: RawNews có originalUrl đã tồn tại trong Intent.sourceUrl
When:  CuratorBot chạy
Then:
  ✅ Bỏ qua item trùng
  ✅ Result.skipped = 1
  ✅ RawNews.isProcessed = true (nhưng không tạo Intent mới)
```

### TC-03: LLM Fallback — Parse fail
```
Given: RawNews chứa text rất ngắn/lộn xộn, LLM không parse được JSON
When:  CuratorBot chạy, chatWithJSON fail 2 lần
Then:
  ✅ Fallback: tạo Intent với rawText trực tiếp (type='CO', no price)
  ✅ RawNews.curateError ghi lý do fail
  ✅ RawNews.isProcessed = true (không retry vô hạn)
  ✅ Result.failed = 1
```

### TC-04: Admin đổi System Prompt
```
Given: 10 Intents đã tạo vs system prompt cũ
When:  Admin sửa systemPrompt của bot curator_bds
Then:
  ✅ 10 RawNews cũ vẫn isProcessed=true (không reprocess auto)
  ✅ RawNews MỚI từ crawl tiếp theo dùng prompt mới
  ✅ Admin có thể reset isProcessed=false thủ công để reprocess
```

### TC-05: No Bot Match — Vẫn tạo Intent
```
Given: RawNews có district không match bất kỳ envoy bot nào
When:  CuratorBot chạy
Then:
  ✅ Dùng fallback botHandle = 'curator_bds' (curator bot tự làm author)
  ✅ Intent được tạo với botHandle='curator_bds'
  ✅ KHÔNG skip item chỉ vì không có envoy bot phù hợp
```

---

## 10. Dependency Map

```
Phase 01 ✅
  └── AIChatMessage, MarketReport schema
  └── Bot.botType, knowledgeText, scheduleConfig ← CuratorBot dùng

Phase 02 ✅
  └── GenericCrawler → CrawlSource
  └── real-estate-crawler.ts processItems() ← Phase 03 SỬA

Phase 03 (THIS)
  └── curator-bot.ts (NEW)
  └── persistence.ts: saveRawNewsFromCrawl, markRawNewsProcessed (NEW)
  └── schema.prisma: RawNews +3 fields (MIGRATION)
  └── Không block Phase 04-06
```

---

## 11. Implementation Order (gợi ý cho /code)

```
Step 1: Migration schema (crawlSourceId, curatedAt, curateError) + npx prisma migrate
Step 2: persistence.ts — saveRawNewsFromCrawl() + markRawNewsProcessed()
Step 3: curator-bot.ts — class đầy đủ
Step 4: real-estate-crawler.ts — đổi processItems() → save RawNews
Step 5: seed-curator-bot.ts — seed curator_bds bot
Step 6: api/curator/run + api/curator/stats
Step 7: api/crawler/trigger — thêm async curator trigger
Step 8: deprecate warning trong orchestrator.ts
```

---

*Design by Antigravity AWF /design workflow — 2026-04-11*
