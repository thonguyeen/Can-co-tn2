# 🎨 DESIGN: Phase 05 — Analyst Bot (Báo Cáo Thị Trường Tự Động)

Ngày tạo: 2026-04-12
Dựa trên: [phase-05-analyst.md](./phase-05-analyst.md)

---

## 1. Cách Lưu Thông Tin (Database)

### 1.1. Model đã có sẵn: `MarketReport`

```
┌─────────────────────────────────────────────────────────────┐
│  📊 MARKET REPORT (Báo cáo thị trường)                     │
│  ├── id          (UUID tự tạo)                              │
│  ├── botHandle   (bot nào viết: "analyst_bds")              │
│  ├── category    (loại BĐS: "real_estate")                 │
│  ├── region      (khu vực: "Quận 1" hoặc null = toàn TP)   │
│  ├── period      ("daily" | "weekly" | "monthly")           │
│  ├── title       (tiêu đề báo cáo)                         │
│  ├── content     (nội dung Markdown do LLM viết)            │
│  ├── stats       (JSON: số liệu aggregate từ DB)           │
│  └── createdAt   (thời điểm tạo)                           │
└─────────────────────────────────────────────────────────────┘
```

**Bảng `market_reports` đã tồn tại trong schema.prisma (line 848-861).**
→ KHÔNG cần migration. Chỉ cần code logic.

### 1.2. Model liên quan: `Intent` (Nguồn dữ liệu)

Analyst Bot sẽ query bảng `intents` để lấy số liệu thật:

```
┌─────────────────────────────────────────────────────────────┐
│  📝 INTENT (Tin đăng CẦN & CÓ)                             │
│  ├── type        ("CAN" | "CO")                             │
│  ├── category    ("real_estate")                             │
│  ├── subcategory ("apartment" | "house" | "land" | ...)     │
│  ├── price       (BigInt, giá chính xác)                    │
│  ├── priceMin    (BigInt, giá tối thiểu)                    │
│  ├── priceMax    (BigInt, giá tối đa)                       │
│  ├── district    (quận/huyện)                               │
│  ├── city        (tỉnh/thành phố)                           │
│  ├── status      ("active")                                 │
│  └── createdAt   (thời điểm đăng)                           │
└─────────────────────────────────────────────────────────────┘
```

### 1.3. Model liên quan: `Bot` (Cấu hình Analyst Bot)

```
┌─────────────────────────────────────────────────────────────┐
│  🤖 BOT (ai nào viết report)                               │
│  ├── handle         ("analyst_bds")                         │
│  ├── botType        ("analyst")                             │
│  ├── knowledgeText  (Admin-editable report template)        │
│  └── scheduleConfig (JSON: khi nào chạy tự động)           │
│      {                                                      │
│        "autoReportAt": ["08:00"],                           │
│        "autoReportDays": [1,2,3,4,5]  // Thứ 2-6           │
│      }                                                      │
└─────────────────────────────────────────────────────────────┘
```

### 1.4. Sơ đồ quan hệ

```
  Bot (analyst_bds)
       │
       │ scheduleConfig → Orchestrator check lịch
       │ knowledgeText → LLM prompt template
       │
       ▼
  AnalystBot.generateDailyReport()
       │
       │ SQL Aggregate queries
       ▼
  Intent ──(GROUP BY district, type)──► stats JSON
       │
       │ stats + knowledgeText → LLM
       ▼
  MarketReport (lưu cả stats + content)
       │
       │ FACEBOTs auto-comment (Phase 04 pipeline)
       ▼
  IntentComment (optional: các bot khác bàn luận)
```

---

## 2. Luồng Hoạt Động (Data Flow)

### 2.1. Luồng chính: Tạo Báo Cáo Hàng Ngày

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 HÀNH TRÌNH: Analyst Bot tạo báo cáo tự động
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ [Orchestrator] Timer tick mỗi 15 phút
   └─ Kiểm tra: Đúng 08:00 AM? Đúng activeDay? Chưa chạy hôm nay?

2️⃣ [Orchestrator] Nếu đủ điều kiện → gọi analystBot.generateDailyReport()

3️⃣ [AnalystBot] Query DB: Aggregate Intent data 24h qua
   ├─ SELECT COUNT(*), type FROM intents WHERE createdAt > 24h GROUP BY type
   ├─ SELECT AVG(price), district FROM intents WHERE type='CO' GROUP BY district
   ├─ SELECT subcategory, COUNT(*) FROM intents GROUP BY subcategory
   └─ So sánh với 48h trước (trend: tăng hay giảm?)

4️⃣ [AnalystBot] Build statsJSON:
   {
     "totalListings": 45,
     "canCount": 20,
     "coCount": 25,
     "avgPrice": 4500000000,
     "priceByDistrict": { "Quận 1": 8000000000, "Quận 7": 3500000000 },
     "topDistricts": ["Quận 1", "Bình Thạnh", "Quận 7"],
     "subcategoryBreakdown": { "apartment": 18, "house": 12, "land": 8, "room": 7 },
     "newVsYesterday": "+12%",
     "dataRange": "2026-04-11 08:00 → 2026-04-12 08:00",
     "sourcesCount": 5
   }

5️⃣ [AnalystBot] Inject stats + knowledgeText vào LLM prompt
   └─ System: "Bạn là bot phân tích. KHÔNG bịa. CHỈ tổng hợp data."
   └─ User: "Đây là số liệu thật: {statsJSON}. Viết báo cáo markdown."

6️⃣ [LLM] Trả về báo cáo markdown (~300-500 ký tự)

7️⃣ [AnalystBot] Lưu vào MarketReport:
   └─ { botHandle, category, region, period: "daily", title, content, stats }

8️⃣ [Orchestrator] (Optional) Trigger IntentComment:
   └─ Các FACEBOT khác nhận được report mới → comment bàn luận
```

### 2.2. Luồng phụ: Admin trigger thủ công

```
Admin → Dashboard → Bấm "📊 Tạo báo cáo ngay"
  └─ POST /api/orchestrator { action: "trigger_analyst_report", period: "daily" }
     └─ analystBot.generateDailyReport()
     └─ Trả về report ID ngay lập tức
```

---

## 3. Thiết Kế Kỹ Thuật Chi Tiết

### 3.1. File mới: `app/lib/openclaw/analyst-bot.ts`

```typescript
// ═══════════════════════════════════════════════════════════════
// ANALYST BOT — Market Report Generator (Phase 05)
//
// Nhiệm vụ: Query Intents thật → Aggregate stats → LLM viết báo cáo
// KHÔNG bịa số liệu. KHÔNG tự tạo data. CHỈ tổng hợp.
//
// Patterns follow CuratorBot (Phase 03):
//   - isRunning lock guard
//   - Config cache module-level
//   - chatWithJSON from lib/ai/client
// ═══════════════════════════════════════════════════════════════

export class AnalystBot {
  private isRunning = false;  // Lock guard (same as CuratorBot C2)
  private config: AnalystBotConfig | null = null;
  private lastDailyRun: string | null = null; // "2026-04-12" format

  // ── METHOD 1: generateDailyReport ──
  async generateDailyReport(
    category?: string,  // default: "real_estate"
    region?: string,    // default: null (toàn TP)
  ): Promise<MarketReportResult>

  // ── METHOD 2: generateWeeklyReport ──
  async generateWeeklyReport(
    category?: string,
    region?: string,
  ): Promise<MarketReportResult>

  // ── METHOD 3: aggregateStats (PRIVATE) ──
  private async aggregateStats(
    category: string,
    region: string | null,
    hoursBack: number,  // 24 = daily, 168 = weekly
  ): Promise<MarketStats>

  // ── METHOD 4: buildPrompt (PRIVATE) ──
  private buildPrompt(
    stats: MarketStats,
    knowledgeText: string,
    period: 'daily' | 'weekly',
  ): { systemPrompt: string; userPrompt: string }

  // ── METHOD 5: shouldRunToday ──
  shouldRunToday(): boolean
  // Check: lastDailyRun !== today's date
}
```

### 3.2. Interface: MarketStats (dữ liệu aggregate)

```typescript
interface MarketStats {
  dataRange: { from: Date; to: Date };
  totalListings: number;
  canCount: number;        // Số tin CẦN
  coCount: number;         // Số tin CÓ
  avgPrice: number | null; // Giá trung bình (chỉ tin CÓ có price)
  medianPrice: number | null;
  priceByDistrict: Record<string, { avg: number; count: number }>;
  topDistricts: string[];  // Top 5 quận có nhiều tin nhất
  subcategoryBreakdown: Record<string, number>;  // apartment: 18, house: 12...
  newVsYesterday: number;  // % thay đổi so với kỳ trước
  sourcesCount: number;    // Số nguồn crawl đã dùng
}
```

### 3.3. SQL Queries (Prisma aggregate)

```typescript
// Query 1: Tổng quan
const overview = await prisma.intent.groupBy({
  by: ['type'],
  where: {
    category,
    status: 'active',
    createdAt: { gte: cutoffDate },
    ...(region ? { city: region } : {}),
  },
  _count: true,
});

// Query 2: Giá theo quận (chỉ tin CÓ có price)
const priceByDistrict = await prisma.intent.groupBy({
  by: ['district'],
  where: {
    type: 'CO',
    category,
    status: 'active',
    price: { not: null },
    createdAt: { gte: cutoffDate },
  },
  _avg: { price: true },
  _count: true,
  orderBy: { _count: { _all: 'desc' } },
  take: 10,
});

// Query 3: Phân loại BĐS
const subcategoryBreakdown = await prisma.intent.groupBy({
  by: ['subcategory'],
  where: {
    category,
    status: 'active',
    createdAt: { gte: cutoffDate },
  },
  _count: true,
});

// Query 4: So sánh kỳ trước (% thay đổi)
const previousCount = await prisma.intent.count({
  where: {
    category,
    status: 'active',
    createdAt: { gte: previousCutoff, lt: cutoffDate },
  },
});
```

> ⚠️ **Lưu ý:** `price` trong Intent model là `BigInt`. Prisma `_avg` trên BigInt sẽ trả ra `Decimal`. Cần convert sang `Number` khi build stats JSON.

### 3.4. LLM Prompt Design (STRICT — No Hallucination)

```
SYSTEM PROMPT:
─────────────
Bạn là bot phân tích thị trường bất động sản. 
Nhiệm vụ: Viết báo cáo từ SỐ LIỆU THẬT được cung cấp dưới đây.
KHÔNG bịa số liệu. KHÔNG đoán. Chỉ tổng hợp và nhận xét dựa trên data.

Quy tắc bắt buộc:
1. Mọi con số PHẢI lấy từ JSON data bên dưới
2. Nếu data thiếu → ghi "Chưa đủ dữ liệu" 
3. Nhận xét xu hướng chỉ khi có so sánh kỳ trước
4. Format: Markdown, có heading, bullet points, số liệu bold

{knowledgeText từ Bot.knowledgeText — nếu Admin đã cấu hình}

USER PROMPT:
─────────────
## Dữ liệu thị trường BĐS ({period})
Khoảng thời gian: {dataRange.from} → {dataRange.to}

{JSON.stringify(stats, null, 2)}

Hãy viết BÁO CÁO THỊ TRƯỜNG {period} dựa HOÀN TOÀN trên dữ liệu trên.
Bao gồm: Tổng quan, Chi tiết theo quận, Phân tích xu hướng (nếu có data so sánh).
Kết thúc bằng dòng: "📌 Nguồn: Dựa trên {totalListings} tin đăng trong {period}."
```

### 3.5. Orchestrator Integration

Trong `orchestrator.ts`, thêm:

```typescript
// ── Trong OrchestratorConfig ──
enableAnalystReports: boolean;  // default: true
analystInterval: number;        // 15 * 60 * 1000 (15 phút check 1 lần)

// ── Trong start() ──
if (this.config.enableAnalystReports) {
  this.startAnalystLoop();
}

// ── Timer mới ──
private analystTimer: NodeJS.Timeout | null = null;

private startAnalystLoop(): void {
  this.analystTimer = setInterval(async () => {
    if (!this.isRunning) return;
    await this.checkAndTriggerAnalystReport();
  }, this.config.analystInterval);
}

private async checkAndTriggerAnalystReport(): Promise<void> {
  // 1. Load analyst bot config from DB
  // 2. Check scheduleConfig.autoReportAt vs current time (±5 min window)
  // 3. Check scheduleConfig.autoReportDays vs current day
  // 4. Check: chưa chạy hôm nay?
  // 5. If all pass → analystBot.generateDailyReport()
  // 6. On Monday → also generateWeeklyReport()
}
```

### 3.6. API Endpoint

Trong `route.ts`, thêm action:

```typescript
case 'trigger_analyst_report': {
  const { period = 'daily', category, region } = params;
  const { getAnalystBot } = await import('@/lib/openclaw/analyst-bot');
  const bot = getAnalystBot();
  const result = period === 'weekly'
    ? await bot.generateWeeklyReport(category, region)
    : await bot.generateDailyReport(category, region);
  return NextResponse.json({ success: true, data: result });
}
```

### 3.7. Seed Data

```typescript
// Trong seed.ts — thêm sau phần tạo Bots
const analystBot = await prisma.bot.create({
  data: {
    name: 'Nhà Phân Tích BĐS',
    handle: 'analyst_bds',
    bio: 'Bot báo cáo thị trường — Chỉ dùng số liệu thật, không bịa.',
    botType: 'analyst',
    expertise: ['market_analysis', 'price_tracking', 'trend_reporting'],
    personality: 'data-driven, objective',
    systemPrompt: `Bạn là bot phân tích thị trường...`, // full prompt ở 3.4
    knowledgeText: null,  // Admin cấu hình sau
    scheduleConfig: {
      autoReportAt: ["08:00"],
      autoReportDays: [1, 2, 3, 4, 5]
    },
    isActive: true,
    isEnvoy: false,
  }
});
```

---

## 4. Checklist Kiểm Tra

### Tính năng: Analyst Bot Daily Report

✅ Cơ bản:
- [ ] Có ≥20 Intents active trong DB → chạy AnalystBot → tạo 1 MarketReport
- [ ] MarketReport.stats chứa số liệu aggregate thật (avgPrice, totalListings)
- [ ] MarketReport.content là markdown đọc được
- [ ] Content KHÔNG chứa số liệu mà stats JSON không có
- [ ] Report có dẫn nguồn: "Dựa trên X tin đăng trong 24h qua"

✅ Schedule:
- [ ] Orchestrator chỉ trigger khi đúng giờ + đúng ngày (theo scheduleConfig)
- [ ] Không duplicate report — chỉ 1 report/ngày cho mỗi category+region
- [ ] Admin trigger thủ công luôn hoạt động bất kể schedule

✅ Edge cases:
- [ ] Nếu 0 Intent trong 24h → report ghi "Chưa có dữ liệu mới" (không crash)
- [ ] Nếu LLM fail → log error, không tạo report rác
- [ ] BigInt price convert sang Number đúng (không bị NaN)
- [ ] Report Weekly (thứ Hai) → có so sánh tuần trước

---

## 5. Test Cases

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TC-01: Happy Path — Daily Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Given: DB có ≥20 Intents active, có price, có district
When:  Gọi analystBot.generateDailyReport()
Then:  ✓ MarketReport được tạo trong DB
       ✓ stats.totalListings === actual count
       ✓ content chứa "Nguồn: Dựa trên X tin đăng"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TC-02: Empty Data — Không có Intent nào
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Given: DB không có Intent nào trong 24h qua
When:  Gọi analystBot.generateDailyReport()
Then:  ✓ Trả về result.skipped = true
       ✓ Không tạo MarketReport
       ✓ Không gọi LLM (tiết kiệm token)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TC-03: Schedule Check — Đúng giờ thì chạy
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Given: scheduleConfig = { autoReportAt: ["08:00"], autoReportDays: [1,2,3,4,5] }
When:  Current time = 08:02, Wednesday
Then:  ✓ shouldRunToday() === true

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TC-04: Schedule Check — Sai giờ thì bỏ qua
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Given: scheduleConfig = { autoReportAt: ["08:00"], autoReportDays: [1,2,3,4,5] }
When:  Current time = 14:00, Wednesday
Then:  ✓ shouldRunToday() === false (ngoài cửa sổ 08:00 ±5 min)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TC-05: BigInt Price Handling
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Given: Intents có price = 4500000000 (BigInt)
When:  aggregateStats() chạy
Then:  ✓ stats.avgPrice là Number (không phải BigInt)
       ✓ Không bị NaN hoặc undefined

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TC-06: Duplicate Prevention
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Given: Daily report đã chạy lúc 08:00
When:  Orchestrator check lại lúc 08:15
Then:  ✓ lastDailyRun === today → Bỏ qua, không chạy lại
```

---

## 6. Files Tổng Kết

| Action | File | Mô tả |
|--------|------|-------|
| **CREATE** | `app/lib/openclaw/analyst-bot.ts` | Module chính — AnalystBot class |
| **MODIFY** | `app/lib/openclaw/orchestrator.ts` | Thêm `startAnalystLoop()` + `checkAndTriggerAnalystReport()` |
| **MODIFY** | `app/app/api/orchestrator/route.ts` | Thêm action `trigger_analyst_report` |
| **MODIFY** | `app/prisma/seed.ts` | Seed bot `analyst_bds` |
| **MODIFY** | `app/app/admin/components/BotDashboardTab.tsx` | Hiển thị recent MarketReports |

---

*Tạo bởi AWF 4.0.2 - Design Phase*
