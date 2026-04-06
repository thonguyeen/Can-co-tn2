# Phase 01: API Endpoint (Server Chat)
Status: ⬜ Pending

## Objective
Tạo 1 cổng giao tiếp POST (Route handler) nhận tin nhắn từ FrontEnd, mang đi chất vấn OpenAI và đem câu trả lời về.

## Requirements
### Functional
- [ ] Xây route `POST /api/chat`
- [ ] Gọi hàm `chat()` trong `lib/ai/client.ts` 

## Implementation Steps
1. [ ] Tạo file `app/api/chat/route.ts`
2. [ ] Thiết lập logic `systemPrompt` (Tính cách Bot).
3. [ ] Trả về chuỗi JSON chứa `message`.

## Files to Create/Modify
- `app/api/chat/route.ts` - [NEW] Backend Chat Gateway.
