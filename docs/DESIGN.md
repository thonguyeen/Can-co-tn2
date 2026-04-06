# 🎨 DESIGN: Bot Môi Giới Địa Phương (Local Envoy Bots)

Ngày tạo: 02/04/2026
Dựa trên: [BRIEF.md](file:///d:/SW/Can-co-tn/docs/BRIEF.md) + Plan đã duyệt

---

## 1. Database Schema (Cách Lưu Thông Tin)

### 1.1 Bảng `bots` — MỞ RỘNG (thêm cột)

```sql
-- Thêm cột "Hộ khẩu + Nghề" cho Bot
ALTER TABLE bots
  ADD COLUMN IF NOT EXISTS assigned_province TEXT,
  ADD COLUMN IF NOT EXISTS assigned_district TEXT,
  ADD COLUMN IF NOT EXISTS assigned_ward TEXT,
  ADD COLUMN IF NOT EXISTS assigned_province_code TEXT,
  ADD COLUMN IF NOT EXISTS assigned_district_code TEXT,
  ADD COLUMN IF NOT EXISTS assigned_ward_code TEXT,
  ADD COLUMN IF NOT EXISTS assigned_categories TEXT[] DEFAULT '{real_estate}',
  ADD COLUMN IF NOT EXISTS daily_quota INT DEFAULT 10,
  ADD COLUMN IF NOT EXISTS posts_today INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_envoy BOOLEAN DEFAULT FALSE;

-- Constraint quota: 5 tối thiểu, 100 tối đa
ALTER TABLE bots ADD CONSTRAINT chk_daily_quota
  CHECK (daily_quota >= 5 AND daily_quota <= 100);

CREATE INDEX IF NOT EXISTS idx_bots_envoy ON bots(is_envoy) WHERE is_envoy = true;
```

### 1.2 Bảng `intents` — MỞ RỘNG (thêm cột Bot)

```sql
-- Cho phép Bot đăng bài lên Feed
ALTER TABLE intents
  ADD COLUMN IF NOT EXISTS is_bot BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS bot_handle TEXT,
  ADD COLUMN IF NOT EXISTS source_url TEXT;

-- Cho phép user_id NULL khi bài của Bot
ALTER TABLE intents ALTER COLUMN user_id DROP NOT NULL;

-- Thêm check: Nếu is_bot = true thì phải có bot_handle
ALTER TABLE intents ADD CONSTRAINT chk_bot_intent
  CHECK (
    (is_bot = FALSE AND user_id IS NOT NULL)
    OR (is_bot = TRUE AND bot_handle IS NOT NULL)
  );

CREATE INDEX IF NOT EXISTS idx_intents_bot ON intents(is_bot) WHERE is_bot = true;
CREATE INDEX IF NOT EXISTS idx_intents_bot_handle ON intents(bot_handle);
```

### 1.3 Bảng `crawl_sources` — MỚI HOÀN TOÀN

```sql
CREATE TABLE IF NOT EXISTS crawl_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'rss'
    CHECK (source_type IN ('rss', 'html', 'api')),
  category TEXT NOT NULL DEFAULT 'real_estate',
  province TEXT,
  district TEXT,
  is_active BOOLEAN DEFAULT true,
  last_crawled_at TIMESTAMPTZ,
  crawl_interval_minutes INT DEFAULT 60,
  total_items_crawled INT DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Chỉ service role mới được thao tác
ALTER TABLE crawl_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON crawl_sources
  FOR ALL USING (true);

CREATE INDEX IF NOT EXISTS idx_crawl_sources_active
  ON crawl_sources(is_active) WHERE is_active = true;
```

### 1.4 RLS Policy Updates

```sql
-- Mở rộng policy đọc intents: Bài bot cũng được hiện
DROP POLICY IF EXISTS "Active intents readable by all" ON intents;
CREATE POLICY "Active intents readable by all" ON intents
  FOR SELECT USING (
    status = 'active'
    OR user_id = auth.uid()
    OR is_bot = true
  );

-- Cho phép Service Role insert bài bot
CREATE POLICY "Service role insert bot intents" ON intents
  FOR INSERT WITH CHECK (
    auth.uid() = user_id  -- Bài user thường
    OR is_bot = true       -- Bài bot (service role)
  );
```

---

## 2. API Endpoints (Cửa giao tiếp)

### 2.1 Bot Management API — `/api/bots`

| Method | Path | Mục đích | Body/Params |
|--------|------|----------|-------------|
| GET | `/api/bots?envoy=true` | Lấy DS Bot Envoy | `?envoy=true` |
| PUT | `/api/bots` | Cập nhật Bot (khu vực, quota) | `{ handle, assigned_province, assigned_district, assigned_ward, ..._code, daily_quota }` |
| POST | `/api/bots` | Tạo Bot Envoy mới | `{ name, handle, category, province, district }` |

### 2.2 Crawl Sources API — `/api/crawl-sources`

| Method | Path | Mục đích | Body/Params |
|--------|------|----------|-------------|
| GET | `/api/crawl-sources` | Lấy DS nguồn cào | — |
| POST | `/api/crawl-sources` | Thêm nguồn mới | `{ name, url, source_type, category, province, district }` |
| PUT | `/api/crawl-sources` | Sửa nguồn | `{ id, ...fields }` |
| DELETE | `/api/crawl-sources` | Xóa nguồn | `{ id }` |
| POST | `/api/crawl-sources/trigger` | Trigger cào ngay | `{ source_id? }` (null = cào tất cả) |

### 2.3 Intents API — `/api/intents` (Sửa GET)

Khi trả về intent có `is_bot = true`:
```json
{
  "id": "...",
  "type": "CO",
  "title": "Bán căn hộ 2PN Quận 1...",
  "is_bot": true,
  "bot_handle": "thang_realestate_1",
  "source_url": "https://...",
  "user": {
    "id": null,
    "name": "Thắng Expert [AI]",
    "avatar_url": "/avatars/bot_real_estate.jpg",
    "is_bot": true
  }
}
```

---

## 3. Danh Sách Màn Hình Admin

### 3.1 Tab "👨‍💼 Nhân Sự Bot"

```
┌─────────────────────────────────────────────────────────────┐
│  [👨‍💼 Nhân Sự Bot]  [🌐 Nguồn Cào]                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [+ Tạo Bot Mới]                    Tổng: 15 Bot Envoy     │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ 🟢       │  │ 🟢       │  │ 🔴       │  │ 🟢       │   │
│  │ Avatar   │  │ Avatar   │  │ Avatar   │  │ Avatar   │   │
│  │ Thắng    │  │ Lan AI   │  │ Mai Pro  │  │ Hùng     │   │
│  │ Expert   │  │          │  │          │  │ Scout    │   │
│  │          │  │          │  │          │  │          │   │
│  │📍Q.1 HCM │  │📍Cầu Giấy│  │📍Nghỉ    │  │📍Q.7 HCM │   │
│  │🏠 BĐS   │  │🏠 BĐS   │  │—         │  │🏠 BĐS   │   │
│  │          │  │          │  │          │  │          │   │
│  │▓▓▓▓░░░░ │  │▓▓▓▓▓▓░░ │  │░░░░░░░░ │  │▓▓░░░░░░ │   │
│  │ 4/10     │  │ 7/10     │  │ 0/5      │  │ 2/15     │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Modal "Hồ Sơ Nhân Viên" (Click vào card)

```
┌─────────────────────────────────────────────────────────────┐
│  ✕                    HỒ SƠ NHÂN VIÊN                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Avatar]  Thắng Expert (@thang_realestate_1)               │
│            🟢 Đang hoạt động                                │
│                                                             │
│  ── KHU VỰC PHỤ TRÁCH ──────────────────────────           │
│                                                             │
│  Tỉnh/TP:  [ Thành phố Hồ Chí Minh      ▼ ]               │
│  Quận/H:   [ Quận 1                       ▼ ]               │
│  Phường/X: [ Phường Bến Nghé             ▼ ]               │
│                                                             │
│  ── CHUYÊN MỤC ─────────────────────────────                │
│                                                             │
│  [✓] Bất Động Sản                                           │
│  [ ] Tuyển Dụng (Sắp ra mắt)                               │
│  [ ] Xe Cộ (Sắp ra mắt)                                    │
│                                                             │
│  ── CHỈ TIÊU NGÀY ──────────────────────────                │
│                                                             │
│  5 ────●──────────────────────────────── 100                │
│              Quota: 10 bài/ngày                             │
│                                                             │
│  ── THỐNG KÊ ────────────────────────────                   │
│                                                             │
│  📊 Tổng bài đã đăng: 142                                   │
│  📅 Hôm nay: 4/10                                           │
│  📈 Tin được tương tác nhiều nhất: 23 views                  │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ 💾 Lưu   │  │ ⏸ Dừng   │  │ 🗑 Xóa   │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Tab "🌐 Nguồn Cào"

```
┌─────────────────────────────────────────────────────────────┐
│  [👨‍💼 Nhân Sự Bot]  [🌐 Nguồn Cào]                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [+ Thêm Nguồn]                  [🔄 Cào Tất Cả Ngay]     │
│                                                             │
│  ┌───┬──────────┬─────────────────────┬──────┬──────┬────┐ │
│  │ # │ Tên      │ URL                 │ Loại │ Vùng │ ⚡ │ │
│  ├───┼──────────┼─────────────────────┼──────┼──────┼────┤ │
│  │ 1 │ VnEx BĐS │ vnexpress.net/rss/b │ RSS  │ HCM  │ 🟢│ │
│  │ 2 │ Chợ Tốt  │ chotot.com/bat-dong │ HTML │ HN   │ 🟢│ │
│  │ 3 │ BDS.com  │ batdongsan.com.vn/r │ RSS  │ ALL  │ 🔴│ │
│  └───┴──────────┴─────────────────────┴──────┴──────┴────┘ │
│                                                             │
│  Nhấp vào dòng để sửa | Kéo để sắp xếp                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Luồng Hoạt Động

### 4.1 Admin gán khu vực cho Bot

```
1️⃣ Admin mở tab "Nhân Sự Bot"
2️⃣ Click vào card Bot "Thắng Expert"
3️⃣ Modal mở ra → Chọn Tỉnh: "TP HCM"
4️⃣ Dropdown Quận tự lọc → Chọn "Quận 1"
5️⃣ Dropdown Phường tự lọc → Chọn "Phường Bến Nghé"
6️⃣ Kéo slider quota → 15 bài/ngày
7️⃣ Bấm 💾 Lưu → Toast "Đã cập nhật!"
8️⃣ Card cập nhật hiện "📍 Q.1, HCM"
```

### 4.2 Admin thêm nguồn cào

```
1️⃣ Admin mở tab "Nguồn Cào"
2️⃣ Bấm "+ Thêm Nguồn"
3️⃣ Form mở: Nhập tên, paste URL, chọn loại RSS/HTML
4️⃣ Chọn Tỉnh/Quận (tùy chọn - để lọc vùng)
5️⃣ Bấm Lưu → Dòng mới xuất hiện trong bảng
6️⃣ Bấm "🔄 Cào Ngay" → Hệ thống cào URL này ngay
```

### 4.3 Bot tự đăng bài lên Feed

```
1️⃣ Orchestrator kích hoạt (tự động hoặc admin bấm)
2️⃣ Crawler đọc bảng crawl_sources → Lấy danh sách URL active
3️⃣ Crawler cào tin từ từng URL
4️⃣ Với mỗi tin cào được:
   a. Check dedup (source_url đã tồn tại chưa?)
   b. Tìm Bot phù hợp (trùng khu vực)
   c. Check quota Bot (posts_today < daily_quota?)
   d. AI parse: raw → {title, type, price, district, ward}
   e. Strip <think> tags
   f. Insert vào bảng intents (is_bot=true, bot_handle=...)
   g. Tăng posts_today của Bot
5️⃣ Supabase Realtime bắn event → Feed trang chủ tự cập nhật
```

---

## 5. Cấu trúc File Địa Chính (vietnam-locations.ts)

**Nguồn:** `ref/carCRM_Danh-muc-Phuong-xa_2025.xlsx`

```typescript
// Được generate từ script convert-locations.js
export interface Ward {
  name: string;    // "Phường Hoàn Kiếm"
  code: string;    // "10105001"
}

export interface District {
  name: string;    // "Quận Hoàn Kiếm"
  code: string;    // "10105"
  wards: Ward[];
}

export interface Province {
  name: string;    // "Thành phố Hà Nội"
  code: string;    // "01"
  districts: District[];
}

export const VIETNAM_LOCATIONS: Province[] = [
  {
    name: "Thành phố Hà Nội",
    code: "01",
    districts: [
      {
        name: "Quận Hoàn Kiếm",
        code: "10105",
        wards: [
          { name: "Phường Hoàn Kiếm", code: "10105001" },
          { name: "Phường Cửa Nam", code: "10105002" },
          // ...
        ]
      },
      // ...~30 quận/huyện
    ]
  },
  // ...63 tỉnh/thành
];
```

---

## 6. Component Structure (Mảnh ghép giao diện)

```
app/admin/page.tsx
├── <AdminTabs>
│   ├── Tab 1: <BotStaffGrid>
│   │   ├── <BotCard> × N          (Grid card nhân viên)
│   │   └── <BotProfileModal>     (Modal sửa hồ sơ)
│   │       ├── <LocationDropdown>  (3-cấp Tỉnh/Quận/Phường)
│   │       ├── <CategoryCheckbox>  (Chuyên mục)
│   │       └── <QuotaSlider>       (5-100)
│   │
│   └── Tab 2: <CrawlSourcesTable>
│       ├── <SourceRow> × N        (Dòng trong bảng)
│       └── <AddSourceForm>        (Form thêm nguồn)
```

---

## 7. Checklist Kiểm Tra

### ✅ TC-01: Gán khu vực cho Bot
- [ ] Chọn Tỉnh → Quận tự lọc đúng
- [ ] Chọn Quận → Phường tự lọc đúng
- [ ] Lưu → DB cập nhật đúng cột
- [ ] Card hiện khu vực mới

### ✅ TC-02: Quota hoạt động đúng
- [ ] Set quota = 5 → Bot chỉ đăng 5 bài/ngày
- [ ] Bot đạt quota → Tự dừng, log cảnh báo
- [ ] Slider không cho kéo dưới 5 hoặc trên 100

### ✅ TC-03: Thêm nguồn cào
- [ ] Nhập URL + tên → Lưu thành công
- [ ] Bấm "Cào Ngay" → Crawler chạy, trả kết quả
- [ ] URL trùng → Cảnh báo

### ✅ TC-04: Bài Bot lên Feed
- [ ] Bot đăng bài → Hiện trên trang chủ
- [ ] Badge "🤖 Bot" hiện rõ
- [ ] Tên Bot hiện kèm "[AI]"
- [ ] source_url link về bài gốc

### ✅ TC-05: Dedup
- [ ] Cào cùng URL 2 lần → Chỉ tạo 1 intent

### ✅ TC-06: Dropdown 3 cấp
- [ ] Load đủ 63 tỉnh/thành
- [ ] Chọn "TP HCM" → ~20 quận/huyện
- [ ] Chọn "Quận 1" → ~10 phường

---

## 8. Bot Optimization & Automation Design (Phase 2)

### 8.1. API mở rộng
- `GET /api/orchestrator`: Thêm query parameters: `bot_handle` (string) và `status` (string). Khi trả về, lọc JSON dựa trên params này.
- `GET /api/cron/crawler`: Endpoint trigger crawler tự động mỗi khoảng thời gian. Xác thực qua Header: `Bearer <CRON_SECRET>`.

### 8.2. Auto-Healing & Validation
- **AI Validation**: Tại `lib/ai/client.ts`, sử dụng cơ chế bắt lỗi `try { JSON.parse(text) } catch { retry }`.
- **Logic Retry**: Thử lại tối đa 2 lần. Nếu gặp lỗi, gửi lại raw text kèm thông báo ép LLM trả định dạng JSON hợp lệ. Báo lưu error details vào Activity Log nếu fail hoàn toàn.

### 8.3. UI Mới cho Activity Log Filter
- **Vị trí**: Bên trên lưới danh sách `ActivityFeed` ở `<BotOperationsTab>`.
- **Controls**:
  1. Combo-box lọc theo `bot_handle` từ những options load ở DB.
  2. Combo-box chọn `status` (VD: 'success', 'failed', 'resting', 'all').

---

*Tạo bởi AWF 2.1 - Design Phase*
