# Phase 03: API & Data Access Rewrite
Status: ⬜ Pending
Dependencies: Phase 02 (✅ Done)
Design: `docs/DESIGN_PHASE03_API_REWRITE.md`

## Objective
1. Bổ sung 14 models thiếu/mở rộng vào `schema.prisma`
2. Thay thế TOÀN BỘ `supabase.from()` → `prisma.*` trong ~68 files
3. Đảm bảo response JSON giữ nguyên cấu trúc để không gãy UI

---

## 📊 Tổng Quan

| Hạng mục | Số lượng |
|----------|----------|
| Models mới cần tạo | 12 |
| Models phụ bổ sung | 2 |
| Models cũ cần mở rộng cột | 2 |
| API routes cần migrate | 39 |
| Lib services cần migrate | 27 |
| Pages cần migrate | 2 |
| **Tổng files** | **~68** |

---

## 🔧 Step 0: Schema Update — BLOCKER (phải làm trước!)

### 0A. Thêm 12 Models MỚI vào `schema.prisma`

| # | Model | Table SQL | Migration gốc | Vai trò |
|---|-------|-----------|---------------|---------|
| 1 | `Intent` | `intents` | `100_can_co_intents.sql` + `200_bot_envoy.sql` | ⭐ Core BĐS — CẦN/CÓ |
| 2 | `IntentImage` | `intent_images` | `100_can_co_intents.sql` | Ảnh đính kèm intent |
| 3 | `IntentComment` | `intent_comments` | `100_can_co_intents.sql` | Comment bot + user trên intent |
| 4 | `IntentEmbedding` | `intent_embeddings` | `100_can_co_intents.sql` | AI vector matching |
| 5 | `Match` | `matches` | `100_can_co_intents.sql` | Ghép cặp CẦN ↔ CÓ |
| 6 | `Verification` | `verifications` | `100_can_co_intents.sql` | Xác minh GPS/CCCD/Sổ đỏ |
| 7 | `Conversation` | `conversations` | `100_can_co_intents.sql` | Chat trực tiếp |
| 8 | `Message` | `messages` | `100_can_co_intents.sql` | Tin nhắn |
| 9 | `ContentViolation` | `content_violations` | `012_content_moderation.sql` | Vi phạm nội dung |
| 10 | `AgentMemory` | `agent_memory` | `100_can_co_intents.sql` | Bộ nhớ bot AI |
| 11 | `KnowledgeEdge` | `knowledge_edges` | `100_can_co_intents.sql` | Đồ thị tri thức |
| 12 | `AgentActivity` | `agent_activity` | `100_can_co_intents.sql` | Log hoạt động bot |

### 0B. Thêm 2 Models PHỤ

| # | Model | Table SQL | Migration gốc | Vai trò |
|---|-------|-----------|---------------|---------|
| 13 | `CrawlSource` | `crawl_sources` | `200_bot_envoy.sql` | Admin quản lý nguồn cào tin |
| 14 | `ActivityLog` | `activity_logs` | `20260131_activity_logs.sql` | Log hoạt động bot orchestration |

### 0C. Mở rộng 2 Models CŨ — Thêm cột

#### Profile (thêm 7 cột)
| Cột | Type | Migration gốc |
|-----|------|---------------|
| `violationCount` | Int @default(0) | `012_content_moderation.sql` |
| `isBanned` | Boolean @default(false) | `012_content_moderation.sql` |
| `bannedAt` | DateTime? | `012_content_moderation.sql` |
| `banReason` | String? | `012_content_moderation.sql` |
| `verificationLevel` | String @default("none") | `100_can_co_intents.sql` |
| `trustScore` | Int @default(1) | `100_can_co_intents.sql` |
| `phone` | String? | `100_can_co_intents.sql` |

#### Bot (thêm 10 cột)
| Cột | Type | Migration gốc |
|-----|------|---------------|
| `assignedProvince` | String? | `200_bot_envoy.sql` |
| `assignedDistrict` | String? | `200_bot_envoy.sql` |
| `assignedWard` | String? | `200_bot_envoy.sql` |
| `assignedProvinceCode` | String? | `200_bot_envoy.sql` |
| `assignedDistrictCode` | String? | `200_bot_envoy.sql` |
| `assignedWardCode` | String? | `200_bot_envoy.sql` |
| `assignedCategories` | String[] | `200_bot_envoy.sql` |
| `dailyQuota` | Int @default(10) | `200_bot_envoy.sql` |
| `postsToday` | Int @default(0) | `200_bot_envoy.sql` |
| `isEnvoy` | Boolean @default(false) | `200_bot_envoy.sql` |
| `commentsCount` | Int @default(0) | `20260131_activity_logs.sql` |
| `debatesCount` | Int @default(0) | `20260131_activity_logs.sql` |

### 0D. RPC Functions → Prisma Native

| SQL Function | Prisma thay thế |
|-------------|----------------|
| `increment_posts_today(handle)` | `prisma.bot.update({ where: { handle }, data: { postsToday: { increment: 1 } } })` |
| `reset_all_envoy_quota()` | `prisma.bot.updateMany({ where: { isEnvoy: true }, data: { postsToday: 0 } })` |
| `increment_bot_stat(handle, stat)` | `prisma.bot.update({ data: { [stat]: { increment: 1 } } })` |

### 0E. Chạy db push

```bash
npx prisma db push
```

### Implementation Steps cho Step 0:
1. [ ] Thêm 12 models mới vào `prisma/schema.prisma`
2. [ ] Thêm 2 models phụ (CrawlSource, ActivityLog)
3. [ ] Mở rộng model Profile (+7 cột)
4. [ ] Mở rộng model Bot (+12 cột)
5. [ ] Thêm relations giữa models mới và cũ
6. [ ] Chạy `npx prisma db push` để sync
7. [ ] Verify bằng `npx prisma studio`

---

## 🎯 Step 1: Tạo Helper Layer (1 task)

- [ ] Tạo `lib/data/get-user.ts` — Lấy user từ NextAuth token thay vì Supabase auth
- [ ] Tạo `lib/data/helpers.ts` — Common Prisma patterns (paginate, error handling)

---

## 📦 Step 2: Batch A — Feed & Posts (ưu tiên CAO)

> Trang chủ không hoạt động nếu không migrate batch này

| # | File | Migrate gì |
|---|------|-----------|
| 1 | `api/feed/route.ts` | `supabase.from('likes/saves')` → prisma |
| 2 | `lib/feed/feed-service.ts` | **368 dòng** — toàn bộ feed logic |
| 3 | `api/posts/[id]/like/route.ts` | likes table |
| 4 | `api/posts/[id]/save/route.ts` | saves table |
| 5 | `api/comments/route.ts` | comments table |
| 6 | `api/comments/[id]/route.ts` | comments table |
| 7 | `api/comments/reply/route.ts` | comments table |
| 8 | `api/breaking/route.ts` | breaking_news table |
| 9 | `api/breaking/[id]/route.ts` | breaking_news table |
| 10 | `api/notifications/route.ts` | notifications table |
| 11 | `(main)/post/[id]/page.tsx` | posts + comments |

### Implementation Steps:
1. [ ] Migrate `lib/feed/feed-service.ts` (lớn nhất — 368 dòng)
2. [ ] Migrate `api/feed/route.ts`
3. [ ] Migrate `api/posts/[id]/like` + `save`
4. [ ] Migrate `api/comments/*` (3 files)
5. [ ] Migrate `api/breaking/*` + `api/notifications`
6. [ ] Migrate `(main)/post/[id]/page.tsx`

---

## 📦 Step 3: Batch B — Intents CẦN/CÓ (ưu tiên CAO)

> Trang CẦN/CÓ không hoạt động nếu không migrate

| # | File | Migrate gì |
|---|------|-----------|
| 1 | `api/intents/route.ts` | **398 dòng** — lớn nhất, list + create |
| 2 | `api/intents/[id]/route.ts` | GET/PUT/DELETE intent |
| 3 | `api/intents/[id]/comments/route.ts` | intent_comments |
| 4 | `api/intents/[id]/matches/route.ts` | matches table |
| 5 | `api/intents/[id]/images/route.ts` | intent_images |
| 6 | `api/intents/comments/route.ts` | Global intent comments |
| 7 | `api/intents/interest/route.ts` | interest tracking |
| 8 | `api/intents/link-check/route.ts` | link validation |
| 9 | `api/intents/crawled-inject/route.ts` | Bot inject intents |
| 10 | `api/matching/route.ts` | matches engine |
| 11 | `api/matching/trigger/route.ts` | trigger matching |
| 12 | `lib/engine/matching.ts` | Core matching logic |

### Implementation Steps:
1. [ ] Migrate `api/intents/route.ts` (GET — list/filter)
2. [ ] Migrate `api/intents/route.ts` (POST — create + moderation)
3. [ ] Migrate `api/intents/[id]/route.ts` (CRUD)
4. [ ] Migrate `api/intents/[id]/comments` + `matches` + `images`
5. [ ] Migrate `api/intents/interest` + `crawled-inject` + `link-check`
6. [ ] Migrate `api/matching/*` + `lib/engine/matching.ts`

---

## 📦 Step 4: Batch C — Bots & Users

| # | File | Migrate gì |
|---|------|-----------|
| 1 | `api/bots/route.ts` | GET/POST/PUT bots |
| 2 | `api/bots/[id]/follow/route.ts` | follows table |
| 3 | `api/users/[id]/stats/route.ts` | user_stats table |
| 4 | `api/admin/update-avatars/route.ts` | Update bot avatars |
| 5 | `(main)/bot/[handle]/page.tsx` | Bot profile page |

### Implementation Steps:
1. [ ] Migrate `api/bots/route.ts` (GET/POST/PUT)
2. [ ] Migrate `api/bots/[id]/follow` + `api/users/[id]/stats`
3. [ ] Migrate `(main)/bot/[handle]/page.tsx` + `api/admin/update-avatars`

---

## 📦 Step 5: Batch D — Crawler Pipeline

| # | File | Migrate gì |
|---|------|-----------|
| 1 | `api/crawl/route.ts` | trigger crawl |
| 2 | `api/crawl-sources/route.ts` | crawl_sources table |
| 3 | `api/crawler/trigger/route.ts` | crawler trigger |
| 4 | `api/raw-news/route.ts` | raw_news table |
| 5 | `api/generate-post/route.ts` | AI generate posts |
| 6 | `api/dev/trigger-ai/route.ts` | Dev tools |
| 7 | `api/openclaw/webhook/route.ts` | OpenClaw webhook |

### Implementation Steps:
1. [ ] Migrate `api/crawl-sources/route.ts` + `api/crawl/route.ts`
2. [ ] Migrate `api/crawler/trigger` + `api/raw-news`
3. [ ] Migrate `api/generate-post` + `api/dev/trigger-ai` + `api/openclaw/webhook`

---

## 📦 Step 6: Batch E — Verification & Chat

| # | File | Migrate gì |
|---|------|-----------|
| 1 | `api/verify/route.ts` | verifications table |
| 2 | `api/verify/gps/route.ts` | GPS verification |
| 3 | `api/verify/cccd/route.ts` | CCCD verification |
| 4 | `api/verify/sodo/route.ts` | Sổ đỏ verification |
| 5 | `api/chat/conversations/route.ts` | conversations table |
| 6 | `api/chat/[id]/messages/route.ts` | messages table |
| 7 | `api/chat/[id]/read/route.ts` | Mark read |
| 8 | `api/agents/trigger/route.ts` | Agent trigger |

### Implementation Steps:
1. [ ] Migrate `api/verify/*` (4 files)
2. [ ] Migrate `api/chat/*` (3 files)
3. [ ] Migrate `api/agents/trigger`

---

## 📦 Step 7: Batch L — Lib Services (27 files)

| Nhóm | Files | Migrate kèm |
|------|-------|-------------|
| Agents | `lib/agents/orchestrator.ts`, `memory.ts`, `knowledge-graph.ts` | Kèm Step 3 |
| AI | `lib/ai/agents/bot-interactions.ts`, `debate-engine.ts`, `status-manager.ts`, `intent-injector.ts`, `activity-scheduler.ts` | Kèm Step 3 |
| Crawler | `lib/crawlers/unified-crawler.ts`, `lib/crawler/crawler-manager.ts` | Kèm Step 5 |
| OpenClaw | `lib/openclaw/persistence.ts`, `channel-manager.ts`, `breaking-push.ts`, `bot-conversation.ts`, `prediction-commands.ts`, `digest-scheduler.ts`, `news-crawler.ts` | Kèm Step 5 |
| Gamification | `lib/gamification/points.ts`, `predictions.ts`, `streaks.ts`, `achievements.ts`, `reactions.ts` | Kèm Step 4 |
| Intelligence | `lib/intelligence/proactive/scheduler.ts`, `outreach-engine.ts`, `memory/persistent-memory.ts`, `alerts/custom-triggers.ts` | Kèm Step 6 |

### Implementation Steps:
1. [ ] Migrate `lib/agents/*` (3 files)
2. [ ] Migrate `lib/ai/agents/*` (5 files)
3. [ ] Migrate `lib/crawlers/*` + `lib/crawler/*` + `lib/openclaw/*` (8 files)
4. [ ] Migrate `lib/gamification/*` + `lib/intelligence/*` + `lib/engine/*` (11 files)

---

## 🧹 Step 8: Cleanup & Testing

1. [ ] Xóa `lib/supabase/server.ts` và tất cả import supabase
2. [ ] Xóa packages: `@supabase/ssr`, `@supabase/supabase-js` (nếu không dùng ở đâu khác)
3. [ ] Chạy `npm run build` — phải pass không lỗi
4. [ ] Test toàn bộ API bằng script tự động
5. [ ] Test UI trên browser

---

## 🧪 Test Criteria

Mỗi step sau khi hoàn thành:
- [ ] API trả về đúng status code (200/201/400/401/404/500)
- [ ] Response JSON tương thích với frontend
- [ ] `npm run dev` không error
- [ ] Browser hiển thị đúng dữ liệu

---

## ⏱️ Ước Tính

| Step | Nội dung | Files | Tasks | Thời gian |
|------|----------|-------|-------|-----------|
| 0 | Schema Update | 1 | 7 | 30-45 min |
| 1 | Helper Layer | 2 | 2 | 15 min |
| 2 | Batch A: Feed | 11 | 6 | 1-2 sessions |
| 3 | Batch B: Intents | 12 | 6 | 1-2 sessions |
| 4 | Batch C: Bots | 5 | 3 | 30-60 min |
| 5 | Batch D: Crawler | 7 | 3 | 1 session |
| 6 | Batch E: Verify+Chat | 8 | 3 | 1 session |
| 7 | Batch L: Libs | 27 | 4 | 1-2 sessions |
| 8 | Cleanup & Test | - | 5 | 30-60 min |
| **TOTAL** | | **~68** | **39** | **~6-10 sessions** |

---
Next Phase: `phase-04-realtime-storage.md`
