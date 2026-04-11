# Phase 06: Global Chatbot Personalization (NHA.AI)
Status: ⬜ Pending
Dependencies: Phase 01 (AIChatMessage model), Phase 05 (MarketReport data)

## Objective
Biến chatbot trang chủ (NHA.AI) thành trợ lý cá nhân hóa: lưu lịch sử chat qua các phiên, nhớ thông tin user (quan tâm khu vực nào, đã hỏi gì), và trả lời bằng dữ liệu thật từ MarketReport + Intents.

## Requirements

### Functional
- [ ] Chat history persistence: Lưu mỗi tin nhắn vào `AIChatMessage` bảng
- [ ] Load history: Khi mở chatbot → load 30 tin nhắn gần nhất từ DB
- [ ] Auth-aware: Chỉ lưu/load history khi user đã đăng nhập (guest = ephemeral)
- [ ] Context injection: Trước khi gọi AI, inject:
  - Lịch sử chat gần nhất (20 messages)
  - MarketReport mới nhất (nếu user hỏi về giá/thị trường)
  - User profile summary (nếu có: tên, khu vực quan tâm từ Intents user đã tạo)
- [ ] System prompt từ DB: Đọc `Bot(handle='nha_ai').systemPrompt` thay vì hardcode
- [ ] Category-aware: Nếu user đang xem tab BĐS → NHA.AI tự chỉnh sang BĐS context

### Non-Functional
- [ ] Chatbot vẫn hoạt động cho khách chưa đăng nhập (nhưng không lưu history)
- [ ] Max 50 messages/user/ngày (tránh abuse)
- [ ] Response time < 5s

## Implementation Steps

### A. Backend

1. [ ] **Tạo `POST /api/chat/route.ts` (rewrite)**:
   ```typescript
   // 1. Lấy userId từ session (optional)
   // 2. Load history từ DB (nếu có userId)
   // 3. Load NHA.AI bot config từ DB (systemPrompt, knowledgeText)
   // 4. Load MarketReport mới nhất (inject vào context nếu user hỏi thị trường)
   // 5. Build full prompt: systemPrompt + knowledgeText + history + marketContext
   // 6. Gọi AI
   // 7. Save user message + AI response vào AIChatMessage
   // 8. Return response
   ```

2. [ ] **Tạo `GET /api/chat/history/route.ts`**:
   - Auth required
   - Query: `AIChatMessage WHERE userId = ? ORDER BY createdAt DESC LIMIT 30`
   - Return JSON array

3. [ ] **Tạo helper `lib/chat/context-builder.ts`**:
   - `buildChatContext(userId, latestMessage)`:
     - Load user's Intents (khu vực quan tâm)
     - Load MarketReport mới nhất cho khu vực đó
     - Format thành context string inject vào prompt
   - `detectUserIntent(message)`: phát hiện user hỏi về giá, khu vực, so sánh...

### B. Frontend

4. [ ] **Update `hooks/useChat.ts`**:
   - Thêm `useEffect` load history khi mount: `GET /api/chat/history`
   - State `isLoadingHistory`: hiển thị skeleton khi đang load
   - Tin nhắn từ history có `fromHistory: true` flag (style khác nhẹ)

5. [ ] **Update `components/chat/ChatPanel.tsx`**:
   - Khi load history: scroll xuống cuối
   - Hiển thị "Xem thêm lịch sử" nếu có > 30 messages
   - Khi user chưa đăng nhập: hiển thị note "Đăng nhập để lưu lịch sử chat"

6. [ ] **Update `components/chat/GlobalChatbot.tsx`**:
   - Truyền `activeTab` (category context) xuống ChatPanel
   - Gửi kèm `activeTab` trong body POST /api/chat để AI biết context

## Files to Create/Modify

### Create:
- `app/lib/chat/context-builder.ts` — Context injection logic
- `app/app/api/chat/history/route.ts` — GET chat history

### Modify:
- `app/app/api/chat/route.ts` — Rewrite: auth, DB persistence, context injection
- `app/hooks/useChat.ts` — Load history from API
- `app/components/chat/ChatPanel.tsx` — History display
- `app/components/chat/GlobalChatbot.tsx` — Pass context
- `app/app/page.tsx` — Pass activeTab to GlobalChatbot

## Test Criteria
- [ ] Đăng nhập → Mở chatbot → Chat 3 tin → Đóng → Mở lại → 3 tin vẫn còn
- [ ] Reload trang → Mở chatbot → History load đúng
- [ ] Hỏi "Giá nhà Q7?" → NHA.AI trả lời có số liệu thật từ MarketReport
- [ ] Guest (chưa đăng nhập) → Chat hoạt động bình thường, nhưng reload mất history
- [ ] Đổi systemPrompt NHA.AI trong Admin → Chatbot behavior thay đổi

---
Next Phase: [Phase 07 - Integration Testing](./phase-07-testing.md)
