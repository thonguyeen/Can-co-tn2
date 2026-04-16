# 🎨 DESIGN: Mutual Match — "Tinder Bất Động Sản"

Ngày tạo: 2026-04-14
Dựa trên: Plan `plans/260414-2133-mutual-match/plan.md`
Status: **✅ APPROVED — Ready to Code**

---

## 1. Cách Lưu Thông Tin (Database)

📦 **SƠ ĐỒ LƯU TRỮ:**

Chỉ cần **1 bảng mới** — còn lại tái sử dụng các bảng đã có.

```
┌─────────────────────────────────────────────────────────────┐
│  👤 PROFILE (Người dùng — ĐÃ CÓ SẴN)                       │
│  ├── id, displayName, avatarUrl                             │
│  └── (Dùng để hiện công khai khi có ai thích bài mình)      │
└───────────────────────────┬─────────────────────────────────┘
                            │ 1 người đăng nhiều bài
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  📝 INTENT (Bài đăng CẦN/CÓ — ĐÃ CÓ SẴN)                  │
│  ├── id, title, rawText, type (CAN/CO)                      │
│  ├── userId (chủ bài)                                       │
│  └── isBot ⬅️ [FIELD ĐÃ CÓ: dùng để lọc Bot ra khỏi Swipe] │
└───────────────────────────┬─────────────────────────────────┘
                            │ 1 bài nhận nhiều lượt vuốt
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  ❤️ SWIPE_LIKES (Lượt vuốt — BẢNG MỚI ⭐)                   │
│  ├── id                                                     │
│  ├── userId  (Người vuốt là ai?)                            │
│  ├── intentId (Vuốt bài nào?)                               │
│  ├── action  ("LIKE" hoặc "SKIP")                           │
│  └── createdAt                                              │
│                                                             │
│  Ràng buộc: 1 user chỉ vuốt 1 bài 1 lần (unique)          │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Khi Khớp Đôi xảy ra ──►
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  💬 CONVERSATION (Phòng Thỏa Thuận — ĐÃ CÓ SẴN)            │
│  ├── id                                                     │
│  ├── intentId (Bài đăng kích hoạt cuộc hội thoại)          │
│  ├── userA, userB (2 người trong phòng)                     │
│  └── lastMessageAt                                          │
│                                                             │
│  ➡️ Tin nhắn lưu trong bảng MESSAGE (cũng đã có sẵn)        │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Đồng thời tạo ──►
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  🔔 NOTIFICATION (Thông báo — ĐÃ CÓ SẴN)                   │
│  ├── userId (Gửi cho ai?)                                   │
│  ├── type ("swipe_like" hoặc "mutual_match")                │
│  ├── title, message (Nội dung)                              │
│  ├── referenceId (Link đến Intent hoặc Conversation)        │
│  └── isRead (Đã đọc chưa?)                                 │
└─────────────────────────────────────────────────────────────┘
```

### Prisma Schema (Copy vào code luôn)

```prisma
// ═══════════════════════════════════════════════════════════════
// Mutual Match: Swipe Likes
// ═══════════════════════════════════════════════════════════════

model SwipeLike {
  id        String    @id @default(uuid())
  userId    String    @map("user_id")
  intentId  String    @map("intent_id")
  action    String    // "LIKE" | "SKIP"
  createdAt DateTime? @default(now()) @map("created_at") @db.Timestamptz

  @@unique([userId, intentId])
  @@index([intentId, action])
  @@map("swipe_likes")
}
```

---

## 2. Danh Sách Các Màn Hình (Điều Chỉnh)

Chỉ sửa/thêm 3 màn hình, không ảnh hưởng bất kỳ trang nào khác:

| # | Màn hình | Mục đích | Thay đổi |
|---|----------|----------|----------|
| 1 | **`/swipe`** (Khớp Nhanh) | Vuốt bài CẦN/CÓ | Đổi data source, gọi API khi vuốt |
| 2 | **`/swipe/likes`** [MỚI] | Xem ai đã thích bài mình | Danh sách notification "swipe_like" |
| 3 | **`/messages/[id]`** [MỚI] | Phòng Thỏa Thuận (Chat) | Giao diện tin nhắn P2P |
| 4 | **Home Feed `/`** | Không đổi | Tin Bot vẫn hiện ở đây bình thường |

---

## 3. Luồng Hoạt Động (User Journey)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 **HÀNH TRÌNH 1: Vuốt bình thường (Chưa Khớp)**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ User A mở trang `/swipe`.
2️⃣ Thấy bài *"Cho thuê phòng trọ cao cấp Q1"* của User B (người thật, không phải Bot).
3️⃣ Vuốt PHẢI (❤️ Thích).
4️⃣ Hệ thống kiểm tra: "User B có đang thích bài nào của A không?" → **KHÔNG**.
5️⃣ Hệ thống gửi thông báo cho B: *"Khoa Cần Mua quan tâm bài của bạn"* kèm avatar + tên (CÔNG KHAI).
6️⃣ User A thấy card biến mất, card tiếp theo hiện ra.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 **HÀNH TRÌNH 2: Khớp Đôi thành công (Mutual Match!)**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ User B đã thích bài *"Cần tìm phòng trọ Q1"* của User A trước đó (1 chiều).
2️⃣ Bây giờ User A mở `/swipe`, thấy bài *"Cho thuê phòng Q1"* của User B.
3️⃣ User A vuốt PHẢI (❤️).
4️⃣ Hệ thống kiểm tra: "B có đang thích bài nào của A không?" → **CÓ!**
5️⃣ 🎉 **KHỚP ĐÔI!** Popup celebration hiện lên:
   - Hiện Avatar A ❤️ Avatar B
   - Nút "💬 Vào Phòng Chat" và "Tiếp tục vuốt"
6️⃣ Hệ thống tạo Phòng Thỏa Thuận (`Conversation`) giữa A và B.
7️⃣ Cả A và B đều nhận thông báo: *"🎉 Khớp đôi thành công! Vào phòng thỏa thuận ngay."*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 **HÀNH TRÌNH 3: Người được thích xem thông báo**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ User B mở app, thấy badge ❤️ trên icon "Quan Tâm" (có số 1).
2️⃣ Bấm vào → Thấy danh sách: *"Khoa Cần Mua quan tâm bài Cho thuê phòng Q1 của bạn"*
   - Hiện rõ mặt mũi + tên User A (CÔNG KHAI, không che).
   - Nút "Xem bài của họ" → Mở Intent card của A.
3️⃣ User B đọc bài của A, quyết định: Vuốt PHẢI A → Khớp Đôi!, hoặc bỏ qua.

---

## 4. API Contract (Chi tiết)

### API 1: `POST /api/swipe`

| Field | Giá trị | Mô tả |
|-------|---------|-------|
| Method | POST | |
| Auth | Bắt buộc đăng nhập | |
| Body | `{ intentId: string, action: "LIKE" \| "SKIP" }` | |
| Response 200 (1 chiều) | `{ success: true, isMutualMatch: false }` | |
| Response 200 (khớp đôi) | `{ success: true, isMutualMatch: true, conversationId: "uuid" }` | |
| Response 400 | `{ error: "Không thể thích bài của chính mình" }` | |
| Response 401 | `{ error: "Unauthorized" }` | |

### API 2: `GET /api/swipe/feed`

| Field | Giá trị |
|-------|---------|
| Method | GET |
| Auth | Bắt buộc đăng nhập |
| Query | `?limit=20&offset=0` |
| Response 200 | `{ intents: Intent[], total: number }` |
| Filter | `isBot=false`, `userId != me`, `NOT đã vuốt` |

### API 3: `GET /api/swipe/matches`

| Field | Giá trị |
|-------|---------|
| Method | GET |
| Auth | Bắt buộc đăng nhập |
| Response 200 | `{ matches: [{ conversationId, intent, partner: Profile, lastMessage }] }` |

---

## 5. Checklist Kiểm Tra & Test Cases

### Tính năng: Lọc Bot khỏi Swipe

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**TC-01: Bot không lọt vào Swipe Feed**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- **Given:** DB có 5 Intent: 3 bài người thật (`isBot=false`), 2 bài Bot (`isBot=true`).
- **When:** Gọi `GET /api/swipe/feed`.
- **Then:** ✓ Chỉ nhận 3 bài. ✓ Không có bài nào có `isBot=true`.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**TC-02: Bài đã vuốt không hiện lại**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- **Given:** User A đã vuốt LIKE Intent X.
- **When:** Gọi `GET /api/swipe/feed` lần 2.
- **Then:** ✓ Intent X biến mất khỏi danh sách.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**TC-03: Không thấy bài của chính mình**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- **Given:** User A có 2 Intent đăng bán.
- **When:** Gọi `GET /api/swipe/feed`.
- **Then:** ✓ KHÔNG thấy bất kỳ bài nào của chính A.

### Tính năng: Khớp Đôi (Mutual Match)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**TC-04: One-way Like → Thông báo công khai**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- **Given:** A chưa bao giờ tương tác với B.
- **When:** A vuốt LIKE bài X của B.
- **Then:** ✓ API trả `isMutualMatch: false`.
         ✓ B nhận Notification type `swipe_like`.
         ✓ Nội dung chứa tên + avatar của A (CÔNG KHAI).
         ✓ KHÔNG tạo Conversation.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**TC-05: Mutual Match → Mở phòng thỏa thuận**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- **Given:** B đã LIKE bài Y của A trước đó.
- **When:** A vuốt LIKE bài X của B.
- **Then:** ✓ API trả `isMutualMatch: true, conversationId: "..."`.
         ✓ Tạo Conversation giữa A và B.
         ✓ Cả A LẪN B nhận Notification type `mutual_match`.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**TC-06: Chống Like bài của chính mình**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- **Given:** User A là chủ Intent X.
- **When:** A gọi `POST /api/swipe { intentId: X, action: "LIKE" }`.
- **Then:** ✓ Trả 400 Bad Request. ✓ Không tạo SwipeLike.

---

## 6. Flowchart Tổng Quan

```
User mở /swipe
      │
      ▼
GET /api/swipe/feed ──► Trả về Intent (lọc Bot + đã vuốt)
      │
      ▼
Vuốt TRÁI (Skip)              Vuốt PHẢI (Like)
      │                              │
      ▼                              ▼
Lưu SwipeLike              Lưu SwipeLike
action="SKIP"               action="LIKE"
      │                              │
      │                     Kiểm tra Mutual Match?
      │                        ┌─────┴─────┐
      │                     KHÔNG          CÓ
      │                        │            │
      │               Tạo Notification   Tạo Conversation
      │               (type: swipe_like) + 2 Notification
      │               cho chủ bài        (type: mutual_match)
      │                        │            │
      │                        │         Popup 🎉
      ▼                        ▼            ▼
          Hiện card tiếp theo
```

---

*Tạo bởi AWF 4.0 — Design Phase*
