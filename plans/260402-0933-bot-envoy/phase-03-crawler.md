# Phase 03: BĐS Crawler
Status: ✅ Complete
Dependencies: Phase 02

## Objective
Tạo crawler đọc nguồn từ bảng `crawl_sources` (Admin tự nhập URL).

## Implementation Steps
1. [ ] Tạo `real-estate-crawler.ts` với class `RealEstateCrawler`
2. [ ] Implement `crawlFromSources()` — Đọc bảng → Cào từng nguồn
3. [ ] Implement `crawlRSS(url)` — Cào RSS feed
4. [ ] Implement `crawlHTML(url)` — Cào trang HTML cơ bản
5. [ ] Implement `parseToIntent()` — Convert raw → Intent form
6. [ ] Dedup bằng hash source_url
7. [ ] Gán Bot phù hợp theo khu vực trùng khớp

## Files to Create/Modify
- `app/lib/openclaw/real-estate-crawler.ts` — [NEW]

---
Next Phase: [phase-04-admin-ui.md](./phase-04-admin-ui.md)
