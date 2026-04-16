# Plan: Mutual Match — "Tinder Bất Động Sản"
Created: 2026-04-14T21:33
Status: 🟡 In Progress

## Overview
Nâng cấp tính năng "Khớp Nhanh" (Swipe) thành sân chơi ĐỘC QUYỀN cho người thật, áp dụng cơ chế "Khớp Đôi" (Mutual Match) giống Tinder: cả hai phải cùng Thích nhau thì mới mở Phòng Thỏa Thuận. Tin Bot chỉ hiện trên Feed.

## Tech Stack
- **Frontend:** Next.js App Router (React 19), Framer Motion, Lucide Icons
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL (local Docker)
- **Existing Models tái sử dụng:** `Intent` (có sẵn `isBot`), `Notification`, `Conversation`, `Message`

## Key Design Decisions
1. **Lọc Bot:** Dùng field `isBot` (đã có sẵn trong Intent model) để loại khỏi Swipe feed.
2. **Bảng mới `SwipeLike`:** Lưu mỗi hành động Like/Skip của user lên một Intent cụ thể.
3. **Tái sử dụng `Conversation`:** Khi Mutual Match xảy ra, tạo record `Conversation` mới giữa 2 user liên quan → Phòng Thỏa Thuận.
4. **Tái sử dụng `Notification`:** Thông báo "Có người thích bài của bạn" → type = `swipe_like`.

## Phases

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 01 | Database — Model SwipeLike | ⬜ Pending | 0% |
| 02 | Backend API — Like, Match, Notify | ⬜ Pending | 0% |
| 03 | Frontend — Swipe Filter + Match UX | ⬜ Pending | 0% |
| 04 | Testing & Polish | ⬜ Pending | 0% |

## Quick Commands
- Thiết kế chi tiết DB/API: `/design`
- Bắt đầu code: `/code phase-01`
- Kiểm tra tiến độ: `/next`
- Lưu context: `/save-brain`
