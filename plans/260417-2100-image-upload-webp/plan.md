# Plan: Image Upload + WebP Auto-Conversion
Created: 2026-04-17T21:00:00+07:00
Status: 🟡 In Progress

## Overview
Nâng cấp tính năng upload ảnh trong ComposeIntent (loại CÓ) với:
- Auto-convert sang **WebP** phía client (Canvas API) để tiết kiệm ~80% dung lượng
- Resize ảnh lớn xuống max **1080px** width
- Giảm giới hạn từ 10 → **5 ảnh** mỗi bài
- Hiển thị **kích thước trước/sau** convert + % tiết kiệm
- UI drag-to-reorder ảnh

## Tech Stack
- Frontend: Canvas API + `createImageBitmap()` + `canvas.toBlob('image/webp', 0.82)`
- Backend: Existing `/api/intents/[id]/images` — chỉ cần update validation
- Storage: `public/uploads/intents/[id]/` (local disk)

## Phases

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 01 | Client-side WebP Converter | ⬜ Pending | 0% |
| 02 | ComposeIntent UI Upgrade | ⬜ Pending | 0% |
| 03 | Backend Validation Update | ⬜ Pending | 0% |
| 04 | Testing & Polish | ⬜ Pending | 0% |

## Quick Commands
- Start Phase 1: `/code phase-01`
- Check progress: `/next`
- Save context: `/save-brain`
