# 🎨 DESIGN: Phase 03 — API & Data Access Rewrite

Ngày tạo: 2026-04-03
Dựa trên: `plans/260403-1050-postgres-migration/phase-03-api-rewrite.md`

---

## ⚠️ BLOCKER #1: 14 Models Cần Tạo/Sửa trong Prisma Schema

Prisma schema hiện tại chỉ có models cho hệ thống **FACEBOT** (posts, bots, comments...)
nhưng **THIẾU HOÀN TOÀN** các tables của hệ thống **CẦN & CÓ** (intents) + phụ trợ.

### A. 12 Models MỚI cần tạo:

| # | Table SQL | Prisma Model | Migration gốc | Dùng ở đâu |
|---|-----------|-------------|---------------|-------------|
| 1 | `intents` | `Intent` | `100_can_co_intents` + `200_bot_envoy` | api/intents/*, matching, orchestrator |
| 2 | `intent_images` | `IntentImage` | `100_can_co_intents` | api/intents/[id]/images |
| 3 | `intent_comments` | `IntentComment` | `100_can_co_intents` | api/intents/comments, orchestrator |
| 4 | `intent_embeddings` | `IntentEmbedding` | `100_can_co_intents` | lib/engine/matching |
| 5 | `matches` | `Match` | `100_can_co_intents` | api/matching/*, engine |
| 6 | `verifications` | `Verification` | `100_can_co_intents` | api/verify/* |
| 7 | `conversations` | `Conversation` | `100_can_co_intents` | api/chat/* |
| 8 | `messages` | `Message` | `100_can_co_intents` | api/chat/[id]/messages |
| 9 | `content_violations` | `ContentViolation` | `012_content_moderation` | api/intents (moderation) |
| 10 | `agent_memory` | `AgentMemory` | `100_can_co_intents` | lib/agents/memory |
| 11 | `knowledge_edges` | `KnowledgeEdge` | `100_can_co_intents` | lib/agents/knowledge-graph |
| 12 | `agent_activity` | `AgentActivity` | `100_can_co_intents` | lib/agents/orchestrator |

### B. 2 Models PHỤ bổ sung:

| # | Table SQL | Prisma Model | Migration gốc | Dùng ở đâu |
|---|-----------|-------------|---------------|-------------|
| 13 | `crawl_sources` | `CrawlSource` | `200_bot_envoy` | api/crawl-sources, crawler |
| 14 | `activity_logs` | `ActivityLog` | `20260131_activity_logs` | lib/agents/orchestrator |

### C. 2 Models CŨ cần mở rộng cột:

#### Profile (+7 cột)
| Cột | Type | Migration gốc |
|-----|------|---------------|
| `violationCount` | Int @default(0) | `012_content_moderation` |
| `isBanned` | Boolean @default(false) | `012_content_moderation` |
| `bannedAt` | DateTime? | `012_content_moderation` |
| `banReason` | String? | `012_content_moderation` |
| `verificationLevel` | String @default("none") | `100_can_co_intents` |
| `trustScore` | Int @default(1) | `100_can_co_intents` |
| `phone` | String? | `100_can_co_intents` |

#### Bot (+12 cột)
| Cột | Type | Migration gốc |
|-----|------|---------------|
| `assignedProvince` | String? | `200_bot_envoy` |
| `assignedDistrict` | String? | `200_bot_envoy` |
| `assignedWard` | String? | `200_bot_envoy` |
| `assignedProvinceCode` | String? | `200_bot_envoy` |
| `assignedDistrictCode` | String? | `200_bot_envoy` |
| `assignedWardCode` | String? | `200_bot_envoy` |
| `assignedCategories` | String[] | `200_bot_envoy` |
| `dailyQuota` | Int @default(10) | `200_bot_envoy` |
| `postsToday` | Int @default(0) | `200_bot_envoy` |
| `isEnvoy` | Boolean @default(false) | `200_bot_envoy` |
| `commentsCount` | Int @default(0) | `20260131_activity_logs` |
| `debatesCount` | Int @default(0) | `20260131_activity_logs` |

> **Phải hoàn thành 14 models này TRƯỚC khi migrate API!**

---

## 📐 Prisma Models Cần Thêm (SQL → Prisma)

### Model: Intent (Core — CẦN & CÓ)
```prisma
model Intent {
  id                String    @id @default(uuid())
  userId            String    @map("user_id")
  type              String    // 'CAN' | 'CO'
  rawText           String    @map("raw_text")
  title             String?
  parsedData        Json      @default("{}") @map("parsed_data")
  category          String    @default("real_estate")
  subcategory       String?   @default("apartment")
  price             BigInt?
  priceMin          BigInt?   @map("price_min")
  priceMax          BigInt?   @map("price_max")
  address           String?
  district          String?
  ward              String?
  city              String?   @default("Hồ Chí Minh")
  lat               Decimal?  @db.Decimal(10,8)
  lng               Decimal?  @db.Decimal(11,8)
  trustScore        Int?      @default(1) @map("trust_score")
  verificationLevel String?   @default("none") @map("verification_level")
  commentCount      Int?      @default(0) @map("comment_count")
  matchCount        Int?      @default(0) @map("match_count")
  viewCount         Int?      @default(0) @map("view_count")
  status            String?   @default("active")
  expiresAt         DateTime? @map("expires_at") @db.Timestamptz
  createdAt         DateTime? @default(now()) @map("created_at") @db.Timestamptz
  updatedAt         DateTime? @default(now()) @map("updated_at") @db.Timestamptz

  // Bot-generated intents
  isBot             Boolean?  @default(false) @map("is_bot")
  botHandle         String?   @map("bot_handle")

  images            IntentImage[]
  comments          IntentComment[]
  embedding         IntentEmbedding?
  canMatches        Match[]   @relation("CanMatches")
  coMatches         Match[]   @relation("CoMatches")
  verifications     Verification[]
  conversations     Conversation[]
  agentActivities   AgentActivity[]

  @@map("intents")
}
```

### Model: IntentImage
```prisma
model IntentImage {
  id           String    @id @default(uuid())
  intentId     String    @map("intent_id")
  url          String
  displayOrder Int?      @default(0) @map("display_order")
  createdAt    DateTime? @default(now()) @map("created_at") @db.Timestamptz

  intent Intent @relation(fields: [intentId], references: [id], onDelete: Cascade)

  @@map("intent_images")
}
```

### Model: IntentComment
```prisma
model IntentComment {
  id        String    @id @default(uuid())
  intentId  String    @map("intent_id")
  userId    String?   @map("user_id")
  botName   String?   @map("bot_name")
  content   String
  isBot     Boolean?  @default(false) @map("is_bot")
  parentId  String?   @map("parent_id")
  createdAt DateTime? @default(now()) @map("created_at") @db.Timestamptz

  intent  Intent         @relation(fields: [intentId], references: [id], onDelete: Cascade)
  parent  IntentComment? @relation("IntentCommentReplies", fields: [parentId], references: [id])
  replies IntentComment[] @relation("IntentCommentReplies")

  agentActivities AgentActivity[]

  @@map("intent_comments")
}
```

### Model: IntentEmbedding
```prisma
model IntentEmbedding {
  id        String    @id @default(uuid())
  intentId  String    @unique @map("intent_id")
  embedding Unsupported("vector(1536)")?
  textInput String?   @map("text_input")
  createdAt DateTime? @default(now()) @map("created_at") @db.Timestamptz

  intent Intent @relation(fields: [intentId], references: [id], onDelete: Cascade)

  @@map("intent_embeddings")
}
```

### Model: Match
```prisma
model Match {
  id           String    @id @default(uuid())
  canIntentId  String    @map("can_intent_id")
  coIntentId   String    @map("co_intent_id")
  similarity   Decimal?  @db.Decimal(5,4)
  explanation  String?
  status       String?   @default("suggested")
  createdAt    DateTime? @default(now()) @map("created_at") @db.Timestamptz

  canIntent Intent @relation("CanMatches", fields: [canIntentId], references: [id])
  coIntent  Intent @relation("CoMatches", fields: [coIntentId], references: [id])

  @@unique([canIntentId, coIntentId])
  @@map("matches")
}
```

### Model: Verification
```prisma
model Verification {
  id          String    @id @default(uuid())
  userId      String    @map("user_id")
  intentId    String?   @map("intent_id")
  type        String
  status      String?   @default("pending")
  data        Json?
  imageUrl    String?   @map("image_url")
  gpsLat      Decimal?  @db.Decimal(10,8) @map("gps_lat")
  gpsLng      Decimal?  @db.Decimal(11,8) @map("gps_lng")
  gpsAccuracy Decimal?  @db.Decimal(10,2) @map("gps_accuracy")
  reviewedBy  String?   @map("reviewed_by")
  reviewedAt  DateTime? @map("reviewed_at") @db.Timestamptz
  createdAt   DateTime? @default(now()) @map("created_at") @db.Timestamptz

  intent Intent? @relation(fields: [intentId], references: [id])

  @@map("verifications")
}
```

### Model: Conversation & Message
```prisma
model Conversation {
  id            String    @id @default(uuid())
  intentId      String?   @map("intent_id")
  userA         String    @map("user_a")
  userB         String    @map("user_b")
  lastMessageAt DateTime? @map("last_message_at") @db.Timestamptz
  createdAt     DateTime? @default(now()) @map("created_at") @db.Timestamptz

  intent   Intent?   @relation(fields: [intentId], references: [id])
  messages Message[]

  @@unique([intentId, userA, userB])
  @@map("conversations")
}

model Message {
  id             String    @id @default(uuid())
  conversationId String    @map("conversation_id")
  senderId       String    @map("sender_id")
  content        String
  readAt         DateTime? @map("read_at") @db.Timestamptz
  createdAt      DateTime? @default(now()) @map("created_at") @db.Timestamptz

  conversation Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  @@map("messages")
}
```

### Model: ContentViolation
```prisma
model ContentViolation {
  id            String    @id @default(uuid())
  userId        String    @map("user_id")
  rawText       String?   @map("raw_text")
  violationType String?   @map("violation_type")
  aiReason      String?   @map("ai_reason")
  createdAt     DateTime? @default(now()) @map("created_at") @db.Timestamptz

  @@map("content_violations")
}
```

### Model: AgentMemory, KnowledgeEdge, AgentActivity
```prisma
model AgentMemory {
  id             String    @id @default(uuid())
  botId          String    @map("bot_id")
  userId         String    @map("user_id")
  memoryType     String    @map("memory_type")
  content        String
  confidence     Decimal?  @default(0.5) @db.Decimal(3,2)
  sourceIntentId String?   @map("source_intent_id")
  expiresAt      DateTime? @map("expires_at") @db.Timestamptz
  createdAt      DateTime? @default(now()) @map("created_at") @db.Timestamptz
  updatedAt      DateTime? @default(now()) @map("updated_at") @db.Timestamptz

  @@unique([botId, userId, memoryType])
  @@map("agent_memory")
}

model KnowledgeEdge {
  id         String    @id @default(uuid())
  sourceType String    @map("source_type")
  sourceId   String    @map("source_id")
  relation   String
  targetType String    @map("target_type")
  targetId   String    @map("target_id")
  weight     Decimal?  @default(0.5) @db.Decimal(5,4)
  metadata   Json?     @default("{}")
  createdAt  DateTime? @default(now()) @map("created_at") @db.Timestamptz
  updatedAt  DateTime? @default(now()) @map("updated_at") @db.Timestamptz

  @@unique([sourceType, sourceId, relation, targetType, targetId])
  @@map("knowledge_edges")
}

model AgentActivity {
  id        String    @id @default(uuid())
  botId     String    @map("bot_id")
  event     String
  intentId  String?   @map("intent_id")
  action    String
  commentId String?   @map("comment_id")
  reason    String?
  createdAt DateTime? @default(now()) @map("created_at") @db.Timestamptz

  intent  Intent?        @relation(fields: [intentId], references: [id])
  comment IntentComment? @relation(fields: [commentId], references: [id])

  @@map("agent_activity")
}
```

### Model: CrawlSource (PHỤ — từ `200_bot_envoy.sql`)
```prisma
model CrawlSource {
  id                  String    @id @default(uuid())
  name                String
  url                 String
  sourceType          String    @default("rss") @map("source_type")
  category            String    @default("real_estate")
  province            String?
  district            String?
  isActive            Boolean?  @default(true) @map("is_active")
  lastCrawledAt       DateTime? @map("last_crawled_at") @db.Timestamptz
  crawlIntervalMinutes Int?     @default(60) @map("crawl_interval_minutes")
  totalItemsCrawled   Int?      @default(0) @map("total_items_crawled")
  notes               String?
  createdAt           DateTime? @default(now()) @map("created_at") @db.Timestamptz
  updatedAt           DateTime? @default(now()) @map("updated_at") @db.Timestamptz

  @@map("crawl_sources")
}
```

### Model: ActivityLog (PHỤ — từ `20260131_activity_logs.sql`)
```prisma
model ActivityLog {
  id        String    @id @default(uuid())
  type      String    // 'post' | 'comment' | 'debate' | 'reaction' | 'message'
  botHandle String    @map("bot_handle")
  targetId  String?   @map("target_id")
  content   String?
  metadata  Json?     @default("{}")
  createdAt DateTime? @default(now()) @map("created_at") @db.Timestamptz

  @@map("activity_logs")
}
```

### Mở rộng: Profile (+7 cột)
```prisma
// Thêm vào model Profile hiện tại:
  violationCount    Int?      @default(0) @map("violation_count")
  isBanned          Boolean?  @default(false) @map("is_banned")
  bannedAt          DateTime? @map("banned_at") @db.Timestamptz
  banReason         String?   @map("ban_reason")
  verificationLevel String?   @default("none") @map("verification_level")
  trustScore        Int?      @default(1) @map("trust_score")
  phone             String?   @db.VarChar(15)
```

### Mở rộng: Bot (+12 cột)
```prisma
// Thêm vào model Bot hiện tại:
  assignedProvince     String?   @map("assigned_province")
  assignedDistrict     String?   @map("assigned_district")
  assignedWard         String?   @map("assigned_ward")
  assignedProvinceCode String?   @map("assigned_province_code")
  assignedDistrictCode String?   @map("assigned_district_code")
  assignedWardCode     String?   @map("assigned_ward_code")
  assignedCategories   String[]  @default([]) @map("assigned_categories")
  dailyQuota           Int?      @default(10) @map("daily_quota")
  postsToday           Int?      @default(0) @map("posts_today")
  isEnvoy              Boolean?  @default(false) @map("is_envoy")
  commentsCount        Int?      @default(0) @map("comments_count")
  debatesCount         Int?      @default(0) @map("debates_count")
```

---

## 🔄 3 Supabase Patterns → Prisma Patterns

### Pattern 1: Auth User (supabase.auth.getUser → NextAuth getToken)

**TRƯỚC:**
```ts
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
const userId = user?.id
```

**SAU:**
```ts
import { getToken } from 'next-auth/jwt'
const token = await getToken({ req })
const userId = token?.sub  // NextAuth user ID
```

---

### Pattern 2: Data Query (supabase.from → prisma.model)

**TRƯỚC:**
```ts
const { data, error } = await supabase
  .from('bots')
  .select('*')
  .eq('handle', handle)
  .single()
if (error) throw error
```

**SAU:**
```ts
const data = await prisma.bot.findUnique({
  where: { handle }
})
if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
```

---

### Pattern 3: Service Client (supabase-js direct → prisma import)

**TRƯỚC:**
```ts
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(URL, SERVICE_KEY)
```

**SAU:**
```ts
import { prisma } from '@/lib/db'
// Prisma đã bypass RLS — tương đương service role
```

---

## 🗺️ Supabase → Prisma Query Mapping

| Supabase | Prisma |
|----------|--------|
| `.from('x').select('*')` | `prisma.x.findMany()` |
| `.select('*, bots(*)')` | `prisma.x.findMany({ include: { bot: true } })` |
| `.eq('id', id).single()` | `prisma.x.findUnique({ where: { id } })` |
| `.in('id', ids)` | `prisma.x.findMany({ where: { id: { in: ids } } })` |
| `.insert({...}).select().single()` | `prisma.x.create({ data: {...} })` |
| `.update({...}).eq('id', id)` | `prisma.x.update({ where: { id }, data: {...} })` |
| `.delete().eq('id', id)` | `prisma.x.delete({ where: { id } })` |
| `.order('created_at', { ascending: false })` | `orderBy: { createdAt: 'desc' }` |
| `.limit(20)` | `take: 20` |
| `.range(0, 19)` | `skip: 0, take: 20` |
| `.gte('created_at', date)` | `where: { createdAt: { gte: date } }` |
| `.select('*', { count: 'exact' })` | Separate `prisma.x.count()` call |
| `.rpc('function_name')` | Raw SQL: `prisma.$queryRaw` |

---

## ⚠️ Vấn Đề Snake_case vs CamelCase

**Response JSON sẽ thay đổi format!**

Supabase trả về: `{ bot_id, created_at, is_bot }`
Prisma trả về: `{ botId, createdAt, isBot }`

### Giải pháp: Response Mapper

```ts
// lib/data/mappers.ts
export function toSnakeCase(obj: Record<string, any>): Record<string, any> {
  // Chuyển camelCase → snake_case cho response
  // Giữ tương thích frontend đang dùng snake_case
}
```

**HOẶC:** Sửa frontend dùng camelCase luôn (tốt hơn lâu dài).

---

## 📋 Thứ Tự Thực Hiện

```
Step 0: Thêm 14 models (12 mới + 2 phụ) + mở rộng Profile/Bot + db push  ← BLOCKER
Step 1: Tạo helper layer (auth, mappers)
Step 2: Batch A — Feed & Posts (11 files)
Step 3: Batch B — Intents CẦN/CÓ (12 files)
Step 4: Batch C — Bots & Users (5 files)
Step 5: Batch D — Crawler Pipeline (7 files)
Step 6: Batch E — Verification & Chat (8 files)
Step 7: Batch L — Lib Services (27 files)
Step 8: Cleanup — Xóa supabase imports
```

---

## 🔧 RPC Functions → Prisma Native

| SQL Function | Cách gọi cũ | Prisma thay thế |
|-------------|-------------|----------------|
| `increment_posts_today(handle)` | `supabase.rpc(...)` | `prisma.bot.update({ where: { handle }, data: { postsToday: { increment: 1 } } })` |
| `reset_all_envoy_quota()` | `supabase.rpc(...)` | `prisma.bot.updateMany({ where: { isEnvoy: true }, data: { postsToday: 0 } })` |
| `increment_bot_stat(handle, stat)` | `supabase.rpc(...)` | `prisma.bot.update({ where: { handle }, data: { [stat]: { increment: 1 } } })` |

---

## ✅ Acceptance Criteria

Mỗi API sau khi migrate phải pass:

- [ ] Trả về đúng status code (200/201/400/401/404/500)
- [ ] Response JSON structure tương thích frontend
- [ ] Không còn import từ `@supabase/*`
- [ ] `npm run dev` không error
- [ ] Browser hiển thị đúng dữ liệu

---

*Tạo bởi AWF 2.1 — Design Phase*
