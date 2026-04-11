# Phase 05: Analyst Bot (Báo Cáo Thị Trường Tự Động)
Status: ⬜ Pending
Dependencies: Phase 03 (cần Intents thật từ Curator), Phase 01 (cần model MarketReport)

## Objective
Tạo Analyst Bot tổng hợp dữ liệu thật từ Intents → tạo báo cáo thị trường tự động. LLM chỉ TỔNG HỢP số liệu thật, KHÔNG bịa.

## Requirements

### Functional
- [ ] Tạo `AnalystBot` class: query Intents theo category + region + time range → tổng hợp stats → gọi LLM viết báo cáo
- [ ] Stats tính từ DB (SQL aggregate): giá TB, số lượng tin, phân bố theo quận, so sánh tuần trước
- [ ] Report template đọc từ `Bot.knowledgeText` (Admin cấu hình)
- [ ] Tự động chạy: Daily (mỗi sáng 8h) và Weekly (mỗi thứ 2)
- [ ] Lưu vào `MarketReport` table
- [ ] FACEBOT bots tự comment trên report mới (link với Phase 04)

### Non-Functional
- [ ] Số liệu phải 100% từ DB, LLM chỉ viết văn
- [ ] Report có section "Nguồn dữ liệu: X tin CÓ, Y tin CẦN từ Z nguồn"

## Implementation Steps

1. [ ] **Tạo `lib/openclaw/analyst-bot.ts`**:
   - Method `generateDailyReport(category, region?)`:
     - Query DB: `SELECT COUNT(*), AVG(price), district FROM intents WHERE createdAt > 24h AND category = ...`
     - Build stats object: `{ totalListings, avgPrice, priceByDistrict, topDistricts, newVsYesterday }`
     - Inject stats + knowledgeText vào prompt
     - LLM viết báo cáo dạng markdown
     - Save to `MarketReport`
   - Method `generateWeeklyReport(category, region?)`: tương tự nhưng range 7 ngày, có trend comparison

2. [ ] **Tạo default System Prompt cho Analyst Bot**:
   ```
   Bạn là bot phân tích thị trường. Nhiệm vụ: viết báo cáo từ SỐ LIỆU THẬT được cung cấp. 
   KHÔNG bịa số liệu. KHÔNG đoán. Chỉ tổng hợp và nhận xét dựa trên data.
   Format: Markdown, có heading, bullet points, số liệu bold.
   ```

3. [ ] **Schedule integration**:
   - Analyst Bot đọc `scheduleConfig` riêng (VD: `{ "autoReportAt": ["08:00"], "autoReportDays": [1,2,3,4,5] }`)
   - Orchestrator gọi `analystBot.generateDailyReport()` theo lịch

4. [ ] **Seed Analyst Bot vào DB**:
   - handle: `analyst_bds`
   - botType: `analyst`
   - systemPrompt: default analyst prompt
   - knowledgeText: (Admin điền sau: template báo cáo, thuật ngữ BĐS)
   - scheduleConfig: `{ "autoReportAt": ["08:00"], "autoReportDays": [1,2,3,4,5] }`

5. [ ] **Admin UI**: Hiển thị MarketReports gần nhất trong Dashboard

## Files to Create/Modify

### Create:
- `app/lib/openclaw/analyst-bot.ts` — Analyst Bot module

### Modify:
- `app/lib/openclaw/orchestrator.ts` — Thêm analyst report schedule
- `app/app/admin/components/BotDashboardTab.tsx` — Hiển thị recent reports

## Test Criteria
- [ ] Có ≥20 Intents trong DB → chạy Analyst → tạo 1 MarketReport
- [ ] MarketReport.stats có số liệu aggregate (avgPrice, totalListings)
- [ ] MarketReport.content là markdown đọc được, không chứa số liệu bịa
- [ ] Report có dẫn nguồn: "Dựa trên X tin đăng trong 24h qua"

---
Next Phase: [Phase 06 - Global Chatbot](./phase-06-chatbot.md)
