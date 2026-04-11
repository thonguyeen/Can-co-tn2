# Phase 07: Integration Testing
Status: ⬜ Pending
Dependencies: Phase 01-06 (tất cả)

## Objective
Test end-to-end toàn bộ pipeline mới: Crawl → Curate → Report → Chatbot → FACEBOT Comment. Đảm bảo Nguyên tắc vàng: "Bot không bịa. Mỗi bài đăng phải có nguồn."

## Requirements

### Functional
- [ ] Full pipeline test: Thêm CrawlSource → Crawler chạy → RawNews xuất hiện → CuratorBot parse → Intent tạo → AnalystBot tổng hợp → MarketReport xuất hiện → NHA.AI trả lời dựa trên data → FACEBOT comment trên Intent
- [ ] Regression test: Các tính năng cũ (feed, swipe, chat user-to-user, referral) vẫn hoạt động
- [ ] Schedule test: Bot ngoài giờ không hoạt động
- [ ] Admin test: Đổi prompt/knowledge → behavior thay đổi tương ứng

### Non-Functional
- [ ] Không có Intent nào thiếu `sourceUrl` (check bằng SQL query)
- [ ] Không có bài post nào từ bot kiểu cũ (LLM bịa) sau khi refactor
- [ ] Performance: Crawl 100 items < 5 phút

## Test Scenarios

### Scenario 1: Happy Path
```
1. Admin thêm CrawlSource: cafeland.vn RSS
2. Trigger crawl → Thấy RawNews mới trong DB
3. CuratorBot chạy → Thấy Intents CẦN/CÓ mới, có source_url
4. AnalystBot chạy → Thấy MarketReport mới
5. User mở chatbot → Hỏi "Giá nhà Q7 hiện sao?" → NHA.AI trả lời có số liệu
6. FACEBOT bình luận trên Intent mới → IntentComment có nội dung liên quan
```

### Scenario 2: Schedule Test
```
1. Set bot scheduleConfig: activeHours 09:00-17:00
2. Test lúc 20:00 → Bot không hoạt động ✅
3. Test lúc 10:00 → Bot hoạt động ✅
```

### Scenario 3: Admin Config Test
```
1. Đổi NHA.AI systemPrompt → "Chỉ trả lời về căn hộ"
2. User hỏi về đất nền → NHA.AI từ chối/redirect ✅
3. Đổi Curator systemPrompt → Thêm field "floors" vào parse schema
4. Crawl lại → Intent.parsedData có field "floors" ✅
```

### Scenario 4: No-Source Validation
```
SQL CHECK: SELECT COUNT(*) FROM intents WHERE source_url IS NULL AND is_bot = true AND created_at > '2026-04-11'
→ Kết quả phải = 0
```

## Implementation Steps

1. [ ] **Tạo seed script** cho test: `scripts/test-bot-revamp.ts`
   - Thêm CrawlSource test
   - Trigger crawl
   - Trigger curate
   - Trigger analyst report
   - Trigger FACEBOT commenting
   - Check results

2. [ ] **SQL validation queries** (chạy sau mỗi test):
   - Mọi Intent từ bot phải có source_url
   - MarketReport.stats phải có số liệu aggregate
   - AIChatMessage phải có userId hợp lệ

3. [ ] **Regression check**: chạy dev server, test thủ công:
   - Trang chủ Feed load đúng
   - SwipeMatch hoạt động
   - Referral system hoạt động
   - Admin dashboard hoạt động

## Files to Create

### Create:
- `app/scripts/test-bot-revamp.ts` — Integration test script

## Test Criteria
- [ ] Full pipeline chạy end-to-end không lỗi
- [ ] 0 Intent từ bot thiếu source_url
- [ ] Chatbot NHA.AI trả lời có số liệu thật
- [ ] No regression trên các tính năng cũ
- [ ] Schedule hoạt động đúng

## Notes
- Test nên chạy trên dev environment với DB thật (không mock)
- Nếu Facebook API chưa sẵn sàng → skip Facebook scenario, test RSS/HTML trước
- Sau khi pass → có thể chuyển sang `/deploy`

---
🏁 END OF PLAN
