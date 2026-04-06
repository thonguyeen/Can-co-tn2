# Phase 03: Swipe Match (Tinder UI)
Status: ⬜ Pending
Dependencies: Phase 02 (useFeedData hook)

## Objective
Biến `SwipeMatchTab` từ placeholder thành giao diện vuốt thẻ kiểu Tinder — duyệt Deal BĐS nhanh bằng 1 ngón tay. Dùng `framer-motion` (đã cài v12.38.0) cho animation drag/swipe.

## Requirements
### Functional
- [ ] Stack thẻ bài chồng lên nhau (3-4 thẻ visible, thẻ trên cùng draggable)
- [ ] Kéo thẻ trái (❌ Bỏ qua) → thẻ bay ra + fade, thẻ kế hiện lên
- [ ] Kéo thẻ phải (✅ Quan tâm) → thẻ bay + overlay "MATCH!" rực rỡ
- [ ] Nút bấm dưới card stack: ❌ Bỏ qua | ⭐ Super Like | ✅ Quan tâm
- [ ] Khi hết thẻ → hiện "Đã duyệt hết!" + nút "Tải thêm"
- [ ] Reuse data thật từ `useFeedData` hook

### Non-Functional  
- [ ] Animation 60fps mượt mà trên mobile
- [ ] Responsive (mobile-first, card chiếm ~85% viewport width)

## User Flow (từ DESIGN.md)
1. User mở app → tab `swipe` là default
2. Nhìn thấy thẻ BĐS đầu tiên (hình + info)
3. Kéo trái → bỏ qua, thẻ mới  
4. Kéo phải → "MATCH!" overlay
5. Bấm "Vào phòng đàm phán" → chuyển tab `chat`

## Implementation Steps
1. [ ] Tạo `SwipeCard.tsx` — 1 thẻ bài đơn lẻ với framer-motion drag
2. [ ] Tạo `CardStack.tsx` — Container quản lý stack thẻ + swipe logic  
3. [ ] Tạo `MatchOverlay.tsx` — Animation overlay khi match
4. [ ] Rewrite `SwipeMatchTab.tsx` — Ghép components + wire data
5. [ ] Test responsive (mobile viewport)

## Files to Create/Modify
- `app/components/swipe/SwipeCard.tsx` [NEW] — Thẻ bài draggable
- `app/components/swipe/CardStack.tsx` [NEW] — Stack manager
- `app/components/swipe/MatchOverlay.tsx` [NEW] — Match celebration
- `app/components/tabs/SwipeMatchTab.tsx` [MODIFY] — Container chính

## Test Criteria
- [ ] Kéo thẻ sang phải > 100px → trigger "Quan tâm"
- [ ] Kéo thẻ sang trái > 100px → trigger "Bỏ qua"
- [ ] Thẻ snap back nếu kéo < 100px (cancel)
- [ ] Stack hiện đúng 3 thẻ xếp chồng (perspective effect)
- [ ] Overlay "MATCH!" hiện + auto-dismiss sau 3 giây
- [ ] Responsive: card chiếm đúng viewport trên mobile

---
Next Phase: Phase 04 - Global Chatbot AI
