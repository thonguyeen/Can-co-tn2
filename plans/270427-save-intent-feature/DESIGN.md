# 🎨 DESIGN: Tính Năng "Lưu Bài" (Save Intent)

**Ngày tạo:** 2026-04-27  
**Tính năng:** Save/Bookmark cho Intent posts  
**Dựa trên:** brainstorm-save-feature.md  

---

## 1. Cách Lưu Thông Tin (Database Schema)

### Sơ đồ dữ liệu

```
┌──────────────────────────────────────────────────────────┐
│  👤 Profile (profiles)                                   │
│  ├── id (UUID)                                           │
│  ├── displayName                                         │
│  └── ...                                                 │
└──────────────────────┬───────────────────────────────────┘
                       │ 1 user có nhiều bài đã lưu
                       ▼
┌──────────────────────────────────────────────────────────┐
│  🔖 IntentSave [MỚI] (intent_saves)                      │
│  ├── user_id   (FK → profiles.id)  ← Ai lưu             │
│  ├── intent_id (FK → intents.id)   ← Lưu bài nào        │
│  └── created_at                    ← Lưu lúc nào         │
│  PRIMARY KEY: (user_id, intent_id)                       │
│  → 1 user chỉ lưu 1 bài 1 lần                           │
└──────────────────────┬───────────────────────────────────┘
                       │ Nhiều lượt lưu trỏ vào 1 Intent
                       ▼
┌──────────────────────────────────────────────────────────┐
│  📋 Intent (intents)                                     │
│  ├── id (UUID)                                           │
│  ├── type (CAN/CO)                                       │
│  ├── rawText                                             │
│  └── ...                                                 │
└──────────────────────────────────────────────────────────┘
```

> ⚠️ KHÔNG đụng vào bảng `saves` (liên kết `Post`) — để tránh migration conflict

### Prisma model thêm vào schema.prisma

```prisma
model IntentSave {
  userId    String   @map("user_id")
  intentId  String   @map("intent_id")
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz

  user   Profile @relation(fields: [userId], references: [id], onDelete: Cascade)
  intent Intent  @relation(fields: [intentId], references: [id], onDelete: Cascade)

  @@id([userId, intentId])
  @@map("intent_saves")
}
```

Cần thêm relation vào:
```prisma
// Profile model — thêm:
intentSaves IntentSave[]

// Intent model — thêm:
intentSaves IntentSave[]
```

---

## 2. Các Màn Hình Bị Ảnh Hưởng

| Màn hình | File | Thay đổi |
|----------|------|----------|
| Feed (trang chủ) | `IntentCard.tsx` điều phối qua `SavedProvider` | Không đổi UI, chỉ đổi persistence |
| Context Provider | `lib/saved-context.tsx` | Thêm API call, giữ localStorage làm optimistic cache |
| Trang Đã Lưu | `app/(main)/saved/page.tsx` | Query `intent_saves` thay vì `saves` |
| API Toggle | `app/api/intents/[id]/save/route.ts` | **[MỚI]** giống pattern `posts/[id]/save` |
| API List | `app/api/intents/saved/route.ts` | **[MỚI]** trả danh sách intent_id đã lưu |

---

## 3. Luồng Hoạt Động

### Hành trình 1: User bấm "Lưu" trên feed

```
User bấm nút Lưu
      │
      ▼
AuthGate check → chưa login → mở dialog đăng nhập (✅ đã có sẵn)
      │ đã login
      ▼
Optimistic UI: toggle trạng thái ngay (UX mượt mà)
      │
      ▼
Gọi API POST /api/intents/{id}/save
      │
      ├── 200 OK → giữ trạng thái optimistic, sync localStorage
      │
      └── Lỗi → hoàn tác UI (revert)

Trang /saved → query DB → hiển thị đúng bài đã lưu ✅
```

### Hành trình 2: User mở app lần 2 (khởi tạo context)

```
App mount → SavedProvider useEffect khởi động
      │
      ▼
Gọi GET /api/intents/saved → nhận [intentId, intentId, ...]
      │
      ├── Có session → dùng data từ DB (source of truth)
      │
      └── Không có session → dùng localStorage (guest mode)
```

---

## 4. Thiết Kế API

### `POST /api/intents/[id]/save`
> Toggle save — nếu chưa lưu thì lưu, nếu đã lưu thì bỏ lưu

```
Auth: Bearer (session cookie)
Method: POST
Path: /api/intents/{intentId}/save

Response 200:
{
  "saved": true  // hoặc false nếu vừa unsave
}

Response 401: { "error": "Unauthorized" }
Response 404: { "error": "Intent not found" }
```

### `GET /api/intents/saved`
> Lấy danh sách intent ID user đã lưu (để khởi tạo context)

```
Auth: Bearer (session cookie)
Method: GET
Path: /api/intents/saved

Response 200:
{
  "ids": ["uuid-1", "uuid-2", ...]
}

Response 401: { "ids": [] }
```

---

## 5. Checklist Kiểm Tra (Acceptance Criteria)

### ✅ Bug Fix Core
- [ ] Bấm "Lưu" trên IntentCard → gọi API → lưu vào DB
- [ ] Vào trang `/saved` → thấy đúng các bài đã lưu
- [ ] Đổi thiết bị / xóa cache → dữ liệu vẫn còn (sync từ DB)
- [ ] Bấm "Lưu" lần 2 → bỏ lưu (toggle hoạt động)

### ✅ Auth
- [ ] Chưa đăng nhập → bấm "Lưu" → mở dialog đăng nhập
- [ ] Sau đăng nhập → hành động được thực hiện
- [ ] API trả 401 nếu không có session

### ✅ Optimistic UI
- [ ] UI đổi ngay lập tức khi bấm (không đợi API)
- [ ] Nếu API lỗi → UI revert về trạng thái cũ

### ✅ Khởi tạo đúng trạng thái
- [ ] Sau đăng nhập, các bài đã lưu trước đó vẫn hiện "Đã lưu"
- [ ] Refresh page → trạng thái "Đã lưu" được giữ nguyên

---

## 6. Test Cases

### TC-01: Happy Path — Lưu bài mới
```
Given: User đã đăng nhập, đang xem feed
When:  Bấm "Lưu" trên 1 IntentCard
Then:  ✓ Nút đổi sang "Đã lưu" (màu vàng) ngay lập tức
       ✓ API POST /api/intents/{id}/save trả 200 { saved: true }
       ✓ Vào /saved → thấy bài đó trong danh sách
```

### TC-02: Toggle — Bỏ lưu
```
Given: User đã lưu bài X, đang xem feed
When:  Bấm "Đã lưu" trên bài X (lần 2)
Then:  ✓ Nút đổi về "Lưu" (màu xám)
       ✓ API POST trả 200 { saved: false }
       ✓ Vào /saved → bài X biến mất
```

### TC-03: Auth Gate
```
Given: User CHƯA đăng nhập
When:  Bấm "Lưu" trên bất kỳ bài nào
Then:  ✓ Mở dialog đăng nhập
       ✓ KHÔNG lưu vào DB, KHÔNG đổi UI
```

### TC-04: Persistence
```
Given: User đã lưu 3 bài trên thiết bị A
When:  Mở app trên thiết bị B (cùng tài khoản)
Then:  ✓ /saved hiển thị đúng 3 bài
       ✓ Feed hiển thị đúng 3 bài đó với trạng thái "Đã lưu"
```

### TC-05: DB chứa UUIDs thật (intent query)
```
Given: 1 bài mock (id bắt đầu bằng 'i-')
When:  Bấm "Lưu"
Then:  ✓ UI toggle hoạt động
       ✓ Nếu id không phải UUID thật → API có thể skip (không crash)
       Note: Hiện tại intent mock ID format = 'i-001', v.v.
```

---

## 7. Các File Cần Thay Đổi

```
app/
├── prisma/
│   └── schema.prisma                         [MODIFY] thêm IntentSave + relations
│
├── app/api/intents/
│   ├── [id]/save/route.ts                    [NEW] toggle save API
│   └── saved/route.ts                        [NEW] get saved IDs API
│
├── lib/
│   └── saved-context.tsx                     [MODIFY] thêm API sync
│
└── app/(main)/
    └── saved/page.tsx                        [MODIFY] query intent_saves
```

**Deploy command sau khi code:**
```bash
./deploy.sh --migrate
```

---

## 8. Bước Tiếp Theo

```
1️⃣ Code phase-01: Schema + Migration
   → Thêm IntentSave model vào schema.prisma

2️⃣ Code phase-02: API routes
   → /api/intents/[id]/save + /api/intents/saved

3️⃣ Code phase-03: Context + UI
   → Cập nhật saved-context.tsx + /saved page

4️⃣ Deploy
   → ./deploy.sh --migrate (cần migrate vì thêm bảng mới)
```

---

*Thiết kế bởi AWF /design — Cần & Có Platform*
