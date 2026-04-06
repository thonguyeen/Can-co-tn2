# Plan: PostgreSQL & NextAuth Migration
Created: 2026-04-03T10:50:00
Status: 🟡 In Progress

## Overview
Chiến dịch "Cắt đứt 100%": Rời bỏ hoàn toàn hệ sinh thái Supabase (Database, Auth, Realtime) để chuyển về tự quản trị trên PostgreSQL thần thánh. Sử dụng Prisma làm ORM và NextAuth.js làm cổng đăng nhập.

## Tech Stack
- Frontend: Next.js App Router (Untouched)
- Backend: Next.js API Routes / Server Actions
- Database: PostgreSQL (Neon / RDS / Self-hosted)
- ORM: Prisma
- Auth: NextAuth.js (v4/v5)
- Realtime: HTTP Polling (15s Feed, 3s Chat)

## Phases

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 01 | Setup Environment & Prisma ORM | ✅ Complete | 100% |
| 02 | NextAuth Migration (Đăng nhập) | ✅ Complete | 100% |
| 03 | API & Data Access Rewrite | ✅ Complete | 100% |
| 04 | Realtime & Storage Replacement | ✅ Complete | 100% |
| 05 | Data Migration & Go Live | ⬜ Pending | 0% |

## Quick Commands
- Bắt đầu: `/code phase-01`
- Kiểm tra tiến độ: `/next`
- Lưu trí nhớ: `/save-brain`
