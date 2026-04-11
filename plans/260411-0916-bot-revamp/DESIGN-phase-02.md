# 🎨 DESIGN: Phase 02 — Crawler Mở Rộng

Ngày tạo: 2026-04-11
Dựa trên: [phase-02-crawler.md](./phase-02-crawler.md)
Context: [real-estate-crawler.ts] đã có, cần mở rộng

---

## 1. Tổng Quan Kiến Trúc

### 1.1. Hiện Tại vs Sẽ Làm

```
HIỆN TẠI:
  CrawlSource (DB) ──► RealEstateCrawler ──► Orchestrator.createIntentFromCrawledData()
                        ↳ sourceType: 'rss' | 'html' only
                        ↳ Hardcode BĐS selectors

SẼ LÀM (Phase 02):
  CrawlSource (DB) ──► GenericCrawler ──► Orchestrator (không đổi)
                        ↳ sourceType: 'rss' | 'html' | 'facebook_group' | 'facebook_page'
                        ↳ SITE_SELECTORS preset (batdongsan, alonhadat, chotot, cafeland)
                        ↳ FacebookCrawler module riêng
                        ↳ Backward compat 100%
```

### 1.2. Module Map

```
lib/openclaw/
├── real-estate-crawler.ts  ← RENAME → generic-crawler.ts (class rename + new methods)
├── crawl-selectors.ts      ← NEW: Selector presets per domain
└── facebook-crawler.ts     ← NEW: Facebook Group/Page crawler

app/admin/components/
└── CrawlSourcesTab.tsx     ← UPDATE: Thêm sourceType options + "Test Crawl" button

app/api/crawler/
└── trigger/route.ts        ← UPDATE: Import generic-crawler thay vì real-estate-crawler

scripts/
└── seed-crawl-sources.ts   ← NEW: Seed 4 nguồn BĐS mặc định
```

---

## 2. Module 1: `crawl-selectors.ts`

### 2.1. Mục đích
File này đóng vai trò như "từ điển CSS selectors" — cho mỗi trang web, ghi sẵn các "địa chỉ trích xuất" (CSS selector) để cheerio biết tìm tiêu đề, link, giá ở đâu trong HTML.

### 2.2. Interface

```typescript
export interface SiteSelectors {
  listItem: string;   // Container mỗi bài đăng
  title: string;      // Tiêu đề
  link: string;       // Đường link chi tiết
  content: string;    // Mô tả ngắn
  price?: string;     // Giá (nếu có)
  image?: string;     // Ảnh đại diện
}

export interface SitePreset {
  domain: string;              // VD: "batdongsan.com.vn"
  name: string;                // VD: "BatDongSan.com.vn"
  selectors: SiteSelectors;
  defaultRssUrl?: string;      // RSS feed nếu có (ưu tiên dùng RSS)
}
```

### 2.3. Preset Data (4 trang ưu tiên)

```
┌──────────────────────────────────────────────────────────────┐
│  Trang 1: BatDongSan.com.vn                                  │
│  Domain: batdongsan.com.vn                                   │
│  RSS Available: ✅ (http://rss.batdongsan.com.vn/...)         │
│  Selectors:                                                  │
│    listItem: ".js__card, .re__card-wrap"                    │
│    title: ".js__card-title, .re__card-title"                │
│    link: "a.js__product-link-for-product-id"                │
│    content: ".re__card-config, .re__truncate"               │
│    price: ".re__card-config-price--real"                    │
├──────────────────────────────────────────────────────────────┤
│  Trang 2: AlonhaDat.com.vn                                   │
│  Domain: alonhadat.com.vn                                    │
│  RSS Available: ❌ (HTML only)                               │
│  Selectors:                                                  │
│    listItem: ".search-productItem"                          │
│    title: "h3 a"                                            │
│    link: "h3 a"                                             │
│    content: ".des"                                          │
│    price: ".price-value"                                    │
├──────────────────────────────────────────────────────────────┤
│  Trang 3: ChoTot.com (BĐS)                                   │
│  Domain: chotot.com                                          │
│  RSS Available: ❌                                           │
│  Selectors:                                                  │
│    listItem: "._1RuAM"                                      │
│    title: "._2oaDE p:first-child"                           │
│    link: "a[data-testid='aditem-link']"                     │
│    content: "._1bXFT"                                       │
│    price: "._2_Txa b"                                       │
├──────────────────────────────────────────────────────────────┤
│  Trang 4: CafeLand.vn                                        │
│  Domain: cafeland.vn                                         │
│  RSS Available: ✅ (https://cafeland.vn/rss/...)             │
│  Selectors: (fallback nếu RSS lỗi)                          │
│    listItem: ".box-item"                                    │
│    title: "h3 a"                                            │
│    link: "h3 a"                                             │
│    content: ".box-desc"                                     │
└──────────────────────────────────────────────────────────────┘
```

### 2.4. Auto-detect Logic

```typescript
// Khi crawlHTML() được gọi, GenericCrawler sẽ:
// 1. Parse domain từ URL
// 2. Tìm trong SITE_PRESETS
// 3. Nếu có preset → dùng preset selectors
// 4. Nếu không → dùng DEFAULT_SELECTORS (như hiện tại)
// 5. Nếu source.notes là JSON → override (custom selectors)

function getSelectorsForUrl(url: string, customJson?: string): SiteSelectors {
  // Priority: customJson > domain preset > DEFAULT
  if (customJson) { ... parse customJson ... }
  const domain = new URL(url).hostname.replace('www.', '');
  const preset = SITE_PRESETS.find(p => domain.includes(p.domain));
  return preset?.selectors ?? DEFAULT_SELECTORS;
}
```

---

## 3. Module 2: `generic-crawler.ts` (Rename từ real-estate-crawler.ts)

### 3.1. Thay đổi so với hiện tại

| Điểm | Hiện tại | Phase 02 |
|------|----------|----------|
| Class name | `RealEstateCrawler` | `GenericCrawler` |
| Export function | `getRealEstateCrawler()` | `getGenericCrawler()` + alias `getRealEstateCrawler()` |
| sourceType | `'rss' \| 'html'` | `+'facebook_group' \| 'facebook_page'` |
| Selector | DEFAULT_SELECTORS cứng | Auto-detect từ domain preset |
| Facebook | ❌ | ✅ Gọi FacebookCrawler |
| Backward compat | N/A | ✅ Giữ nguyên `getRealEstateCrawler()` alias |

### 3.2. Method mới: `crawlFacebook()`

```typescript
// Trong GenericCrawler.crawlAndProcess():
case 'facebook_group':
case 'facebook_page':
  items = await this.crawlFacebook(source.url, source.sourceType);
  break;

// Delegate sang FacebookCrawler module
private async crawlFacebook(
  url: string,
  type: 'facebook_group' | 'facebook_page'
): Promise<RawCrawlItem[]> {
  const { getFacebookCrawler } = await import('./facebook-crawler');
  const fbCrawler = getFacebookCrawler();
  return fbCrawler.crawl(url, type);
}
```

### 3.3. Backward Compat Export

```typescript
// Giữ lại để trigger/route.ts và orchestrator không cần sửa
export function getRealEstateCrawler(): GenericCrawler {
  return getGenericCrawler(); // alias
}
```

---

## 4. Module 3: `facebook-crawler.ts`

### 4.1. Chiến lược 2-tier

```
┌──────────────────────────────────────────────────────────────┐
│  Tier 1 — Graph API (Ưu tiên)                                │
│  Điều kiện: FACEBOOK_ACCESS_TOKEN có trong .env.local        │
│  API: https://graph.facebook.com/v19.0/{group-id}/feed       │
│  Rate limit: 200 req/hour → delay 18s/request               │
│  Output: Chuẩn, có author, timestamp, link                   │
├──────────────────────────────────────────────────────────────┤
│  Tier 2 — RSS Fallback (Dự phòng)                            │
│  Điều kiện: Không có token, hoặc group public                │
│  URL: https://www.facebook.com/feeds/page.php?id={page-id}  │
│  Note: RSS chỉ hoạt động với FB Pages, không phải Groups    │
│  Fallback cuối: return [] và log "FB crawl not available"   │
└──────────────────────────────────────────────────────────────┘
```

### 4.2. Interface & Class Design

```typescript
export class FacebookCrawler {
  private hasToken: boolean;
  private accessToken: string | null;

  constructor() {
    this.accessToken = process.env.FACEBOOK_ACCESS_TOKEN || null;
    this.hasToken = !!this.accessToken;
  }

  async crawl(url: string, type: 'facebook_group' | 'facebook_page'): Promise<RawCrawlItem[]> {
    if (this.hasToken) {
      return this.crawlViaGraphAPI(url, type);
    }
    if (type === 'facebook_page') {
      return this.crawlViaRSS(url); // RSS chỉ hoạt động với page
    }
    console.warn('[FacebookCrawler] No access token, Groups not crawlable');
    return [];
  }
}
```

### 4.3. URL Parsing

```typescript
// Hỗ trợ nhiều format URL Facebook:
// - https://www.facebook.com/groups/123456789
// - https://www.facebook.com/groups/tengroup
// - https://www.facebook.com/pagename
// - https://www.facebook.com/pages/pagename/123456

function extractFacebookId(url: string): string | null {
  const groupMatch = url.match(/facebook\.com\/groups\/([^/?]+)/);
  if (groupMatch) return groupMatch[1];
  const pageMatch = url.match(/facebook\.com\/([^/?]+)/);
  if (pageMatch) return pageMatch[1];
  return null;
}
```

### 4.4. Graph API Response → RawCrawlItem

```typescript
// FB Graph API trả về:
{
  "data": [{
    "id": "12345_67890",
    "message": "Bán nhà Q7 3PN, giá 5 tỷ...",
    "created_time": "2026-04-11T07:00:00+0000",
    "permalink_url": "https://www.facebook.com/groups/.../posts/67890",
    "attachments": {
      "data": [{ "media": { "image": { "src": "https://..." } } }]
    }
  }]
}

// Map sang RawCrawlItem:
{
  title: firstLine(message) || "Bài đăng Facebook",
  content: message (max 1000 chars),
  url: permalink_url,
  publishedAt: new Date(created_time),
  imageUrl: attachments[0]?.media?.image?.src
}
```

---

## 5. Admin UI: CrawlSourcesTab Update

### 5.1. Thay đổi

| Element | Hiện tại | Phase 02 |
|---------|----------|----------|
| sourceType options | `rss \| html` | `+facebook_group \| facebook_page` |
| Form fields | Name, URL, Type | +Preset Selector Hint |
| Table column | Loại badge | Badge màu theo type |
| Actions | Sửa, Xóa | +Test Crawl button |

### 5.2. Wireframe: Modal Thêm/Sửa (Updated)

```
┌──────────────────────────────────────────────────────────────┐
│  Thêm Nguồn Cào Mới                                    ✕    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Tên Gọi Gợi Nhớ:                                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ VD: BatDongSan - TP.HCM                               │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  URL Nguồn:                                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ https://                                               │  │
│  └───────────────────────────────────────────────────────┘  │
│  💡 Gợi ý: https://batdongsan.com.vn/ban-can-ho-chung-cu   │
│                                                              │
│  Loại Nguồn:                                                 │
│  ● RSS Feed         ○ HTML Scraping                          │
│  ○ Facebook Group   ○ Facebook Page                          │
│                                                              │
│  [Khi chọn Facebook Group/Page → hiện thêm note:]           │
│  ┌─ ℹ️ Lưu ý ──────────────────────────────────────────┐   │
│  │ Facebook Groups cần access token để cào.            │   │
│  │ Nếu chưa có → chỉ cào được FB Pages công khai.     │   │
│  └────────────────────────────────────────────────────┘   │
│                                                              │
│  [Khi chọn HTML và URL là trang BĐS có preset:]             │
│  ┌─ ✅ Preset tìm thấy: BatDongSan.com.vn ───────────────┐  │
│  │ Em đã biết cách đọc trang này rồi,                  │  │
│  │ không cần cấu hình thêm!                            │  │
│  └────────────────────────────────────────────────────┘  │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                             [ Hủy ]  [ 💾 Lưu Nguồn Cào ]  │
└──────────────────────────────────────────────────────────────┘
```

### 5.3. "Test Crawl" Button

```
Trong table row, thêm nút "Test" bên cạnh "Sửa | Xóa":

[Sửa]  [Test]  [Xóa]

Khi click:
  1. Hiện spinner
  2. POST /api/crawler/trigger { sourceId: source.id }
  3. Hiện modal kết quả:
     ┌──────────────────────────────────────────────────┐
     │  🔍 Kết quả Test Crawl: VNExpress BĐS           │
     │                                                  │
     │  ✅ Crawled: 15 items                            │
     │  ✅ Saved: 8 items mới                           │
     │  ⚠️  Duplicate: 7 items (đã có)                  │
     │  ❌  Error: 0                                     │
     │  ⏱️  Thời gian: 3.2s                             │
     └──────────────────────────────────────────────────┘
```

### 5.4. Type Badge Colors

```
rss           → 🟢 bg-green-500/10 text-green-400   "RSS"
html          → 🔵 bg-blue-500/10 text-blue-400     "HTML"
facebook_group → 🔵 bg-indigo-500/10 text-indigo-400 "FB GROUP"
facebook_page  → 🔵 bg-indigo-500/10 text-indigo-400 "FB PAGE"
```

---

## 6. Seed Data: 4 Nguồn BĐS Mặc Định

File: `scripts/seed-crawl-sources.ts`

```typescript
const DEFAULT_SOURCES = [
  {
    name: "BatDongSan.com.vn - TP.HCM",
    url: "https://batdongsan.com.vn/nha-dat-ban/tp-hcm",
    sourceType: "html",
    category: "real_estate",
    province: "Hồ Chí Minh",
    crawlIntervalMinutes: 120,
  },
  {
    name: "AlonhaDat.com.vn - TP.HCM",
    url: "https://alonhadat.com.vn/nha-dat/can-ban/1/ho-chi-minh.html",
    sourceType: "html",
    category: "real_estate",
    province: "Hồ Chí Minh",
    crawlIntervalMinutes: 120,
  },
  {
    name: "CafeLand.vn - RSS",
    url: "https://cafeland.vn/rss/can-mua-ban.rss",
    sourceType: "rss",
    category: "real_estate",
    crawlIntervalMinutes: 60,
  },
  {
    name: "ChoTot.com - BĐS TP.HCM",
    url: "https://www.chotot.com/tp-ho-chi-minh/mua-ban-nha-dat",
    sourceType: "html",
    category: "real_estate",
    province: "Hồ Chí Minh",
    crawlIntervalMinutes: 180,
  },
];
```

---

## 7. Flow Hoạt Động

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Luồng 1: Admin thêm nguồn BĐS mới
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ Admin vào "🌐 Nguồn Cào" → Click "+ Thêm Nguồn"
2️⃣ Nhập URL: https://batdongsan.com.vn/nha-dat-ban
3️⃣ → UI tự phát hiện preset: "✅ BatDongSan.com.vn — đã biết cách đọc!"
4️⃣ Chọn loại: HTML Scraping, Lưu
5️⃣ Click "Test" → Xem ngay 15 items crawled, 8 items mới

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Luồng 2: Admin thêm Facebook Group
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ Admin → "+ Thêm Nguồn"
2️⃣ URL: https://www.facebook.com/groups/nhadat.saigon
3️⃣ Loại: Facebook Group
4️⃣ UI hiện note: "Cần FACEBOOK_ACCESS_TOKEN trong .env"
5️⃣ Lưu → Nếu không có token → status "Pending" (chờ token)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Luồng 3: Crawler chạy tự động
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ Orchestrator gọi crawler.crawlAll() theo schedule
2️⃣ GenericCrawler lặp qua CrawlSources active
3️⃣ Mỗi source: detect sourceType → route đúng method
4️⃣ RSS → crawlRSS() (unchanged)
5️⃣ HTML → getSelectorsForUrl(url) → crawlHTML() với preset
6️⃣ facebook_group/page → FacebookCrawler.crawl()
7️⃣ Items → processItems() → Orchestrator.createIntentFromCrawledData()
8️⃣ Update lastCrawledAt, totalItemsCrawled
```

---

## 8. Dependency & Risk

### 8.1. Không cần package mới
- `rss-parser` ✅ đã có
- `cheerio` ✅ đã có
- `node-fetch` / `fetch` ✅ native Next.js
- Facebook Graph API: chỉ dùng `fetch` đến `graph.facebook.com`

### 8.2. Risk

| Risk | Mức độ | Mitigation |
|------|--------|------------|
| Trang web thay đổi HTML → selectors lỗi | Medium | Preset stale → fallback DEFAULT_SELECTORS → log warning, không crash |
| Không có FB Access Token | Low | `FacebookCrawler.crawl()` trả về `[]` ngay, không lỗi |
| Rate limit FB API | Medium | Delay 18s/request, max 10 items/source |
| ChoTot dùng React SPA | High | HTML crawl sẽ không work → Cần RSS nếu có, hoặc skip. Ghi chú trong code. |

> **Lưu ý:** ChoTot dùng React SPA — HTML crawler sẽ nhận HTML rỗng (JS chưa render). **Giải pháp thực tế:** Dùng ChoTot API endpoint công khai `https://gateway.chotot.com/v2/public/ad/listing?...` thay vì scrape HTML. Em sẽ implement API mode cho ChoTot.

---

## 9. Checklist Kiểm Tra

### Module: crawl-selectors.ts
- [ ] Export `SITE_PRESETS` array với 4 presets
- [ ] Export `getSelectorsForUrl(url, customJson?)` function
- [ ] BatDongSan preset trả về đúng selectors
- [ ] AlonhaDat preset trả về đúng selectors
- [ ] Domain không có preset → return DEFAULT_SELECTORS
- [ ] customJson override được preset

### Module: generic-crawler.ts
- [ ] Class rename thành `GenericCrawler`
- [ ] `getRealEstateCrawler()` alias vẫn hoạt động
- [ ] sourceType 'html' dùng `getSelectorsForUrl()` thay vì DEFAULT_SELECTORS cứng
- [ ] sourceType 'facebook_group' → gọi FacebookCrawler
- [ ] sourceType 'facebook_page' → gọi FacebookCrawler
- [ ] sourceType khác → log warning, trả về []

### Module: facebook-crawler.ts
- [ ] Constructor đọc `FACEBOOK_ACCESS_TOKEN` từ env
- [ ] Không có token + type=group → return [], log warn
- [ ] Không có token + type=page → thử RSS fallback
- [ ] Có token → gọi Graph API đúng endpoint
- [ ] Parse Graph API response → RawCrawlItem[]
- [ ] Rate limit: delay 18s giữa mỗi request FB

### Admin UI: CrawlSourcesTab
- [ ] Modal có 4 sourceType options
- [ ] Chọn HTML + URL batdongsan → hiện "Preset tìm thấy"
- [ ] Chọn facebook_group/page → hiện note về token
- [ ] Table badge hiển thị đúng màu theo type
- [ ] "Test" button trigger crawl 1 nguồn → hiện kết quả

### Seed
- [ ] 4 nguồn BĐS được seed vào DB bằng upsert
- [ ] Trigger test crawl → ≥5 items từ CafeLand RSS

---

## 10. Test Cases

### TC-01: Auto-detect preset BatDongSan
```
Given: URL = "https://batdongsan.com.vn/nha-dat-ban/quan-7"
When:  getSelectorsForUrl(url) được gọi
Then:  ✓ Trả về BatDongSan selectors (listItem=".js__card")
       ✓ KHÔNG trả về DEFAULT_SELECTORS
```

### TC-02: Fallback khi không có preset
```
Given: URL = "https://somexyzsite.vn/listing"
When:  getSelectorsForUrl(url) được gọi
Then:  ✓ Trả về DEFAULT_SELECTORS
       ✓ Không lỗi
```

### TC-03: Facebook Group không có token
```
Given: FACEBOOK_ACCESS_TOKEN = null
When:  FacebookCrawler.crawl("https://facebook.com/groups/abc", "facebook_group")
Then:  ✓ Trả về []
       ✓ Log warn "No access token"
       ✓ Không throw error
```

### TC-04: Backward compat getRealEstateCrawler()
```
Given: trigger/route.ts dùng getRealEstateCrawler()
When:  POST /api/crawler/trigger
Then:  ✓ Hoạt động bình thường (alias trả về GenericCrawler)
       ✓ crawlAll() trả về đúng format CrawlResult
```

### TC-05: CrawlSourcesTab preset detection
```
Given: Admin nhập URL "batdongsan.com.vn/..."
When:  URL thay đổi trong form
Then:  ✓ Hiện badge "✅ Preset: BatDongSan.com.vn"
       ✓ Không cần nhập thêm selectors
```

### TC-06: Test crawl từ Admin UI
```
Given: Có source CafeLand RSS trong DB
When:  Admin click "Test" trên source đó
Then:  ✓ Hiện spinner
       ✓ Sau 2-5s: hiện modal kết quả
       ✓ itemsCrawled > 0
       ✓ Không crash page
```

---

## 11. Files Summary

| Action | File | Mục đích |
|--------|------|----------|
| NEW | `lib/openclaw/crawl-selectors.ts` | 4 site presets + getSelectorsForUrl() |
| NEW | `lib/openclaw/facebook-crawler.ts` | FB Graph API + RSS fallback |
| RENAME+MODIFY | `real-estate-crawler.ts` → `generic-crawler.ts` | Class rename, facebook routing, preset auto-detect |
| MODIFY | `api/crawler/trigger/route.ts` | Import generic-crawler |
| MODIFY | `admin/components/CrawlSourcesTab.tsx` | +4 sourceTypes, +preset hint, +test button |
| NEW | `scripts/seed-crawl-sources.ts` | 4 nguồn BĐS mặc định |

---

*Tạo bởi AWF — Design Phase · Phase 02 of Bot Revamp*
