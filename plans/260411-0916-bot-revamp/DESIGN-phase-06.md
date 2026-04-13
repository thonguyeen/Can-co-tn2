# 🎨 DESIGN: Phase 06 - Global Chatbot Personalization (NHA.AI)

Ngày tạo: 2026-04-13  
Dựa trên: `plans/260411-0916-bot-revamp/phase-06-chatbot.md`  
Status: **✅ APPROVED - Ready to Code**

---

## 📊 Phân tích hiện trạng

### Chatbot hiện tại đang làm được:
- Chat với AI qua `POST /api/chat/route.ts`
- Gửi lịch sử tạm thời lên server (5 tin gần nhất dạng string)
- UI component: `GlobalChatbot.tsx` + `ChatPanel.tsx` + `useChat.ts`

### Những gì THIẾU (cần thêm trong Phase 06):
- ❌ Không lưu lịch sử vào DB (mất khi reload)
- ❌ Không biết user đang xem tab gì (BĐS, cho thuê...)
- ❌ System Prompt bị hardcode trong `route.ts` (admin không đổi được)
- ❌ Không inject MarketReport thật vào câu trả lời
- ❌ Không có giới hạn quota (abuse risk)

---

## 📦 Phần 1: Cơ Sở Dữ Liệu (Data Model)

### Đã có sẵn (Phase 01):
```
AIChatMessage {
  id        UUID (primary key)
  userId    String   ← ID của user đã đăng nhập
  role      String   ← "user" | "bot"
  content   Text     ← Nội dung tin nhắn
  metadata  JSON     ← tags, category, context... (mở rộng)
  createdAt Timestamp
  Index: (userId, createdAt) ← Tìm kiếm theo user + thời gian
}
```

**Không cần migration thêm gì!** AIChatMessage đã đủ nếu chúng ta thêm metadata thông minh.

### Metadata structure (thiết kế mới):
```json
{
  "category": "real_estate",     ← Tab đang mở
  "sessionId": "sess_xxx",        ← Group theo phiên chat
  "hasMarketContext": true,        ← AI có dùng MarketReport không?
  "reportId": "d1b0caf1-...",     ← Report nào được inject
  "tokensUsed": 312               ← Theo dõi quota
}
```

---

## 🚪 Phần 2: API Endpoints (Cửa Giao Tiếp)

### 2.1. `POST /api/chat` — REWRITE

**Luồng hoạt động mới:**
```
Nhận request
│
├── 1. Parse body: { messages, activeCategory?, sessionId? }
├── 2. Lấy userId từ NextAuth session (optional)
├── 3. Kiểm tra quota: ≤ 50 msg/user/ngày (nếu đã login)
│
├── 4. Load Bot Config từ DB:
│      Bot.findUnique({ handle: 'nha_ai' }) → systemPrompt, knowledgeText
│      (Fallback: dùng hardcoded prompt nếu bot chưa có trong DB)
│
├── 5. Detect market query:
│      Nếu message chứa "giá", "thị trường", "quận", "khu vực" → flag = true
│
├── 6. Context Injection (nếu flag = true):
│      Load MarketReport mới nhất phù hợp category
│      Cắt nội dung ≤ 500 token để tránh context quá dài
│
├── 7. Build full context:
│      systemPrompt + knowledgeText + marketContext + 20 msgs gần nhất
│
├── 8. Gọi AI
│
├── 9. Save vào DB (nếu userId có):
│      AIChatMessage.create({ userId, role: 'user', content: msg })
│      AIChatMessage.create({ userId, role: 'bot', content: reply })
│
└── 10. Return response
```

**Request Body:**
```typescript
{
  messages: { role: 'user' | 'bot', text: string }[];
  activeCategory?: string; // 'real_estate', 'for_rent'...
  sessionId?: string;      // Nếu muốn group sessions
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    text: string;
    hasMarketContext: boolean; // Để FE hiển thị badge "Có dữ liệu thật"
  }
}
```

---

### 2.2. `GET /api/chat/history` — CREATE NEW

**Auth:** Bắt buộc (middleware check session)  
**Query Params:** `limit=30&before=<timestamp>` (hỗ trợ pagination sau)

**Response:**
```typescript
{
  success: true,
  data: {
    messages: {
      id: string;
      role: 'user' | 'bot';
      text: string;
      createdAt: string;
      fromHistory: true; // Flag để FE style khác
    }[];
    hasMore: boolean; // Còn tin cũ hơn không?
  }
}
```

---

## 🛠️ Phần 3: Module `lib/chat/context-builder.ts` — CREATE NEW

Module helper tách biệt logic build context ra khỏi API route:

```
buildChatContext(userId, latestMessage, category)
│
├── detectMarketKeywords(message):
│       Keywords: giá, thị trường, quận, Q1-Q12, Bình Thạnh, mặt bằng,
│                 bao nhiêu, đắt, rẻ, xu hướng, tháng, năm...
│       Returns: boolean
│
├── loadMarketContext(category):
│       prisma.marketReport.findFirst({
│         where: { category },
│         orderBy: { createdAt: 'desc' }
│       })
│       → Cắt content ≤ 1500 ký tự để không quá token
│
├── loadUserPreferences(userId):
│       prisma.intent.groupBy({
│         where: { userId, status: 'active' },
│         by: ['district', 'category'],
│         _count: true, take: 3
│       })
│       → Extract vùng quan tâm (VD: "User thường hỏi Quận 7, apartment")
│
└── Returns: {
      systemContext: string,   ← Inject vào system prompt
      hasMarketData: boolean
    }
```

---

## 📱 Phần 4: Frontend Changes

### 4.1. `useChat.ts` — MODIFY

State mới thêm vào:
```typescript
const [isLoadingHistory, setIsLoadingHistory] = useState(false);
const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
const [activeCategory, setActiveCategory] = useState('real_estate');
```

Effect mới — load history khi mount:
```typescript
useEffect(() => {
  // Chỉ load khi user đã login (kiểm tra via simple GET /api/chat/history)
  loadChatHistory();
}, []);
```

Sửa `sendMessage` — thêm `activeCategory` vào request:
```typescript
body: JSON.stringify({ messages: currentMessages, activeCategory })
```

---

### 4.2. `GlobalChatbot.tsx` — MODIFY

- Nhận prop `activeTab?: string` từ parent
- Truyền `activeTab` xuống `useChat` hook

---

### 4.3. `ChatPanel.tsx` — MODIFY

- Hiển thị **skeleton loading** khi `isLoadingHistory = true`
- Tin nhắn từ history có style nhẹ hơn (opacity thấp hơn, timestamp rõ)
- Nếu user chưa login: hiện banner nhỏ dưới welcome message:
  ```
  💡 Đăng nhập để lưu lịch sử chat của bạn
  ```
- Badge nhỏ "📊 Có dữ liệu thị trường" nếu BE trả về `hasMarketContext: true`

---

## 🔁 Phần 5: Luồng Hoạt Động (User Journey)

### Hành trình 1: User đăng nhập lần đầu dùng chat
```
Mở app → Chatbot button hiện (FAB)
     → Click mở → Chat panel mở ra
     → [isLoadingHistory = true] → Skeleton spinner 2s
     → GET /api/chat/history → 0 messages → Chỉ hiện Welcome message
     → User gõ câu đầu tiên → POST /api/chat
     → AI trả lời → Save cả 2 vào DB
     → Đóng app → Mở lại → History load OK ✅
```

### Hành trình 2: User hỏi giá thị trường
```
User gõ: "Giá nhà Q7 hiện tại thế nào?"
     → detectMarketKeywords → TRUE
     → loadMarketContext('real_estate') → Get báo cáo từ AnalystBot (Phase 05!)
     → Inject vào system context: "BÁO CÁO THỊ TRƯỜNG MỚI NHẤT: [Tân Bình 2.34 tỷ...]"
     → AI không bịa − trả lời dựa trên số liệu thật
     → FE hiện badge "📊 Có dữ liệu thực" ở góc tin nhắn
```

### Hành trình 3: Guest (chưa login)
```
Mở chatbot → Không call /api/chat/history
     → Chat bình thường nhưng trong memory chỉ
     → Hiện banner: "Đăng nhập để lưu lịch sử"
     → Reload → Mất tin nhắn (ephemeral)
```

---

## ✅ Phần 6: Acceptance Criteria (Điều Kiện Hoàn Thành)

| # | Tính năng | Điều kiện PASS |
|---|-----------|----------------|
| AC-01 | History Persistence | Login → Chat 3 tin → Đóng → Mở lại → 3 tin vẫn còn |
| AC-02 | Reload safe | Reload trang → Mở chatbot → History load đúng thứ tự |
| AC-03 | Market Context | Hỏi "Giá nhà Q7?" → Reply có số liệu từ MarketReport |
| AC-04 | Guest mode | Unlogged user → Chat OK → Reload → Mất tin (expected) |
| AC-05 | DB Prompt | Đổi systemPrompt NHA.AI trong Admin → Chatbot thay đổi behavior |
| AC-06 | Quota | 51+ msgs/ngày → API trả lỗi "Đã đạt giới hạn hôm nay" |
| AC-07 | Category context | Đang ở tab "Cho thuê" → NHA.AI trả lời theo context cho thuê |

---

## 🧪 Phần 7: Test Cases

```
TC-01: Happy Path - Login + History
  Given:  User đã login
  When:   Chat 3 tin, đóng panel, mở lại
  Then:   3 tin cũ xuất hiện với style mờ hơn tin mới

TC-02: Market Data Injection
  Given:  AnalystBot đã tạo ít nhất 1 MarketReport
  When:   Hỏi "Giá nhà quận 7 bao nhiêu?"
  Then:   AI reply đề cập đến con số thực từ báo cáo
          Badge "📊 Dữ liệu thực" xuất hiện

TC-03: Guest Ephemeral
  Given:  User chưa login
  When:   Chat → Reload trang → Mở chatbot
  Then:   Chỉ có Welcome message, không có history cũ
          Banner "Đăng nhập để lưu lịch sử" hiển thị

TC-04: Admin System Prompt Override
  Given:  Bot(handle='nha_ai') tồn tại trong DB với systemPrompt tùy chỉnh
  When:   User chat
  Then:   AI behave theo systemPrompt mới, không dùng hardcode

TC-05: Quota Enforcement
  Given:  User đã chat 50 msg trong ngày
  When:   Gửi tin nhắn thứ 51
  Then:   API trả về 429 + message "Bạn đã đạt giới hạn 50 tin nhắn hôm nay."

TC-06: Category Context Switching
  Given:  GlobalChatbot nhận prop activeTab="for_rent"
  When:   Hỏi "Khu vực nào rẻ nhất?"
  Then:   AI trả lời theo context cho thuê, không nhầm sang mua bán

TC-07: Empty Market Report (Fallback)
  Given:  Không có MarketReport nào trong DB
  When:   User hỏi về thị trường
  Then:   AI vẫn trả lời (không crash), nhưng không bịa số liệu
          Note: Không hiện badge dữ liệu thực
```

---

## ⚡ Phần 8: Implementation Order (Thứ tự code)

Đây là thứ tự đề xuất để tránh phụ thuộc chồng nhau:

```
1. lib/chat/context-builder.ts          ← Pure functions, test được ngay
2. POST /api/chat/route.ts (rewrite)    ← Backend core
3. GET /api/chat/history/route.ts       ← Backend simple
4. hooks/useChat.ts (update)            ← Frontend state
5. ChatPanel.tsx (update)               ← UI polish
6. GlobalChatbot.tsx + page.tsx         ← Wiring
```

---

## ⚠️ Rủi Ro & Biện Pháp

| Rủi ro | Mức độ | Biện pháp |
|--------|--------|-----------|
| MarketReport inject quá dài → token overflow | Trung bình | Cắt ≤ 1500 ký tự, chỉ lấy stats JSON |
| History load chậm (N+1 query) | Thấp | Index sẵn có (userId, createdAt), limit 30 |
| User abuse → 50 msg limit | Trung bình | Count query mỗi request (cache 1 phút) |
| Bot 'nha_ai' chưa có trong DB | Thấp | Fallback về hardcoded prompt trong code |
| Guest history leak qua sessionStorage | Thấp | Không lưu gì local, thuần ephemeral |

---

*Tạo bởi AWF 4.0 - Design Phase | Phase 06: NHA.AI Personalization*
