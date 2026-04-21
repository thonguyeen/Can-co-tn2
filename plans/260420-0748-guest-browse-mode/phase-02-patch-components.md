# Phase 02: Patch Interactive Components
Status: ⬜ Pending
Dependencies: Phase 01

## Objective
Thêm `useAuthGate()` vào tất cả components có action buttons. Guest thấy UI đầy đủ nhưng click → modal.

## Implementation Steps

### Feed Components
1. [ ] `components/feed/PostCard.tsx`
   - handleLike → wrap với requireAuth
   - handleSave → wrap với requireAuth
   - Comment button → wrap với requireAuth

### Map Components
2. [ ] `components/map/MapPopupCard.tsx`
   - Like button → wrap với requireAuth
   - Chat button → wrap với requireAuth

### Intent Components
3. [ ] `components/intent/ComposeIntent.tsx`
   - Toàn bộ form submission → wrap với requireAuth
   - Hoặc: overlay "Đăng nhập để đăng bài" khi chưa auth

### Comment Components
4. [ ] `components/comments/CommentList.tsx`
   - Submit comment → wrap với requireAuth
   - Like comment → wrap với requireAuth

### Bot Components
5. [ ] `components/bot/FollowButton.tsx`
   - Follow/Unfollow → wrap với requireAuth

### Chat Page
6. [ ] `app/(main)/can-co/chat/[id]/page.tsx`
   - Gửi tin nhắn → wrap với requireAuth
   - Hoặc: redirect to login nếu chưa auth (vùng chat cần thiết auth)

## Files to Modify
- `components/feed/PostCard.tsx` — [MODIFY]
- `components/map/MapPopupCard.tsx` — [MODIFY]
- `components/intent/ComposeIntent.tsx` — [MODIFY]
- `components/comments/CommentList.tsx` — [MODIFY]
- `components/bot/FollowButton.tsx` — [MODIFY]
- `app/(main)/can-co/chat/[id]/page.tsx` — [MODIFY]

## Test Criteria
- [ ] Guest click ❤️ Thích trên PostCard → modal login hiện
- [ ] Guest click 🔖 Lưu → modal login hiện
- [ ] Guest click Tạo bài → modal login hiện
- [ ] Guest click Chat → modal login hoặc redirect
- [ ] Guest click Follow Bot → modal login hiện
- [ ] Logged-in user → mọi action hoạt động bình thường (no regression)
