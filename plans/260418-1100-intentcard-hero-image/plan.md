# Plan: IntentCard Hero Image + Badge Overlay Redesign
Created: 2026-04-18T11:02
Status: 🟡 In Progress

## Overview
Nâng cấp IntentCard hiển thị ảnh theo phong cách Homigo.life:
- Ảnh Hero chiếm full-width card cho bài CÓ BÁN có ảnh
- Badge overlay trực tiếp trên ảnh (loại tin, trạng thái "Mới", lưu)
- Thumbnail row bên dưới khi có 2+ ảnh

## Inspiration
Phân tích từ Homigo.life (khảo sát 18/04/2026):
- Ảnh lớn chiếm ~55% card, rounded-xl, tối ưu cho BĐS
- Badge "Cho thuê" top-left, ❤️ top-right, "Mới ⚡" bottom-left
- AI Score ★ 95/100 dưới ảnh

## Tech Stack
- Frontend: React + Next.js Image component
- Styling: Vanilla CSS (inline + globals.css)
- No new dependencies needed

## Phases

| Phase | Name | Status | Tasks |
|-------|------|--------|-------|
| 01 | Hero Image Layout | ⬜ Pending | 5 |
| 02 | Badge Overlay System | ⬜ Pending | 4 |
| 03 | Thumbnail Row | ⬜ Pending | 3 |
| 04 | Testing & Polish | ⬜ Pending | 3 |

**Tổng:** 15 tasks | Ước tính: ~1 session

## Quick Commands
- Start: `/code`
- Check progress: `/next`
