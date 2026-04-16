# Phase 04: Testing & Polish
Status: ⬜ Pending
Dependencies: Phase 03 (Frontend)

## Objective
Chạy bộ kiểm tra toàn diện (Unit + Browser) để đảm bảo tính năng Mutual Match hoạt động chính xác end-to-end.

## Requirements

### 4.1. Script Test Tự Động
- [ ] Tạo `scripts/test-mutual-match.ts` — E2E test cho luồng Swipe

### Test Cases

#### TC-01: Lọc Bot khỏi Swipe Feed
- **Given:** DB có 5 Intent (3 người thật, 2 bot `isBot=true`)
- **When:** Gọi `GET /api/swipe/feed`
- **Then:** Chỉ trả về 3 intent (không có bot)

#### TC-02: Vuốt Like lưu đúng
- **Given:** User A chưa vuốt Intent X
- **When:** POST /api/swipe { intentId: X, action: "LIKE" }
- **Then:** Tạo record SwipeLike(userId=A, intentId=X, action="LIKE")

#### TC-03: Bài đã vuốt không hiện lại
- **Given:** User A đã vuốt LIKE Intent X
- **When:** Gọi GET /api/swipe/feed
- **Then:** Intent X KHÔNG xuất hiện trong kết quả

#### TC-04: One-way Like → Thông báo công khai
- **Given:** User A like Intent X (của User B). User B chưa like bài nào của A.
- **When:** POST /api/swipe { intentId: X, action: "LIKE" }
- **Then:** 
  - API trả `isMutualMatch: false`
  - Tạo Notification cho B: type="swipe_like", chứa tên + avatar A

#### TC-05: Mutual Match → Phòng Thỏa Thuận
- **Given:** User B đã like Intent Y (của User A) trước đó. 
            Giờ User A like Intent X (của User B).
- **When:** POST /api/swipe { intentId: X, action: "LIKE" }
- **Then:**
  - API trả `isMutualMatch: true, conversationId: "..."`
  - Tạo Conversation giữa A và B
  - Tạo 2 Notification (type="mutual_match") cho cả A và B

#### TC-06: Không Like bài của chính mình
- **Given:** User A có Intent X
- **When:** Gọi GET /api/swipe/feed
- **Then:** Intent X KHÔNG xuất hiện (loại bài của chính mình)

### 4.2. Browser UI Test
- [ ] Mở localhost:4000/swipe → Xác nhận không có tin Bot
- [ ] Vuốt phải (Like) → Card biến mất mượt mà
- [ ] Mutual Match → Popup celebration hiện lên
- [ ] Tab "Quan Tâm" → Hiện đúng danh sách người đã like

## Implementation Steps
1. [ ] Tạo `scripts/test-mutual-match.ts`
2. [ ] Chạy test script → Fix lỗi nếu có
3. [ ] Browser test thủ công bằng subagent
4. [ ] Cập nhật `CHANGELOG.md`
5. [ ] Chạy `/save-brain` để lưu context

## Files to Create/Modify
- `scripts/test-mutual-match.ts` — [NEW] E2E test script
- `CHANGELOG.md` — [MODIFY] Thêm entry mới

## Test Criteria
- [ ] `npx tsx scripts/test-mutual-match.ts` → 6/6 tests passed
- [ ] Browser walkthrough → Tất cả UI elements hoạt động đúng

---
✅ DONE → Feature sẵn sàng! Chạy `/deploy` hoặc `/save-brain`.
