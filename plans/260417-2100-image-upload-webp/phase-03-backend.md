# Phase 03: Backend Validation Update
Status: ⬜ Pending
Dependencies: Phase 02

## Objective
Cập nhật API `/api/intents/[id]/images` để:
- Giảm max files từ 10 → 5
- Ưu tiên nhận `image/webp`
- Lưu file với extension `.webp`

## Implementation Steps

### 1. Update validation
- [ ] `files.length > 10` → `files.length > 5`
- [ ] Error message: "Maximum 5 images per upload"

### 2. File naming
- [ ] Khi MIME là `image/webp` → lưu `.webp` extension
- [ ] Giữ backward compatibility cho JPEG/PNG (không reject)

### 3. Optional: Thêm check tổng số ảnh đã upload
- [ ] Query `SELECT COUNT(*) FROM intent_images WHERE intent_id = $id`
- [ ] Nếu đã có >= 5 → reject upload mới

## Files to Modify
- `app/api/intents/[id]/images/route.ts`

## Test Criteria
- [ ] Upload 6 ảnh → reject với message "Maximum 5 images"
- [ ] Upload 5 WebP → success, files saved as .webp
- [ ] Upload mix JPEG + WebP → all saved correctly

---
Next Phase: phase-04-testing.md
