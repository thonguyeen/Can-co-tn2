# Phase 01: Database Schema & Bot Config UI
Status: ⬜ Pending
Dependencies: None (bước nền tảng)

## Objective
Mở rộng schema DB để hỗ trợ: Schedule per bot, Knowledge Text, Chat History cho NHA.AI, và Market Reports. Tạo Admin UI cho phép chỉnh System Prompt, Knowledge, Schedule từ giao diện.

## Requirements

### Functional
- [ ] Thêm fields vào model `Bot`: `scheduleConfig` (JSON), `knowledgeText` (Text), `botType` (enum: crawler/curator/analyst/alert/chatbot/facebot)
- [ ] Tạo model mới `AIChatMessage`: lưu lịch sử chat của NHA.AI theo từng user
- [ ] Tạo model mới `MarketReport`: lưu báo cáo tự động từ Analyst Bot
- [ ] Admin UI: Tab "Bot Config" cho phép chỉnh sửa System Prompt, Knowledge Text, Schedule cho từng bot
- [ ] Admin UI: Hiển thị trạng thái schedule (đang ngủ/đang hoạt động)

### Non-Functional
- [ ] Migration Prisma phải backward-compatible (thêm fields, không xóa)
- [ ] Không break bất kỳ API nào đang hoạt động

## Implementation Steps

### A. Database Schema Changes

1. [ ] **Mở rộng model `Bot`** trong `prisma/schema.prisma`:
   ```prisma
   // Thêm vào model Bot:
   botType            String?   @default("facebot") @map("bot_type")
   // "crawler" | "curator" | "analyst" | "alert" | "chatbot" | "facebot"
   knowledgeText      String?   @map("knowledge_text") @db.Text
   scheduleConfig     Json?     @default("{}") @map("schedule_config")
   // scheduleConfig format:
   // {
   //   "activeHours": { "start": "08:00", "end": "22:00" },
   //   "activeDays": [1,2,3,4,5],  // 0=CN, 1=T2...6=T7
   //   "intervalMinutes": 60,
   //   "timezone": "Asia/Ho_Chi_Minh"
   // }
   ```

2. [ ] **Tạo model `AIChatMessage`**:
   ```prisma
   model AIChatMessage {
     id        String    @id @default(uuid())
     userId    String    @map("user_id")
     role      String    // "user" | "bot"
     content   String    @db.Text
     metadata  Json?     @default("{}")
     createdAt DateTime? @default(now()) @map("created_at") @db.Timestamptz

     @@index([userId, createdAt])
     @@map("ai_chat_messages")
   }
   ```

3. [ ] **Tạo model `MarketReport`**:
   ```prisma
   model MarketReport {
     id        String    @id @default(uuid())
     botHandle String    @map("bot_handle")
     category  String    @default("real_estate")
     region    String?   // "Q7, TP.HCM" hoặc "Toàn quốc"
     period    String    // "daily" | "weekly" | "monthly"
     title     String
     content   String    @db.Text
     stats     Json?     @default("{}")  // { avgPrice, totalListings, priceChange... }
     createdAt DateTime? @default(now()) @map("created_at") @db.Timestamptz

     @@index([category, createdAt])
     @@map("market_reports")
   }
   ```

4. [ ] **Chạy migration**: `npx prisma migrate dev --name bot_revamp_phase01`

### B. Admin UI — Bot Config Tab

5. [ ] **Tạo component `BotConfigTab.tsx`** trong `app/admin/components/`:
   - Dropdown chọn bot (từ danh sách bots trong DB)
   - Textarea: System Prompt (load/save `systemPrompt`)
   - Textarea: Knowledge Text (load/save `knowledgeText`)
   - Section: Schedule Config (chọn giờ bắt đầu/kết thúc, ngày, tần suất)
   - Dropdown: Bot Type (crawler/curator/analyst/chatbot/facebot)
   - Button: Save Changes → `PUT /api/admin/bots/[id]`
   - Badge: Trạng thái hiện tại (🟢 Đang hoạt động / 🔴 Đang ngủ / ⚪ Tắt)

6. [ ] **Tạo API `PUT /api/admin/bots/[id]/route.ts`**:
   - Nhận body: `{ systemPrompt, knowledgeText, scheduleConfig, botType }`
   - Validate schedule JSON format
   - Update DB
   - Return updated bot

7. [ ] **Tạo API `GET /api/admin/bots/route.ts`** (nếu chưa có):
   - Trả về danh sách tất cả bots với đầy đủ fields mới

8. [ ] **Thêm tab "Bot Config" vào Admin page** — link từ admin layout sidebar

### C. Tạo Record NHA.AI Bot

9. [ ] **Seed NHA.AI vào bảng Bot**:
   - handle: `nha_ai`
   - name: `NHA.AI`
   - botType: `chatbot`
   - systemPrompt: (nội dung SYSTEM_PROMPT hiện tại từ `/api/chat/route.ts`)
   - knowledgeText: (để trống, Admin sẽ nhập sau)
   - isActive: true

## Files to Create/Modify

### Modify:
- `app/prisma/schema.prisma` — Thêm fields Bot, tạo AIChatMessage, MarketReport
- `app/app/admin/page.tsx` — Thêm tab Bot Config
- `app/app/api/chat/route.ts` — Đọc systemPrompt từ DB thay vì hardcode

### Create:
- `app/app/admin/components/BotConfigTab.tsx` — UI chỉnh cấu hình bot
- `app/app/api/admin/bots/route.ts` — GET list bots
- `app/app/api/admin/bots/[id]/route.ts` — PUT update bot config
- `prisma/migrations/xxx_bot_revamp_phase01/` — Auto-generated

## Test Criteria
- [ ] Migration chạy không lỗi
- [ ] Admin vào tab Bot Config → thấy danh sách bot
- [ ] Chọn 1 bot → load được System Prompt + Knowledge
- [ ] Sửa → Save → Reload → data vẫn đúng
- [ ] NHA.AI bot tồn tại trong DB với botType = "chatbot"
- [ ] Các API frontend hiện tại vẫn hoạt động bình thường (no regression)

## Notes
- `systemPrompt` field đã có sẵn trong schema, chỉ cần dùng đúng
- Schedule chỉ lưu config vào DB ở phase này, logic check schedule sẽ implement ở Phase 04
- NHA.AI bot chỉ tạo record ở đây, logic persistence chat sẽ implement ở Phase 06

---
Next Phase: [Phase 02 - Crawler Mở Rộng](./phase-02-crawler.md)
