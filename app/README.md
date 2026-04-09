# CẦN & CÓ — Mạng xã hội nhu cầu

> Đăng thứ bạn **CẦN** hoặc **CÓ**. AI tự động kết nối cung và cầu.

Mạng xã hội nơi mỗi bài đăng là một tuyên bố: "Tôi CẦN điều gì đó" hoặc "Tôi CÓ điều gì đó". AI phân loại, matching, và kết nối hai bên. Feed không tối ưu cho engagement mà tối ưu cho resolution — thời gian trên platform càng ngắn nghĩa là platform càng tốt.

**Demo:** Chạy ngay không cần Supabase hay OpenAI key.

---

## Tính năng

### Core
- **Intent Feed** — Bài đăng CẦN (đỏ) và CÓ (xanh) xen kẽ, infinite scroll
- **ComposeIntent** — Toggle CẦN/CÓ, textarea, AI parse tags realtime, upload ảnh
- **Matching Engine** — AI ghép hai chiều CẦN↔CÓ, scoring (district + price + bedrooms + trust)
- **Chat Realtime** — Supabase Realtime, optimistic send, intent context
- **Trust 3 lớp** — OCR căn cước (Tesseract.js), OCR sổ đỏ, GPS check-in (200m threshold)

### 7 AI Agents
| Agent | Vai trò |
|-------|---------|
| 🤖 Match Advisor | Thông báo kết quả matching, data-driven |
| 🏠 Nhà Advisor | Chuyên gia BĐS 15 năm, so sánh giá khu vực |
| 📊 Market Analyst | Cung/cầu ratio, xu hướng, báo cáo thị trường |
| 🛡️ Trust Checker | Khuyến khích xác thực, cảnh báo bất thường |
| 🤝 Connector | Gợi ý kết nối giữa users cùng quan tâm |
| 🎯 Concierge | Hướng dẫn người mới, mẹo đăng tin |
| 🔍 Fraud Detector | Chạy ngầm, 7 risk signals, phát hiện gian lận |

### Intelligence Layer
- **Agent Memory** — Bot nhớ user patterns ("Bạn đã tìm Q7 lần thứ 3")
- **Knowledge Graph** — 360 edges, quan hệ intent↔user↔district
- **Prediction Engine** — Thời gian match dự kiến, xác suất, gợi ý giá
- **Market Insights** — Báo cáo tự động xen kẽ trong feed
- **Transparency Score** — Điểm minh bạch 0-100, grade A+ đến F

### Social Layer
- **Profile = Trust Portfolio** — Ratings, achievements, lịch sử intents
- **Reactions** — 👍 Quan tâm, 💰 Giá hợp lý, 🔥 Hot
- **Messenger** — Split-panel, intent context, 15 conversations
- **Kết nối** — AI gợi ý kết nối dựa trên intent overlap
- **Leaderboard** — Trust-based, top 20 users
- **Analytics Dashboard** — Funnel, MCR, district breakdown

---

## Chạy nhanh (Demo mode — không cần API key)

```bash
git clone https://github.com/nclamvn/can-co.git
cd can-co
npm install
npm run dev
```

Mở **http://localhost:3000/demo** — 80 demo intents, 50 users, đầy đủ tính năng.

---

## Chạy với AI thật (Real mode)

### 1. Tạo file `.env.local`

```env
# ═══════════════════════════════════════
# SUPABASE (bắt buộc cho real mode)
# ═══════════════════════════════════════
# Tạo project miễn phí tại https://supabase.com
# Vào Settings → API để lấy URL và keys
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# ═══════════════════════════════════════
# OPENAI (tùy chọn — AI parse + embedding)
# ═══════════════════════════════════════
# Tạo API key tại https://platform.openai.com/api-keys
# Không có key: intent vẫn tạo được, chỉ thiếu AI parse
OPENAI_API_KEY=sk-proj-...
```

### 2. Setup Database

Vào **Supabase Dashboard → SQL Editor**, chạy file:

```
supabase/migrations/100_can_co_intents.sql
```

Tạo 12 tables, 21 RLS policies, Realtime, indexes.

### 3. Tạo Storage Buckets

Vào **Supabase → Storage**:
- Bucket `intent-images` (public)
- Bucket `verification-scans` (private)

### 4. Chạy

```bash
npm run dev
```

### Chi phí AI

| Model | Dùng cho | Chi phí |
|-------|----------|---------|
| gpt-4o-mini | Parse Vietnamese intent → tags | ~$0.001/intent |
| text-embedding-3-small | Semantic search (pgvector) | ~$0.0001/intent |
| **Tổng** | | **~$1 cho 1000 intents** |

Không có OpenAI key → mọi tính năng vẫn chạy, chỉ thiếu AI parse tags và semantic search.

---

## Kiến trúc

```
app/
├── demo/                  # Demo mode (mock data, no auth)
│   ├── page.tsx           # Intent Feed (homepage)
│   ├── intent/[id]/       # Intent detail + prediction
│   ├── profile/           # Trust Portfolio
│   ├── messenger/         # Chat split-panel
│   ├── friends/           # Kết nối AI
│   ├── zalo-bot/          # Zalo Bot simulator
│   └── admin/
│       ├── analytics/     # Dashboard (funnel, MCR 25%)
│       ├── crawler/       # Crawler status
│       └── integrity/     # Fraud + transparency
├── api/
│   ├── intents/           # CRUD + parse + images + comments
│   ├── matching/          # Trigger + user matches
│   ├── chat/              # Conversations + messages
│   ├── verify/            # CCCD OCR + sổ đỏ + GPS
│   ├── agents/            # Orchestrator + cron
│   └── bot/zalo/          # Zalo bot API
components/intent/         # 14 components
lib/engine/                # Core: openai, ocr, gps, matching, trust
lib/agents/                # 7 agents + orchestrator + memory + KG
lib/mock/                  # 50 users, 80 intents, full demo data
```

## Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| Frontend | Next.js 16 (App Router) + Tailwind v4 + shadcn/ui |
| Backend | Next.js API Routes |
| Database | Supabase (PostgreSQL + pgvector + Auth + Realtime + Storage) |
| AI | OpenAI gpt-4o-mini + text-embedding-3-small |
| OCR | Tesseract.js (vie+eng) + Sharp |
| Design | WorldMonitor Design System (dark) |

## Con số

```
27 TIPs shipped     | ~200 files      | ~26,000 LOC
7 AI agents         | 360 KG edges    | 12 DB tables
80 demo intents     | 50 users        | 0 TypeScript errors
```

---

## License

MIT

*CẦN & CÓ — Đăng nhu cầu. AI kết nối.*
