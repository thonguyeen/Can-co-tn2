# Phase 01 + 02 + 03: Option D — Floating Header + Content Overlap
Status: ⬜ Pending

## Mục tiêu
Loại bỏ Sticky Header ngang, thay bằng floating buttons + content overlap.

---

## Layout Target

```
┌─────────────────────────────────┐
│         HERO IMAGE (ảnh BDS)    │  ← h-[280px] hoặc aspect-video
│  [← Back]          [🛡 20%]     │  ← floating buttons, absolute
│         (còn 20px)              │
└────────────────┬────────────────┘
                 │ ← content đè lên (overlap -mt-5 hoặc -mt-6)
┌────────────────▼────────────────┐
│  Bán nhà 40m2, 1 trệt 1 gác... │  ← rounded-t-3xl, bg-white, shadow
│  ... nội dung ...               │
└─────────────────────────────────┘
```

---

## Implementation Steps

### Phase 01: Remove sticky bar + Add floating buttons
- [ ] Xóa `{/* ── Sticky Back Bar ── */}` block (lines ~118-135)
- [ ] Thêm hero image zone với `relative`, `h-[300px]`
- [ ] Nút Back floating: `absolute top-4 left-4` — viên tròn trắng/blur
- [ ] Trust badge floating: `absolute top-4 right-4` — pill trắng/blur

### Phase 02: Content overlap card
- [ ] Bọc toàn bộ nội dung trong `relative z-10` container
- [ ] Áp dụng `-mt-6 rounded-t-3xl` để card nội dung đè lên hình
- [ ] Đảm bảo `bg-white`, `shadow-[0_-8px_20px_rgba(0,0,0,0.08)]` cho depth

### Phase 03: Verify & Polish
- [ ] Kiểm tra trên màn hình không có ảnh (intent CẦN, không có hình)
    → Fallback: hiện gradient slate placeholder, floating buttons vẫn hiện
- [ ] Kiểm tra scroll behavior — content card không bị overlapped bởi TopNavbar
- [ ] Capture screenshot so sánh before/after

---

## Edge Cases
| Case | Xử lý |
|------|--------|
| Intent không có ảnh | Hero = gradient placeholder (slate-100 → slate-200) |
| Title rất ngắn | OK — title nằm trong content card |
| TopNavbar h-16 | Page bắt đầu từ `pt-0` (không cần padding-top cho sticky bar) |

---

## Files
- MODIFY: `app/app/(main)/can-co/intent/[id]/page.tsx`

## Acceptance Criteria
- [ ] Không còn sticky header ngang
- [ ] Back button floating góc trên trái, có backdrop-blur
- [ ] Trust badge floating góc trên phải, có backdrop-blur
- [ ] Content card đè lên ~24px vào hero image (rounded-t-3xl)
- [ ] Scroll smooth — content card che hình ảnh khi scroll lên
- [ ] No regression trên màn hình không có ảnh
