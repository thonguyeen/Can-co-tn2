# Phase 03: Thumbnail Row
Status: ⬜ Pending
Dependencies: Phase 01

## Objective
Khi bài có 2+ ảnh, hiển thị row thumbnail nhỏ ngay dưới ảnh hero. Click thumbnail → swap với hero image.

## Implementation Steps
1. [ ] Tạo `ThumbnailStrip` component: row ngang, gap-1, max 4 thumbnails + "+N" badge
2. [ ] Thumbnail: 56x56px, rounded-lg, object-cover, border khi active
3. [ ] Click thumbnail chưa cần swap (phase đơn giản: chỉ hiển thị, không interactive)

## Files to Modify
- `app/components/intent/IntentCard.tsx` — Add ThumbnailStrip below HeroImage

## Test Criteria
- [ ] 1 ảnh → không hiện thumbnail row (chỉ hero)
- [ ] 2-4 ảnh → hiện đủ thumbnails
- [ ] 5 ảnh → hiện 4 thumbnails + "+1" badge
