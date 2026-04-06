# Phase 04: Global Chatbot AI
Status: ⬜ Pending
Dependencies: Phase 01 (Layout)

## Objective
Gắn nút Bot hình tròn trôi nổi (FAB) ở góc phải dưới, luôn hiện trên MỌI tab.
Bấm vào → Bung ra ô Chat Popup overlay (không chuyển trang).
MVP: Giả lập AI response "Đang xử lý…". Đấu API thật khi cần.

## Requirements
### Functional
- [ ] Nút Bot FAB fixed ở góc phải dưới, hiện trên tất cả tabs
- [ ] Nút Bot chớp nháy animation (pulse ring gradient)
- [ ] Bấm vào → Chat panel bung lên đè trên màn hình (portal/overlay)
- [ ] Chat panel: Header + Message list + Input bar
- [ ] Gõ tin nhắn → AI giả lập trả lời "Đang xử lý..." → response sau 2 giây
- [ ] Bấm X hoặc bấm ngoài → đóng panel (giữ history trong state)
- [ ] Scroll tự xuống cuối khi có tin nhắn mới
- [ ] Responsive: Desktop panel w-[380px], Mobile full-width

### Non-Functional
- [ ] Smooth open/close animation (framer-motion scale + fade)
- [ ] Panel không block sidebar navigation
- [ ] Unread badge count trên FAB

## User Flow (từ DESIGN.md)
1. User ở bất kỳ Tab nào
2. Thấy icon Bot 🤖 góc dưới chớp nháy
3. Nhấn vào nút Bot → Ô chat bung lên overlay
4. Gõ text → Nhận phản hồi giả lập
5. Bấm X → Panel đóng, quay lại dùng app

## Implementation Steps
1. [ ] Tạo `GlobalChatbot.tsx` — FAB button + panel container
2. [ ] Tạo `ChatPanel.tsx` — Chat panel UI (header, messages, input)
3. [ ] Tạo `useChat.ts` — Hook quản lý messages + AI response sim
4. [ ] Gắn vào `hybrid/page.tsx` (SuperAppContainer)
5. [ ] Test responsive + mọi tab

## Files to Create/Modify
- `app/components/chat/GlobalChatbot.tsx` [NEW] — FAB + panel toggle
- `app/components/chat/ChatPanel.tsx` [NEW] — Chat messages UI
- `app/hooks/useChat.ts` [NEW] — Message state + simulated AI
- `app/app/hybrid/page.tsx` [MODIFY] — Import GlobalChatbot

## Test Criteria
- [ ] Bot FAB hiện ở mọi tab (home, map, swipe, chat, apps)
- [ ] Bấm FAB → Panel bung ra mượt (no page reload)
- [ ] Gõ text + Enter → Tin nhắn user hiện, AI trả lời sau 2 giây
- [ ] Đóng panel → Mở lại → History vẫn còn
- [ ] Desktop w-[380px], Mobile full-width

---
✅ All Phases Complete sau phase này!
