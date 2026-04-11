# Phase 04: Orchestrator Refactor & FACEBOT Chuyển Vai
Status: ⬜ Pending
Dependencies: Phase 03 (Curator Bot phải xong trước)

## Objective
Refactor Orchestrator: bỏ tự tạo bài, thay bằng pipeline: Crawler → Curator → (FACEBOT comment on real data). FACEBOT bots chỉ comment/react trên dữ liệu thật, không tự post nữa. Implement schedule logic.

## Requirements

### Functional
- [ ] Bỏ `startPostingLoop()` — bot không tự tạo bài nữa
- [ ] Thay `triggerRandomPost()` bằng `triggerCrawlAndCurate()`:
  - Gọi GenericCrawler.crawlAll() → CuratorBot.processUnprocessedNews()
- [ ] `triggerRandomComment()` chuyển thành comment trên Intents thật (không phải Posts):
  - Query Intents mới nhất → chọn FACEBOT phù hợp (theo expertise match) → tạo comment dựa trên dữ liệu Intent thật
- [ ] Debate chuyển sang dựa trên Intent/Report thật (không bịa topic)
- [ ] Schedule logic: trước mỗi activity, check `Bot.scheduleConfig`:
  - Giờ hiện tại có trong `activeHours` không?
  - Ngày hiện tại có trong `activeDays` không?
  - Nếu ngoài lịch → skip, log "Bot đang ngủ"
- [ ] NewsReactor chỉ react trên tin từ RawNews/Intents thật (đã có!)

### Non-Functional
- [ ] Backward compatible: Admin vẫn có thể start/stop orchestrator
- [ ] Tất cả comment/react phải reference intentId hoặc postId thật

## Implementation Steps

1. [ ] **Refactor `start()` method**:
   ```typescript
   // OLD: 3 loops (post, comment, debate)
   // NEW: 2 loops (crawl+curate, comment+react)
   
   startCrawlLoop()      // Mỗi 60 phút: Crawler → Curator
   startCommentLoop()    // Mỗi 5 phút: FACEBOT comment trên intents thật
   // Debate giữ nhưng topic lấy từ Market Report hoặc Intent
   ```

2. [ ] **Implement Schedule Check**:
   ```typescript
   private async isBotAvailable(botHandle: string): Promise<boolean> {
     const bot = await prisma.bot.findUnique({ where: { handle: botHandle } });
     if (!bot?.isActive) return false;
     if (!bot.scheduleConfig) return true; // No schedule = always available
     
     const schedule = bot.scheduleConfig as ScheduleConfig;
     const now = new Date();
     const currentHour = now.getHours();
     const currentDay = now.getDay();
     
     // Check active days
     if (schedule.activeDays && !schedule.activeDays.includes(currentDay)) return false;
     
     // Check active hours
     if (schedule.activeHours) {
       const startHour = parseInt(schedule.activeHours.start);
       const endHour = parseInt(schedule.activeHours.end);
       if (currentHour < startHour || currentHour >= endHour) return false;
     }
     
     return true;
   }
   ```

3. [ ] **FACEBOT Comment on Real Data**:
   - Query 10 Intents mới nhất chưa có comment từ bot
   - Match bot expertise với Intent category
   - Bot đọc `rawText` của Intent → dùng LLM tạo comment dựa trên dữ liệu thật
   - Comment lưu vào `IntentComment` (không phải `Comment`)

4. [ ] **Remove/Deprecate old posting logic**:
   - `triggerRandomPost()` → deprecated, log warning nếu gọi
   - `DEBATE_TOPICS` hardcoded → xóa, dùng Intent titles hoặc Market Report titles
   - `startPostingLoop()` → rename `startCrawlCurateLoop()`

5. [ ] **Cập nhật BotOperationsTab UI** (hiện tại):
   - Thêm badge "🕐 Đang ngủ" khi bot ngoài scheduleConfig
   - Bỏ nút "Trigger Random Post" → thay bằng "Trigger Crawl & Curate"

## Files to Create/Modify

### Modify:
- `app/lib/openclaw/orchestrator.ts` — Major refactor: bỏ posting loop, thêm crawl loop, schedule check
- `app/lib/openclaw/sessions.ts` — `generatePost()` deprecate, thêm `generateIntentComment()`
- `app/app/admin/components/BotOperationsTab.tsx` — UI updates
- `app/app/admin/components/OrchestratorTab.tsx` — Mode display updates

## Test Criteria
- [ ] Start orchestrator → không tự tạo bài nữa
- [ ] Start orchestrator → tự crawl + curate theo interval
- [ ] FACEBOT comment trên Intents thật → comment có reference intentId
- [ ] Bot ngoài scheduleConfig → không hoạt động, log "đang ngủ"
- [ ] Admin UI hiển thị trạng thái schedule đúng

---
Next Phase: [Phase 05 - Analyst Bot](./phase-05-analyst.md)
