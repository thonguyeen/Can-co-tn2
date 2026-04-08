# Plan: Hệ Thống Referral & Quản Lý User
Created: 2026-04-07T13:49
Status: 🟡 In Progress

## Overview
Xây dựng hệ thống Giới Thiệu Thành Viên 5 cấp bậc (Đồng → Kim Cương) tích hợp với Gamification hiện có. Gồm 2 phần: **Dashboard Referral của User** và **Admin Control Panel**. Điểm kiếm từ giới thiệu có thể tiêu để đẩy bài CẦN/CÓ lên top hoặc đổi quà tặng.

## Tech Stack
- **Frontend:** Next.js 15 App Router + CSS Modules (hiện có)
- **Backend:** Next.js API Routes + Prisma ORM (hiện có)
- **Database:** PostgreSQL (Local Docker + Supabase Prod)
- **Auth:** NextAuth.js v4 (hiện có)

## Phases

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 01 | Database Schema | ⬜ Pending | 0% |
| 02 | Backend — Referral & Boost API | ⬜ Pending | 0% |
| 03 | Backend — Admin API | ⬜ Pending | 0% |
| 04 | Frontend — User Dashboard (Referral, Leaderboard, Rewards) | ⬜ Pending | 0% |
| 05 | Frontend — Admin Control Panel | ⬜ Pending | 0% |
| 06 | Integration & Testing | ⬜ Pending | 0% |

## Quick Commands
- Bắt đầu: `/code phase-01`
- Kiểm tra tiến độ: `/next`
- Lưu context: `/save-brain`

## Acceptance Criteria
- [ ] User A giới thiệu User B qua link → A nhận điểm ngay lập tức
- [ ] Tier tự động nâng khi đủ điều kiện
- [ ] Bảng xếp hạng cập nhật theo thời gian thực (polling)
- [ ] Admin thấy toàn bộ bảng user + có thể cộng/trừ điểm thủ công
- [ ] Tiêu điểm đẩy bài → Bài xuất hiện đầu feed trong 24h
