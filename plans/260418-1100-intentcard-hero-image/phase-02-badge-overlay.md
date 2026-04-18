# Phase 02: Badge Overlay System
Status: ⬜ Pending
Dependencies: Phase 01

## Objective
Thêm các badge floating trực tiếp trên ảnh hero, kiểu Homigo.life:
- Top-left: Loại tin (CÓ BÁN / CẦN TÌM) — pill badge màu
- Top-right: Nút Lưu (Bookmark icon)
- Bottom-left: Badge "⚡ Mới" (nếu bài < 1 giờ)
- Bottom-right: Trust Score badge (VD: "91% ✓")

## Implementation Steps
1. [ ] Tạo `ImageOverlay` wrapper component chứa các badge positioned absolute
2. [ ] Badge loại tin: bg semi-transparent, text white, top-left `rounded-br-xl`
3. [ ] Badge "Mới": lightning icon + text, gradient amber, chỉ hiện khi `createdAt < 1h ago`
4. [ ] Trust badge: bottom-right, semi-transparent dark, hiển thị `trustScore`%

## Files to Modify
- `app/components/intent/IntentCard.tsx` — Add overlay badges to HeroImage

## Test Criteria
- [ ] Badge CÓ/CẦN hiện đúng màu trên ảnh
- [ ] "Mới" chỉ hiện khi bài < 1 giờ
- [ ] Trust badge hiện đúng % từ data
- [ ] Badges không che ảnh quá nhiều (max 25% diện tích)
