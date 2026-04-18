# Phase 01: Hero Image Layout
Status: ⬜ Pending
Dependencies: None

## Objective
Thay đổi IntentCard: khi bài CÓ có ảnh → hiển thị ảnh đầu tiên full-width phía trên nội dung, chiếm toàn bộ chiều rộng card, tỉ lệ 16:10, rounded-2xl, giống Homigo.life.

## Implementation Steps
1. [ ] Tách `ImageGrid` component thành `HeroImage` (ảnh chính) + `ThumbnailStrip` (ảnh phụ)
2. [ ] Di chuyển ảnh lên **phía trên header** (user info) trong IntentCard
3. [ ] Ảnh hero: `aspect-[16/10]`, `rounded-t-2xl`, `object-cover`, full-width
4. [ ] Fallback: bài không có ảnh → giữ layout cũ (text-only card)
5. [ ] Đảm bảo `next/image` với `fill` + `sizes` prop tối ưu

## Files to Modify
- `app/components/intent/IntentCard.tsx` — Restructure card layout, new HeroImage component

## Test Criteria
- [ ] Card CÓ + ảnh → ảnh hero full-width phía trên
- [ ] Card CÓ + 0 ảnh → card text-only, không bể layout
- [ ] Card CẦN → không hiện ảnh (giữ nguyên)
