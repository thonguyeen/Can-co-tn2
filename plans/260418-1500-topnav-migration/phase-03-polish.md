# Phase 03: Polish & Responsive Test
Status: ⬜ Pending
Dependencies: Phase 02 ✅

## Objective
Kiểm tra hiển thị, xử lý edge case, và đảm bảo không có side effect.

## Implementation Steps
1. [ ] Kiểm tra `GlobalChatbot` FAB vẫn hiển thị đúng góc (không bị che bởi TopNavbar)
2. [ ] Đảm bảo `FeedTab`, `MapRadarTab`, `SwipeMatchTab` không bị TopNavbar che phủ nội dung (kiểm tra padding-top)
3. [ ] Test trên mobile (TopNavbar ẩn, chỉ BottomNavMobile hiện)

## Test Criteria
- [ ] Desktop (1280px+): TopNavbar hiện, Sidebar ẩn
- [ ] Mobile (375px): TopNavbar ẩn, BottomNavMobile hiện
- [ ] Chatbot FAB không bị che
- [ ] Content không chạm TopNavbar
