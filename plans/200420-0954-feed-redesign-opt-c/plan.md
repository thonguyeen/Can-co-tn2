# Plan: Feed Redesign — Option C (Hybrid Social + BĐS)
Created: 2026-04-20 09:54
Status: 🟡 In Progress

## Overview

Thiết kế lại `IntentCard` và `FeedTab` theo hướng **Hybrid Social + BĐS** (Option C):
- **Hero image full-width** ở đầu card (như Airbnb)
- **Price badge overlay** góc phải ảnh
- **AI highlight** trong text (giá in đậm indigo, địa chỉ gạch chân)
- **Bot comment preview** inline với teal accent
- **Emoji reaction bar** (🔥 Hot, 💰 Giá hợp lý, 👍 Quan tâm)
- **Action bar** 3 nút: Quan tâm · Đàm phán (indigo CTA) · Lưu
- Layout **single-column** thay vì 2-col grid trên desktop

## Component cần tạo/sửa

| File | Hành động |
|------|-----------|
| `components/intent/SocialPostCard.tsx` | **[NEW]** Component mới thay thế IntentCard |
| `components/tabs/FeedTab.tsx` | Cập nhật sang dùng SocialPostCard |
| `components/intent/IntentCard.tsx` | Giữ nguyên (dùng cho trang detail) |

## Phases

| Phase | Tên | Status | Progress |
|-------|-----|--------|----------|
| 01 | Design SocialPostCard Component | ⬜ Pending | 0% |
| 02 | Refactor FeedTab sang single-column | ⬜ Pending | 0% |
| 03 | Testing & Polish | ⬜ Pending | 0% |

## Quick Commands
- Start Phase 1: `/code phase-01`
- Verification: `/test`
