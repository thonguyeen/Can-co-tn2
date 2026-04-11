# Phase 02: Crawler Mở Rộng
Status: ⬜ Pending
Dependencies: Phase 01 (cần model MarketReport, CrawlSource sẵn)

## Objective
Mở rộng hệ thống crawler hiện có (`real-estate-crawler.ts`) để:
- Hỗ trợ thêm nguồn web BĐS mới (batdongsan.com.vn, alonhadat.com.vn, chotot.com)
- Thêm Facebook Groups crawler
- Đọc `scheduleConfig` từ DB để chạy theo lịch (thay vì interval cứng)

## Requirements

### Functional
- [ ] Thêm selector presets cho các trang BĐS phổ biến (batdongsan, alonhadat, chotot)
- [ ] Tạo Facebook crawler module mới (Graph API hoặc scraping fallback)
- [ ] Crawler đọc `CrawlSource.category` để route đúng parse pipeline
- [ ] Admin có thể thêm nguồn cào mới từ UI `CrawlSourcesTab.tsx` (đã có)
- [ ] Log kết quả mỗi lần crawl vào `CrawlLog`

### Non-Functional
- [ ] Rate limiting: Tôn trọng robots.txt và delays
- [ ] Error recovery: Nguồn lỗi không ảnh hưởng nguồn khác
- [ ] Category-agnostic: Crawler không biết nội dung là BĐS hay tuyển dụng

## Implementation Steps

1. [ ] **Tạo selector presets** cho từng trang web BĐS:
   - `lib/openclaw/crawl-selectors.ts` — Export object `SITE_SELECTORS` map domain → selectors
   - VD: `batdongsan.com.vn` → `{ listItem: '.js__card', title: '.js__card-title', price: '.re__card-config-price', ... }`
   - Auto-detect domain trong `crawlHTML()` và dùng selector phù hợp

2. [ ] **Tạo Facebook crawler module**:
   - `lib/openclaw/facebook-crawler.ts`
   - Hỗ trợ 2 mode: Graph API (cần `FACEBOOK_ACCESS_TOKEN`) và RSS fallback (FB public groups có RSS URL dạng `https://www.facebook.com/groups/{id}/feed/`)
   - Output: `RawCrawlItem[]` giống format hiện tại
   - Xử lý: ảnh, link, text content từ FB post
   - Rate limit: Max 200 requests/hour (Graph API limit)

3. [ ] **Refactor `RealEstateCrawler` → `GenericCrawler`**:
   - Rename class thành `GenericCrawler` (category-agnostic)
   - Thêm method `crawlFacebook()` bên cạnh `crawlRSS()` và `crawlHTML()`
   - `sourceType` mở rộng: `'rss' | 'html' | 'facebook_group' | 'facebook_page'`

4. [ ] **Cập nhật Admin `CrawlSourcesTab.tsx`**:
   - Thêm sourceType options: `facebook_group`, `facebook_page`
   - Khi chọn trang BĐS đã có preset → tự điền selectors vào `notes`
   - Hiển thị nút "Test Crawl" chạy thử 1 nguồn

5. [ ] **Seed nguồn BĐS mặc định** vào `CrawlSource`:
   - batdongsan.com.vn (RSS/HTML)
   - alonhadat.com.vn (HTML)
   - chotot.com/bat-dong-san (HTML)
   - cafeland.vn (RSS)

## Files to Create/Modify

### Create:
- `app/lib/openclaw/crawl-selectors.ts` — Selector presets per domain
- `app/lib/openclaw/facebook-crawler.ts` — Facebook crawler module

### Modify:
- `app/lib/openclaw/real-estate-crawler.ts` → Rename/refactor thành GenericCrawler
- `app/app/admin/components/CrawlSourcesTab.tsx` — Thêm source types + preset selectors

## Test Criteria
- [ ] Crawl batdongsan.com.vn → ra ≥5 items có title + price + URL
- [ ] Crawl alonhadat.com.vn → ra ≥5 items
- [ ] Crawl chotot.com → ra ≥5 items
- [ ] Facebook crawl (nếu có token) → ra posts từ group
- [ ] Nguồn lỗi không crash toàn bộ crawler
- [ ] CrawlLog ghi đúng số item crawled/saved/error

## Notes
- Facebook Graph API cần: App ID + App Secret + Access Token. Nếu chưa có, dùng RSS fallback trước.
- Selector presets sẽ phải update khi website thay đổi HTML structure → thiết kế dạng config/JSON dễ sửa.
- GenericCrawler vẫn giữ backward compat: các CrawlSource hiện tại với sourceType 'rss'/'html' vẫn hoạt động y nguyên.

---
Next Phase: [Phase 03 - Curator Bot](./phase-03-curator.md)
