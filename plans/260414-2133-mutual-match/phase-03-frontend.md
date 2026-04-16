# Phase 03: Frontend — Swipe Filter + Match UX
Status: ⬜ Pending
Dependencies: Phase 02 (Backend API)

## Objective
Cập nhật giao diện Swipe để: (1) Chỉ hiện bài người thật, (2) Gọi API khi vuốt, (3) Hiệu ứng "CHÚC MỪNG" khi Mutual Match, (4) Trang thông báo "Ai đã thích bài của bạn".

## Requirements

### 3.1. Cập nhật Swipe Page (`app/swipe/page.tsx`)

#### Thay đổi nguồn dữ liệu:
- **TRƯỚC:** Dùng mock data (`GENERATED_INTENTS` + `CRAWLED_INTENTS`)
- **SAU:** Gọi `GET /api/swipe/feed` (đã lọc bot + bài đã vuốt)

#### Thay đổi nút vuốt:
- **TRƯỚC:** `handleSwipe()` chỉ chuyển card, không lưu gì
- **SAU:** `handleSwipe()` gọi `POST /api/swipe` với `action: "LIKE"` hoặc `"SKIP"`
  - Nếu API trả `isMutualMatch: true` → Hiện popup "CHÚC MỪNG" với confetti 🎉
  - Nếu API trả `isMutualMatch: false` → Chuyển card bình thường

### 3.2. Popup Mutual Match (Component mới)

```
┌──────────────────────────────────┐
│        🎉 KHỚP ĐÔI! 🎉         │
│                                  │
│   [Avatar A]  ❤️  [Avatar B]    │
│                                  │
│  Cả hai đều quan tâm đến nhau!  │
│  Hãy bắt đầu thỏa thuận ngay.  │
│                                  │
│  ┌──────────────────────────┐    │
│  │   💬 Vào Phòng Chat      │    │
│  └──────────────────────────┘    │
│                                  │
│        [Tiếp tục vuốt]          │
└──────────────────────────────────┘
```

- **Nút "Vào Phòng Chat"** → Điều hướng đến `/messages/{conversationId}`
- **Nút "Tiếp tục vuốt"** → Đóng popup, tiếp tục swipe

### 3.3. Tab "Quan Tâm" (Left Sidebar)

Trong Sidebar trái hiện có nút "Quan Tâm" (icon ❤️). Khi nhấn vào sẽ hiện danh sách:
- **Phần 1: Ai đã thích bài của mình** (Notifications type `swipe_like`)
  - Hiển thị Avatar + Tên + Bài đăng liên quan
  - Nút "Xem bài của họ" → Chuyển đến intent card để Like lại
- **Phần 2: Phòng Thỏa Thuận** (Mutual matches)
  - Danh sách Conversation đã tạo
  - Hiện avatar đối phương + tin nhắn cuối + thời gian

### 3.4. Badge Thông Báo

- Trên icon ❤️ (Quan Tâm): Hiện số badge khi có like mới chưa đọc
- Trên icon 💬 (Tin Nhắn): Hiện số badge khi có tin nhắn chưa đọc

## Implementation Steps
1. [ ] Refactor `app/swipe/page.tsx` — Đổi data source sang `/api/swipe/feed`
2. [ ] Cập nhật `handleSwipe()` — Gọi `POST /api/swipe`
3. [ ] Tạo component `MutualMatchPopup.tsx` — Hiệu ứng celebration
4. [ ] Tạo trang `app/swipe/likes/page.tsx` — Tab "Quan Tâm" (ai đã thích)
5. [ ] Tạo trang `app/messages/[id]/page.tsx` — Phòng Thỏa Thuận (Chat P2P)
6. [ ] Cập nhật Sidebar badges — Hiện số thông báo chưa đọc

## Files to Create/Modify
- `app/swipe/page.tsx` — [MODIFY] Đổi data source + handleSwipe
- `components/swipe/MutualMatchPopup.tsx` — [NEW] Popup chúc mừng
- `app/swipe/likes/page.tsx` — [NEW] Danh sách ai đã thích
- `app/messages/[id]/page.tsx` — [NEW] Phòng Chat Thỏa Thuận
- `components/swipe/NavItem.tsx` — [MODIFY] Thêm badge động

## Test Criteria
- [ ] Mở /swipe → KHÔNG thấy bài có tag Bot/isBot
- [ ] Vuốt phải → API được gọi, bài biến mất, không hiện lại
- [ ] Mutual Match → Popup "CHÚC MỪNG" hiện lên với 2 avatar
- [ ] Nhấn "Vào Phòng Chat" trên popup → Mở đúng Conversation
- [ ] Tab "Quan Tâm" → Hiện danh sách người đã like bài mình (CÔNG KHAI tên + ảnh)
- [ ] Badge số hiện đúng số notification chưa đọc

---
Next Phase: → phase-04-testing.md
