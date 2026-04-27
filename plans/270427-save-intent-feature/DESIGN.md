# 🎨 DESIGN: Tính Năng Lưu Bài Viết Ưa Thích

**Ngày:** 2026-04-27  
**Dựa trên:** `plans/270427-save-intent-feature/plan.md`

---

## 1. Luồng Hoạt Động

```
Guest bấm "Lưu"
      │
      ▼
requireAuth() ──── Chưa login ──→ Modal "Đăng nhập để tiếp tục"
      │                                      │
   Đã login                               User đăng nhập
      │                                      │
      └──────────────────────────────────────┘
                       │
                       ▼
              toggleSave(intentId) [optimistic]
                       │
              Nút đổi màu AMBER ngay │
              (Đã lưu / Bookmark fill) │
                       │
              POST /api/intents/[id]/save
                       │
          ─────────────┴──────────────
          │                          │
        200 OK                   Lỗi (500)
        Lưu DB ✅               Revert màu nút
                                 (trở về xám)
```

```
User vào /profile → tab "Đã lưu"
      │
      ▼
ProfileTabs fetch GET /api/intents/saved
      │
      ▼
API trả về { ids: ["uuid-1", "uuid-2", ...] }
      │
BUT: cần trả về full intent data, không chỉ IDs
      │
      ▼
Fetch GET /api/intents/saved?full=true (option mới)
hoặc: ProfileTabs dùng endpoint riêng /api/profile/saved-intents
      │
      ▼
Render danh sách IntentCard/SocialPostCard
```

---

## 2. Thiết Kế Dữ Liệu

**Bảng `intent_saves`** (đã có trong DB):

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| `id` | UUID | PK |
| `user_id` | UUID | FK → Profile |
| `intent_id` | UUID | FK → Intent |
| `created_at` | Timestamp | Thời điểm lưu |

**Bảng index:** `UNIQUE(user_id, intent_id)` — ngăn lưu trùng.

---

## 3. API Contract

### `POST /api/intents/[id]/save`
Toggle save (upsert hoặc delete):
```json
// Request: không cần body
// Response 200 đã lưu: { saved: true }
// Response 200 bỏ lưu: { saved: false }
// Response 401: { error: "Unauthorized" }
```

### `GET /api/intents/saved`
Trả danh sách IDs **và** full intent data:
```json
{
  "ids": ["uuid-1", "uuid-2"],
  "intents": [ ...full intent objects ]  // mới thêm
}
```

---

## 4. Các Màn Hình Liên Quan

### Feed (Trang chủ)
- Nút **"Lưu"** (Bookmark icon + text)
- State: xám = chưa lưu | amber + filled = đã lưu
- Click khi chưa login → Modal đăng nhập
- Click khi đã login → Toggle ngay (optimistic)

### Profile `/profile` → Tab "Đã lưu"
- Hiện spinner khi đang load
- Hiện danh sách `SocialPostCard` (compact)  
- Hiện EmptyState nếu chưa lưu tin nào
- Dùng API `GET /api/intents/saved?full=true`

### Trang `/saved` (dedicated page)
- Đã hoạt động đúng ✅ (query raw SQL từ `intent_saves`)
- Không thay đổi

---

## 5. Components thay đổi

| Component | Thay đổi |
|-----------|---------|
| `SocialPostCard.tsx:359` | Revert: `toggleSave(id)` → `requireAuth(() => toggleSave(id))` |
| `IntentCard.tsx:486` | Revert: `toggleSave(id)` → `requireAuth(() => toggleSave(id))` |
| `ProfileTabs.tsx:174-180` | Thay `<EmptyState>` bằng fetch + render list |
| `api/intents/saved/route.ts` | Thêm `?full=true` option trả về full intent data |

---

## 6. Acceptance Criteria

### ✅ Nút Lưu trên Feed
- [ ] Guest bấm → Hiện modal đăng nhập (không lưu)
- [ ] Đã login bấm → Nút chuyển amber + text "Đã lưu" ngay (optimistic)
- [ ] API lưu thành công → state giữ nguyên
- [ ] API lỗi → nút revert về xám + text "Lưu"
- [ ] F5 sau khi lưu → nút vẫn amber (fetch từ DB)

### ✅ Tab "Đã lưu" trong Profile
- [ ] Vào tab → Hiện spinner load
- [ ] Load xong → Hiện danh sách bài đã lưu
- [ ] Chưa lưu tin nào → Hiện EmptyState "Chưa lưu tin nào"
- [ ] Bài trong list → Click được, dẫn đến trang chi tiết

---

## 7. Test Cases

**TC-01: Guest bấm Lưu**
- Given: chưa đăng nhập
- When: bấm "Lưu" trên bất kỳ bài nào
- Then: Modal "Đăng nhập để tiếp tục" hiện ra, nút KHÔNG đổi màu

**TC-02: Login xong bấm Lưu**
- Given: đã đăng nhập
- When: bấm "Lưu" trên bài chưa lưu
- Then: Nút chuyển amber + "Đã lưu" trong <300ms

**TC-03: Bỏ lưu**
- Given: bài đang ở trạng thái "Đã lưu"
- When: bấm nút "Đã lưu"
- Then: Nút revert về xám, API DELETE record

**TC-04: Kiểm tra Profile tab**
- Given: đã lưu ít nhất 1 bài
- When: vào `/profile` → click tab "Đã lưu"
- Then: Hiện bài đã lưu đó trong danh sách

**TC-05: Persist qua session**
- Given: đã lưu bài, đóng trình duyệt
- When: mở lại, đăng nhập lại
- Then: Feed vẫn hiện nút amber cho bài đã lưu

---

## 8. Bước Tiếp Theo

→ `/code` để implement theo thứ tự: Revert → Fix API → Fix ProfileTabs → Test
