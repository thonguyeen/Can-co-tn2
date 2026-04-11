# 🎨 DESIGN: Phase 03 - AI Config Stabilization

Ngày tạo: 2026-04-10
Cập nhật: 2026-04-10 (Tech Lead review — fix 2 gaps)
Dựa trên: `plans/260410-1504-pre-deploy-hardening/phase-03-ai-config.md`

---

## 1. Vấn Đề Hiện Tại (Chẩn Đoán)

File `anthropic-direct.ts` có **3 lỗi thiết kế** gây lãng phí tài nguyên:

### 🔴 Bug 1: Khởi tạo Anthropic client vô nghĩa (line 7-9)

```typescript
// ❌ HIỆN TẠI: Luôn tạo client dù KHÔNG có API key
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,  // ← undefined!
});
```

Kết quả: Mỗi lần import file → tạo 1 Anthropic client vô dụng. Tốn memory.

### 🔴 Bug 2: Luôn thử Anthropic trước rồi mới fallback (line 61-72)

```typescript
// ❌ HIỆN TẠI: Luôn gọi Anthropic → timeout ~2-3s → rồi mới fallback
export async function anthropicChat(...) {
  try {
    return await anthropicChatDirect(...);  // ← Luôn fail!
  } catch (error) {
    return await openaiChatDirect(...);     // ← Đáng lẽ gọi thẳng đây
  }
}
```

Kết quả: **Mỗi AI call mất thêm 2-3 giây** chỉ để chờ Anthropic fail.

### 🟡 Bug 3: Hardcode model name (line 29, 84)

```typescript
model: 'claude-sonnet-4-20250514',  // ← Hardcode, không dùng env var
```

Trong khi `.env.local` đã có `AI_PRIMARY_*` sẵn nhưng không ai dùng.

---

## 2. Giải Pháp: Smart Provider Selection

### Triết lý: "Biết trước key nào có → gọi thẳng, không thử dại"

```
┌─────────────────────────────────────────────────────┐
│       AI CALL FLOW (SAU KHI SỬA)                    │
├─────────────────────────────────────────────────────┤
│                                                      │
│   Có ANTHROPIC_API_KEY?                              │
│   ├── CÓ → Dùng Anthropic (Primary)                 │
│   │         Fail? → Fallback sang OpenAI             │
│   │                                                  │
│   └── KHÔNG → Bỏ qua Anthropic hoàn toàn            │
│              → Dùng OpenAI/AI_PRIMARY trực tiếp      │
│              → Fail? → AI_FALLBACK                   │
│              → 0 giây lãng phí! ✅                   │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Bảng Provider Priority

| Priority | Điều kiện | Provider | Env Vars |
|----------|-----------|----------|----------|
| 1 | `ANTHROPIC_API_KEY` có | Anthropic Claude | `ANTHROPIC_API_KEY` |
| 2 | `AI_PRIMARY_API_KEY` có (hoặc `OPENAI_API_KEY`) | OpenAI-compatible | `AI_PRIMARY_API_KEY`, `AI_PRIMARY_BASE_URL`, `AI_PRIMARY_MODEL` |
| 3 | `AI_FALLBACK_API_KEY` có | Fallback provider | `AI_FALLBACK_API_KEY`, `AI_FALLBACK_BASE_URL`, `AI_FALLBACK_MODEL` |
| ❌ | Không có key nào | Throw error rõ ràng | — |

---

## 3. Code Changes

### 3.1. `anthropic-direct.ts` — Lazy Init + Smart Routing

**Thay đổi 1: Lazy initialization (Chỉ tạo client khi cần)**

```typescript
// ✅ SAU: Chỉ tạo client khi có key
let _anthropic: Anthropic | null = null;
let _openai: OpenAI | null = null;
let _fallback: OpenAI | null = null;

function getAnthropicClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!_anthropic) {
    _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _anthropic;
}

function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.AI_PRIMARY_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  if (!_openai) {
    _openai = new OpenAI({
      apiKey,
      ...(process.env.AI_PRIMARY_BASE_URL || process.env.OPENAI_BASE_URL
        ? { baseURL: process.env.AI_PRIMARY_BASE_URL || process.env.OPENAI_BASE_URL }
        : {}),
    });
  }
  return _openai;
}

function getFallbackClient(): OpenAI | null {
  if (!process.env.AI_FALLBACK_API_KEY) return null;
  if (!_fallback) {
    _fallback = new OpenAI({
      apiKey: process.env.AI_FALLBACK_API_KEY,
      ...(process.env.AI_FALLBACK_BASE_URL
        ? { baseURL: process.env.AI_FALLBACK_BASE_URL }
        : {}),
    });
  }
  return _fallback;
}
```

**Thay đổi 2: Smart routing trong `anthropicChat()`**

```typescript
export async function anthropicChat(
  systemPrompt: string,
  userMessage: string,
  options?: ChatOptions
): Promise<string> {
  // === Tầng 1: Thử Anthropic (nếu có key) ===
  const anthropicClient = getAnthropicClient();
  if (anthropicClient) {
    try {
      return await anthropicChatDirect(anthropicClient, systemPrompt, userMessage, options);
    } catch (error) {
      console.warn('[AI] Anthropic failed, trying OpenAI...');
    }
  }

  // === Tầng 2: OpenAI / AI_PRIMARY ===
  const openaiClient = getOpenAIClient();
  if (openaiClient) {
    try {
      return await openaiChatDirect(openaiClient, systemPrompt, userMessage, options);
    } catch (error) {
      console.warn('[AI] Primary OpenAI failed, trying fallback...');
    }
  }

  // === Tầng 3: AI_FALLBACK ===
  const fallbackClient = getFallbackClient();
  if (fallbackClient) {
    return await openaiChatDirect(fallbackClient, systemPrompt, userMessage, options);
  }

  throw new Error('[AI] Không có AI provider nào khả dụng. Check ANTHROPIC_API_KEY hoặc AI_PRIMARY_API_KEY.');
}
```

**Thay đổi 3: Model name từ env thay vì hardcode**

```typescript
// Anthropic: dùng env hoặc default
model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',

// OpenAI: dùng AI_PRIMARY_MODEL hoặc OPENAI_MODEL
model: process.env.AI_PRIMARY_MODEL || process.env.OPENAI_MODEL || 'gpt-4o-mini',

// Fallback: riêng
model: process.env.AI_FALLBACK_MODEL || 'gpt-4o-mini',
```

**Thay đổi 4: Smart Routing Tương Tự Cho Hàm Lịch Sử**

Áp dụng cùng pattern 3 tầng cho hàm `anthropicChatWithHistory()`. Sử dụng `getAnthropicClient()` → `getOpenAIClient()` → `getFallbackClient()`.

### 3.2. Sửa 4 Hàm Internal Cốt Lõi

Sửa signature để nhận client instance thay vì dựa vào biến global không ổn định (sẽ fix được luôn cho cả regular chat và with-history chat).

```typescript
// Trước: Các hàm này xài global `anthropic` và `openai`
async function anthropicChatDirect(systemPrompt, userMessage, options)
async function openaiChatDirect(systemPrompt, userMessage, options)
async function anthropicChatWithHistoryDirect(sessionId, systemPrompt, history, options)
async function openaiChatWithHistoryDirect(systemPrompt, history, options)

// SAU: Phải truyền `client` param tương ứng vào
async function anthropicChatDirect(client: Anthropic, systemPrompt, userMessage, options)
async function openaiChatDirect(client: OpenAI, systemPrompt, userMessage, options)
async function anthropicChatWithHistoryDirect(client: Anthropic, sessionId, systemPrompt, history, options)
async function openaiChatWithHistoryDirect(client: OpenAI, systemPrompt, history, options)
```

### 3.3. `.env.production` template — [NEW FILE]

```env
# ═══════════════════════════════════════════════════
# PRODUCTION ENVIRONMENT - Can-co-tn
# ═══════════════════════════════════════════════════

# --- Database (Supabase) ---
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# --- Auth ---
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="<generate-with-openssl>"

# --- AI Providers ---
# Anthropic (Optional - bỏ trống nếu không dùng)
# ANTHROPIC_API_KEY=

# Primary AI (Required)
AI_PRIMARY_API_KEY=
AI_PRIMARY_BASE_URL=
AI_PRIMARY_MODEL=

# Fallback AI (Optional nhưng khuyến nghị)
AI_FALLBACK_API_KEY=
AI_FALLBACK_BASE_URL=
AI_FALLBACK_MODEL=

# Legacy (sẽ bị đọc nếu AI_PRIMARY không set)
OPENAI_API_KEY=
OPENAI_BASE_URL=
OPENAI_MODEL=

# --- Admin ---
ADMIN_EMAILS="admin@cancotn.com"

# --- Cron ---
CRON_SECRET="<generate-random-string>"
```

---

## 4. Impact Analysis (Ai bị ảnh hưởng?)

| File sử dụng AI | Import | Ảnh hưởng |
|------------------|--------|-----------|
| `sessions.ts` | `anthropicChatWithHistory` | ✅ Transparent — không cần sửa |
| `enhanced-sessions.ts` | `anthropicChat` | ✅ Transparent — không cần sửa |
| `anthropic-direct.ts` (internal) | `generateBotResponse` | ✅ Tự sửa cùng file |

> [!TIP]
> Tất cả callers import `anthropicChat` / `anthropicChatWithHistory` → Không thay đổi API signature → **Zero breaking changes** cho code bên ngoài.

---

## 5. Test Cases & Verification Steps

### Bảng kịch bản test

| # | Kịch bản | Config | Expected |
|---|----------|--------|----------|
| TC-01 | Không có ANTHROPIC key (hiện tại) | `ANTHROPIC_API_KEY` trống | Bỏ qua Anthropic, dùng thẳng OpenAI. Log: `[AI] Using OpenAI (primary)` |
| TC-02 | Primary fail | `AI_PRIMARY_API_KEY` sai | Fallback sang `AI_FALLBACK`. Log: `[AI] Primary failed, trying fallback...` |
| TC-03 | Cả 2 primary đều trống | Chỉ có `AI_FALLBACK` | Dùng fallback. Vẫn tạo bài thành công |
| TC-04 | Không có key nào | Xóa hết AI keys | Throw error rõ ràng, không crash server |
| TC-05 | Có Anthropic key | Set `ANTHROPIC_API_KEY` hợp lệ | Dùng Anthropic trước, fallback nếu fail |

### Verification Cần Thiết (Import-Time Risk)
Mặc dù là lazy-init, Node.js vẫn eval cái `import Anthropic from '@anthropic-ai/sdk'`. Cần chắc chắn package này đã tồn tại trong local dependencies chứ không chỉ là dummy import, nếu không script sẽ báo `Module not found` ngay khi Next.js reload.

---

## 6. Implementation Checklist

```
□ package.json: Verify `@anthropic-ai/sdk` tồn tại
□ anthropic-direct.ts: Dẹp biến global instantiations
□ anthropic-direct.ts: Tạo 3 hàm lazy helper `getAnthropicClient()`, `getOpenAIClient()`, `getFallbackClient()`
□ anthropic-direct.ts: Cập nhật 4 function nhận parameter `client` (GAP #1 Resolved)
□ anthropic-direct.ts: Refactor `anthropicChat()` với routing 3 tầng
□ anthropic-direct.ts: Refactor `anthropicChatWithHistory()` với routing 3 tầng
□ anthropic-direct.ts: Bỏ hardcode model names (claude-sonnet-4-..., gpt-4o-mini), đọc từ env.
□ .env.production: Tạo template
□ Chạy TC-01 đến TC-05
```

---

*Tạo bởi AWF Design Phase — 2026-04-10 (Đã fix 2 Gaps chuẩn bị code)*
