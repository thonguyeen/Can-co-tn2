# 🎨 DESIGN: Phase 01 — Database Schema & Bot Config UI

Ngày tạo: 2026-04-11
Dựa trên: [plan.md](./plan.md) · [phase-01-schema-config.md](./phase-01-schema-config.md)

---

## 1. Cách Lưu Thông Tin (Database Schema)

### 1.1. Mở rộng model `Bot` (thêm 3 fields mới)

```
┌──────────────────────────────────────────────────────────────┐
│  🤖 BOTS (bảng bots) — HIỆN CÓ + MỚI                       │
│                                                              │
│  ┌─ Đã có ────────────────────────────────────┐              │
│  │  id, name, handle, avatarUrl, bio          │              │
│  │  expertise[], personality, systemPrompt     │              │
│  │  isActive, isEnvoy, assignedProvince/...    │              │
│  │  assignedCategories[], dailyQuota           │              │
│  │  postsCount, commentsCount, debatesCount    │              │
│  └────────────────────────────────────────────┘              │
│                                                              │
│  ┌─ THÊM MỚI ─────────────────────────────────┐             │
│  │  🆕 botType       String  "facebot"          │             │
│  │     → "crawler" | "curator" | "analyst"     │             │
│  │     → "alert" | "chatbot" | "facebot"       │             │
│  │                                              │             │
│  │  🆕 knowledgeText  Text    null              │             │
│  │     → Admin paste bảng giá, quy hoạch...    │             │
│  │                                              │             │
│  │  🆕 scheduleConfig JSON   {}                 │             │
│  │     → Lịch hoạt động của bot                │             │
│  └──────────────────────────────────────────────┘            │
└──────────────────────────────────────────────────────────────┘
```

#### Prisma Schema Changes:

```prisma
// ── Thêm vào cuối model Bot, TRƯỚC dòng "posts Post[]" ──

  // === Bot Revamp Phase 01 ===
  botType            String?   @default("facebot") @map("bot_type")
  knowledgeText      String?   @map("knowledge_text") @db.Text
  scheduleConfig     Json?     @default("{}") @map("schedule_config")
```

#### Schedule Config JSON Format:

```jsonc
// Ví dụ: Bot hoạt động T2-T6, 8h sáng đến 10h tối
{
  "activeHours": { "start": "08:00", "end": "22:00" },
  "activeDays": [1, 2, 3, 4, 5],   // 0=CN, 1=T2, ..., 6=T7
  "intervalMinutes": 60,             // Chạy mỗi 60 phút
  "timezone": "Asia/Ho_Chi_Minh"
}

// Ví dụ: Analyst Bot chạy báo cáo mỗi sáng T2-T6
{
  "activeHours": { "start": "08:00", "end": "09:00" },
  "activeDays": [1, 2, 3, 4, 5],
  "intervalMinutes": 1440,           // 1 lần/ngày
  "timezone": "Asia/Ho_Chi_Minh"
}
```

---

### 1.2. Model mới: `AIChatMessage`

```
┌──────────────────────────────────────────────────────────────┐
│  💬 AI_CHAT_MESSAGES (Lưu lịch sử chat NHA.AI)              │
│                                                              │
│  id         UUID     PK                                      │
│  userId     String   FK → User.id (ai đang chat)             │
│  role       String   "user" hoặc "bot"                       │
│  content    Text     Nội dung tin nhắn                        │
│  metadata   JSON     {} (dự phòng: sentiment, category...)    │
│  createdAt  DateTime Thời gian gửi                            │
│                                                              │
│  INDEX: (userId, createdAt) → load history nhanh              │
└──────────────────────────────────────────────────────────────┘
```

#### Prisma:

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

> **Note:** Không FK tới User vì chatbot cần hoạt động cả khi user chưa đăng nhập chính thức (guest ID tạm). FK sẽ thêm ở Phase 06 khi integrate auth.

---

### 1.3. Model mới: `MarketReport`

```
┌──────────────────────────────────────────────────────────────┐
│  📊 MARKET_REPORTS (Báo cáo thị trường tự động)              │
│                                                              │
│  id         UUID     PK                                      │
│  botHandle  String   Bot nào tạo ra (VD: "analyst_bds")       │
│  category   String   "real_estate" | "recruitment" | ...      │
│  region     String?  "Q7, TP.HCM" | "Toàn quốc" | null       │
│  period     String   "daily" | "weekly" | "monthly"           │
│  title      String   "Báo cáo BĐS Q7 - 11/04/2026"          │
│  content    Text     Markdown report content                  │
│  stats      JSON     { avgPrice, totalListings, ... }         │
│  createdAt  DateTime Thời gian tạo                            │
│                                                              │
│  INDEX: (category, createdAt) → query báo cáo mới nhất       │
└──────────────────────────────────────────────────────────────┘
```

#### Prisma:

```prisma
model MarketReport {
  id        String    @id @default(uuid())
  botHandle String    @map("bot_handle")
  category  String    @default("real_estate")
  region    String?
  period    String    // "daily" | "weekly" | "monthly"
  title     String
  content   String    @db.Text
  stats     Json?     @default("{}")
  createdAt DateTime? @default(now()) @map("created_at") @db.Timestamptz

  @@index([category, createdAt])
  @@map("market_reports")
}
```

#### Stats JSON Format:

```jsonc
{
  "totalListings": 145,
  "newToday": 23,
  "avgPrice": 4500000000,
  "priceByDistrict": {
    "Quận 7": 5200000000,
    "Quận 2": 6800000000
  },
  "topDistricts": ["Quận 7", "Thủ Đức", "Quận 2"],
  "priceChangePercent": 2.3,
  "sourceCount": 5
}
```

---

### 1.4. Sơ đồ quan hệ tổng thể (chỉ phần mới)

```
         ┌─────────────┐
         │    Bot       │
         │ (mở rộng)   │
         │  +botType    │
         │  +knowledge  │
         │  +schedule   │
         └──────┬───────┘
                │
      ┌─────────┼──────────┐
      │ (botType)           │
      ▼                     ▼
┌──────────────┐    ┌──────────────┐
│ MarketReport │    │AIChatMessage │
│ (analyst tạo)│    │ (chatbot lưu)│
└──────────────┘    └──────────────┘
  botHandle ──► Bot       userId ──► User
```

---

## 2. Cửa Giao Tiếp (API Endpoints)

### 2.1. `GET /api/bots` — Đã có, không cần sửa

**Hiện tại:** Trả về danh sách bots.
**Thay đổi:** Không cần sửa — fields mới (`botType`, `knowledgeText`, `scheduleConfig`) sẽ tự động có trong response vì Prisma trả về toàn bộ model.

### 2.2. `PUT /api/bots` — Đã có, không cần sửa

**Hiện tại:** Nhận `handle` + bất kỳ field nào → update. Đã có logic `snake_case → camelCase` tự động.

**Client gửi thêm fields mới:**

```jsonc
// Request Body:
PUT /api/bots
{
  "handle": "analyst_bds",
  "system_prompt": "Bạn là bot phân tích thị trường...",
  "knowledge_text": "Bảng giá tham khảo Q7:\n- Căn hộ: 45-60 triệu/m2\n...",
  "schedule_config": {
    "activeHours": { "start": "08:00", "end": "22:00" },
    "activeDays": [1,2,3,4,5],
    "intervalMinutes": 60
  },
  "bot_type": "analyst"
}
```

> **Important:** API `PUT /api/bots` hiện tại chấp nhận MỌI field và map tự động qua regex. Có rủi ro: client có thể gửi field nguy hiểm. Recommend thêm whitelist validation ở Phase 04.

---

## 3. Màn Hình Admin — "Bot Config" Tab

### 3.1. Vị trí trong Admin

Thêm **tab mới "🧠 Bot Config"** giữa "Nhân Sự Bot" và "Nguồn Cào":

```
📈 Báo Cáo  |  ⚙️ Vận Hành  |  👨‍💼 Nhân Sự  |  🧠 Bot Config  |  🌐 Nguồn Cào  |  ...
                                                  ▲ MỚI
```

### 3.2. Wireframe: BotConfigTab

```
┌─────────────────────────────────────────────────────────────────────────┐
│  🧠 Bot Config                                                         │
│  Cấu hình System Prompt, Knowledge và Schedule cho từng bot            │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────┐       │
│  │  Chọn Bot: [▼ analyst_bds - Phân Tích BĐS        ]          │       │
│  └──────────────────────────────────────────────────────────────┘       │
│                                                                         │
│  ┌─ Bot Info ───────────────────────────────────────────────────┐       │
│  │  🤖 Phân Tích BĐS (@analyst_bds)                            │       │
│  │  Type: [▼ analyst ]  Status: 🟢 Đang hoạt động               │       │
│  └──────────────────────────────────────────────────────────────┘       │
│                                                                         │
│  ┌─ System Prompt ──────────────────────────────────────────────┐      │
│  │  ┌────────────────────────────────────────────────────────┐  │      │
│  │  │ Bạn là bot phân tích thị trường BĐS.                  │  │      │
│  │  │ Nhiệm vụ: viết báo cáo từ SỐ LIỆU THẬT.             │  │      │
│  │  │ KHÔNG bịa. KHÔNG đoán.                                │  │      │
│  │  │ Format: Markdown, heading, bullet, số liệu bold.      │  │      │
│  │  └────────────────────────────────────────────────────────┘  │      │
│  │  📏 1,250 / 10,000 ký tự                                    │      │
│  └──────────────────────────────────────────────────────────────┘      │
│                                                                         │
│  ┌─ Knowledge Text (kiến thức tham khảo) ───────────────────────┐     │
│  │  ┌────────────────────────────────────────────────────────┐  │     │
│  │  │ ## Bảng giá tham khảo khu vực TP.HCM                  │  │     │
│  │  │ - Quận 7: Căn hộ 45-60 tr/m2, Đất nền 80-120 tr/m2   │  │     │
│  │  │ - Quận 2 (Thủ Đức): Căn hộ 50-80 tr/m2               │  │     │
│  │  └────────────────────────────────────────────────────────┘  │     │
│  │  📏 850 / 50,000 ký tự                                      │     │
│  └──────────────────────────────────────────────────────────────┘     │
│                                                                         │
│  ┌─ Schedule (Lịch hoạt động) ──────────────────────────────────┐     │
│  │  Giờ hoạt động: [ 08:00 ▼] đến [ 22:00 ▼]                  │     │
│  │  Ngày hoạt động:                                             │     │
│  │  [✓] T2  [✓] T3  [✓] T4  [✓] T5  [✓] T6  [ ] T7  [ ] CN   │     │
│  │  Tần suất: [ 60 ▼] phút/lần                                 │     │
│  └──────────────────────────────────────────────────────────────┘     │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────┐     │
│  │                                      [ Hủy ]  [ 💾 Lưu ]    │     │
│  └──────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.3. Component Structure

```
BotConfigTab.tsx
├── State: selectedBotHandle, formData (prompt, knowledge, schedule, type)
├── useEffect: load bot data khi chọn handle
├── Sections:
│   ├── BotSelector (dropdown tất cả bots)
│   ├── BotInfoBar (name, handle, type dropdown, status badge)
│   ├── SystemPromptEditor (textarea, char count)
│   ├── KnowledgeTextEditor (textarea, char count)
│   ├── ScheduleConfig (time pickers, day checkboxes, interval slider)
│   └── ActionButtons (Cancel, Save)
└── onSave: PUT /api/bots with all fields
```

### 3.4. Design System Alignment

Follow exact pattern from existing admin components:
- Background: `bg-slate-800 border border-slate-700 rounded-xl`
- Labels: `text-xs font-medium text-slate-400 mb-1`
- Inputs: `bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm focus:border-teal-500`
- Primary button: `bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-500/20`
- Save button: `bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/20`

---

## 4. Data Flow

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Admin cấu hình bot
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ Admin vào tab "🧠 Bot Config"
2️⃣ Chọn bot từ dropdown (VD: analyst_bds)
3️⃣ → GET /api/bots?handle=analyst_bds
4️⃣ ← Server trả về bot data (system_prompt, knowledge_text, schedule_config)
5️⃣ Admin chỉnh sửa
6️⃣ Bấm "Lưu"
7️⃣ → PUT /api/bots { handle, system_prompt, knowledge_text, schedule_config, bot_type }
8️⃣ ← Updated bot
9️⃣ Toast "Đã lưu thành công" ✅
```

---

## 5. Seed Data: NHA.AI Bot

```sql
INSERT INTO bots (id, name, handle, bot_type, system_prompt, is_active, is_envoy)
VALUES (
  gen_random_uuid(),
  'NHA.AI',
  'nha_ai',
  'chatbot',
  'Bạn là NHA.AI - Trợ lý ảo BĐS thông minh của CẦN & CÓ.
Quy tắc:
1. Luôn vui vẻ, lịch sự, dùng emoji tự nhiên.
2. Trả lời NGẮN GỌN (tối đa 4 câu).
3. Nếu hỏi ngoài lề, lái về BĐS.
4. Chỉ bôi đậm (**) và ngắt dòng, không Markdown phức tạp.',
  true,
  false
);
```

> Prompt này lấy từ hardcode hiện tại trong `api/chat/route.ts`. Phase 06 sẽ đọc từ DB thay vì hardcode.

---

## 6. Checklist Kiểm Tra

### Database Migration
- [ ] `npx prisma migrate dev` không lỗi
- [ ] Bảng `ai_chat_messages` tồn tại
- [ ] Bảng `market_reports` tồn tại
- [ ] Cột `bot_type`, `knowledge_text`, `schedule_config` trên `bots`
- [ ] Data bots cũ nguyên vẹn

### Admin UI
- [ ] Tab "🧠 Bot Config" xuất hiện
- [ ] Dropdown hiển thị tất cả bots
- [ ] Load đúng systemPrompt, knowledgeText, scheduleConfig
- [ ] Save → Reload → data đúng
- [ ] BotType dropdown 6 options hoạt động

### NHA.AI Seed
- [ ] Bot `nha_ai` tồn tại, botType = "chatbot"

### No Regression
- [ ] Feed, Chatbot, Admin tabs cũ hoạt động bình thường

---

## 7. Test Cases (Given/When/Then)

### TC-01: Migration thành công
```
Given: Database hiện tại với schema cũ
When:  npx prisma migrate dev
Then:  ✓ Bots cũ có bot_type = "facebot" (default)
       ✓ Bảng ai_chat_messages, market_reports tạo xong
       ✓ Không mất data
```

### TC-02: Load bot config
```
Given: Admin vào tab "🧠 Bot Config"
When:  Chọn bot "analyst_bds"
Then:  ✓ Hiển thị name + handle + avatar
       ✓ System Prompt textarea có nội dung
       ✓ Schedule hiện giá trị đúng
```

### TC-03: Save bot config
```
Given: Admin edit bot "analyst_bds"
When:  Sửa System Prompt → bấm Lưu
Then:  ✓ Toast "Đã lưu thành công"
       ✓ Reload → data vẫn đúng
```

### TC-04: Backward compat
```
Given: Phase 01 đã deploy
When:  Dùng app bình thường
Then:  ✓ Feed, SwipeMatch, Referral, Chatbot đều OK
       ✓ BotHRTab edit vẫn hoạt động
```

---

## 8. Files Summary

| Action | File | Mục đích |
|--------|------|----------|
| MODIFY | `prisma/schema.prisma` | +3 fields Bot, +AIChatMessage, +MarketReport |
| MODIFY | `app/admin/page.tsx` | +Tab "🧠 Bot Config" |
| NEW | `app/admin/components/BotConfigTab.tsx` | UI chỉnh Prompt/Knowledge/Schedule |
| NO CHANGE | `api/bots/route.ts` | Đã hỗ trợ dynamic fields |
| NO CHANGE | `api/chat/route.ts` | Giữ hardcode (Phase 06 mới sửa) |
| SEED | Manual SQL hoặc script | Tạo record NHA.AI bot |
