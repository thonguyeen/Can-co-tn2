# Phase 01: Database — Model SwipeLike
Status: ⬜ Pending
Dependencies: Không

## Objective
Thêm bảng `SwipeLike` vào schema Prisma để lưu lại hành động "Thích" hoặc "Bỏ qua" mà user thực hiện khi vuốt trong Khớp Nhanh.

## Requirements

### Functional
- [ ] Thêm model `SwipeLike` vào `prisma/schema.prisma`
- [ ] Chạy `prisma db push` để đồng bộ vào DB local

### Model Design

```prisma
model SwipeLike {
  id        String    @id @default(uuid())
  
  // Người vuốt
  userId    String    @map("user_id")
  
  // Intent được vuốt
  intentId  String    @map("intent_id")
  
  // "LIKE" hoặc "SKIP"
  action    String    // "LIKE" | "SKIP"
  
  createdAt DateTime? @default(now()) @map("created_at") @db.Timestamptz

  @@unique([userId, intentId])  // 1 user chỉ vuốt 1 intent 1 lần
  @@index([intentId, action])   // Truy vấn nhanh "ai đã like intent này?"
  @@map("swipe_likes")
}
```

### Logic Notes
- Khi user vuốt PHẢI (❤️): Tạo record `action = "LIKE"`
- Khi user vuốt TRÁI (✖️): Tạo record `action = "SKIP"`
- Nếu user đổi ý: UPDATE record hiện có (upsert)

## Implementation Steps
1. [ ] Thêm model `SwipeLike` vào `schema.prisma` (cuối file, khu vực CẦN & CÓ)
2. [ ] Chạy `npx prisma generate` để cập nhật Prisma Client
3. [ ] Chạy `npx prisma db push` để đẩy schema vào DB local
4. [ ] Kiểm tra bảng `swipe_likes` đã xuất hiện trong DB

## Files to Create/Modify
- `prisma/schema.prisma` — Thêm model SwipeLike

## Test Criteria
- [ ] `npx prisma db push` thành công, không lỗi
- [ ] Có thể tạo một SwipeLike record bằng Prisma Studio hoặc script

---
Next Phase: → phase-02-backend-api.md
