# Phase 02: Backend API — Like, Mutual Match & Notify
Status: ⬜ Pending
Dependencies: Phase 01 (Database)

## Objective
Xây dựng 3 API endpoint cốt lõi: (1) Xử lý hành động vuốt, (2) Phát hiện Khớp Đôi, (3) Gửi thông báo + tạo Phòng Thỏa Thuận.

## Requirements

### API Endpoints

#### 1. `POST /api/swipe` — Xử lý Vuốt
```
Request:
  { intentId: string, action: "LIKE" | "SKIP" }

Logic:
  1. Xác thực user (requireAuth)
  2. Upsert vào bảng SwipeLike (userId + intentId)
  3. Nếu action === "LIKE":
     a. Tìm chủ sở hữu bài đăng (intent.userId)
     b. Kiểm tra Mutual Match (xem chủ bài có LIKE ngược lại bài nào của mình không)
     c. Nếu MUTUAL → Tạo Conversation + Thông báo "CHÚC MỪNG" cho cả 2
     d. Nếu 1 CHIỀU → Tạo Notification cho chủ bài (loại "swipe_like", công khai người like)
  4. Trả về { success, isMutualMatch }

Response 200:
  { success: true, isMutualMatch: false }
  hoặc
  { success: true, isMutualMatch: true, conversationId: "uuid..." }
```

#### 2. `GET /api/swipe/feed` — Lấy danh sách Intent cho Swipe
```
Request: (Query params)
  ?limit=20&offset=0

Logic:
  1. Xác thực user
  2. Lấy Intent WHERE:
     - isBot = false (LOẠI TIN BOT)
     - status = "active"
     - userId != currentUser (không thấy bài của chính mình)
     - id NOT IN (SELECT intentId FROM SwipeLike WHERE userId = currentUser)
       → Không hiện bài đã vuốt rồi
  3. Sắp xếp theo createdAt DESC (tin mới nhất trước)

Response 200:
  { intents: [...], total: number }
```

#### 3. `GET /api/swipe/matches` — Danh sách Phòng Thỏa Thuận
```
Logic:
  1. Xác thực user
  2. Lấy tất cả Conversation WHERE userA = me OR userB = me
  3. Kèm thông tin Intent liên quan + Profile đối phương
  4. Sắp xếp theo lastMessageAt DESC

Response 200:
  { matches: [{ conversationId, intent, partner, lastMessage }] }
```

### Mutual Match Detection Logic (Chi tiết)
```
Khi User A like Intent X (của User B):

1. Tìm tất cả Intent của User A đang active
2. Kiểm tra: User B đã LIKE bất kỳ Intent nào của User A chưa?
   → SELECT * FROM swipe_likes 
     WHERE userId = B 
     AND action = 'LIKE'
     AND intentId IN (SELECT id FROM intents WHERE userId = A)

3. Nếu TÌM THẤY → MUTUAL MATCH!
   → intentPairCanId = intent của A mà B đã like
   → intentPairCoId = intent X (của B mà A vừa like)  
   → Tạo Conversation(userA=A, userB=B, intentId=X)
   → Tạo Notification cho cả A và B (type = "mutual_match")

4. Nếu KHÔNG → One-way like
   → Tạo Notification cho B (type = "swipe_like")
   → Nội dung: "{Tên A} quan tâm đến bài '{Intent X title}' của bạn"
   → Kèm avatar + link đến profile A (CÔNG KHAI)
```

## Implementation Steps
1. [ ] Tạo `app/api/swipe/route.ts` — POST handler (Like/Skip)
2. [ ] Tạo `app/api/swipe/feed/route.ts` — GET handler (Feed lọc Bot)
3. [ ] Tạo `app/api/swipe/matches/route.ts` — GET handler (Phòng Thỏa Thuận)
4. [ ] Tạo `lib/swipe/match-detector.ts` — Logic phát hiện Mutual Match
5. [ ] Tạo `lib/swipe/notifier.ts` — Helper tạo Notification

## Files to Create/Modify
- `app/api/swipe/route.ts` — [NEW] Core swipe endpoint
- `app/api/swipe/feed/route.ts` — [NEW] Swipe feed (lọc bot)
- `app/api/swipe/matches/route.ts` — [NEW] Danh sách match
- `lib/swipe/match-detector.ts` — [NEW] Mutual match logic
- `lib/swipe/notifier.ts` — [NEW] Tạo thông báo

## Test Criteria
- [ ] POST /api/swipe với action "LIKE" → tạo record SwipeLike
- [ ] POST /api/swipe với action "SKIP" → tạo record SwipeLike
- [ ] GET /api/swipe/feed → KHÔNG trả về intent có isBot=true
- [ ] GET /api/swipe/feed → KHÔNG trả về intent đã vuốt rồi
- [ ] Mutual Match → tạo Conversation + 2 Notification (type "mutual_match")
- [ ] One-way Like → tạo 1 Notification (type "swipe_like") cho chủ bài, kèm tên + avatar

---
Next Phase: → phase-03-frontend.md
